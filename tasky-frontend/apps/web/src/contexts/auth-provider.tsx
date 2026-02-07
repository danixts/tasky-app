import { useCallback, useMemo, useState, useEffect, type ReactNode } from 'react'
import { useLogin, useRegister, useLogout, getUsername, isAuthenticated, clearAuth } from '@tasky/services'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext, type AuthContextType } from './auth-context'

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const queryClient = useQueryClient()
  const [username, setUsername] = useState<string | null>(getUsername)
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()

  useEffect(() => {
    setUsername(getUsername())
  }, [])

  const login = useCallback<AuthContextType['login']>(
    async (user: string, password: string) => {
      try {
        const result = await loginMutation.mutateAsync({ username: user, password })
        setUsername(result.username)
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Error al iniciar sesion') }
      }
    },
    [loginMutation]
  )

  const register = useCallback<AuthContextType['register']>(
    async (user: string, email: string, password: string) => {
      try {
        const result = await registerMutation.mutateAsync({ username: user, email, password })
        setUsername(result.username)
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Error al registrarse') }
      }
    },
    [registerMutation]
  )

  const logout = useCallback<AuthContextType['logout']>(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      clearAuth()
    }
    setUsername(null)
    queryClient.clear()
  }, [logoutMutation, queryClient])

  const contextValue = useMemo<AuthContextType>(
    () => ({
      username,
      isAuthenticated: isAuthenticated(),
      login,
      register,
      logout,
    }),
    [username, login, register, logout]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
