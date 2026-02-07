import { useMutation } from '@tanstack/react-query'
import { apiClient, saveAuth, clearAuth } from '../api/client'
import type { ApiResponse } from '../api/client'
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth'

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/api/v1/auth/login',
        data
      )
      const auth = response.data.data
      saveAuth(auth.token, auth.refreshToken, auth.username)
      return auth
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/api/v1/auth/register',
        data
      )
      const auth = response.data.data
      saveAuth(auth.token, auth.refreshToken, auth.username)
      return auth
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/api/v1/auth/logout')
      } finally {
        clearAuth()
      }
    },
  })
}
