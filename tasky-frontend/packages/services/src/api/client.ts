import axios from 'axios'
import type { RefreshTokenRequest, AuthResponse } from '../types/auth'

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  errors: { field: string; message: string }[] | null
}

const TOKEN_KEY = 'tasky_token'
const REFRESH_KEY = 'tasky_refresh_token'
const USERNAME_KEY = 'tasky_username'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function saveAuth(token: string, refreshToken: string, username: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearAuth()
        globalThis.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Token ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<ApiResponse<AuthResponse>>(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
          { refreshToken } satisfies RefreshTokenRequest,
          { headers: { 'Content-Type': 'application/json' } }
        )

        const newToken = data.data.token
        saveAuth(newToken, data.data.refreshToken, data.data.username)
        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Token ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export { apiClient }
