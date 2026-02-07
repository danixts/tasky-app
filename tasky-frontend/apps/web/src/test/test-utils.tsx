import { type ReactNode } from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext, type AuthContextType } from '@/contexts/auth-context'

const defaultAuth: AuthContextType = {
  username: 'testuser',
  isAuthenticated: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
}

interface WrapperProps {
  children: ReactNode
  auth?: Partial<AuthContextType>
}

function createWrapper(authOverrides?: Partial<AuthContextType>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ ...defaultAuth, ...authOverrides }}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { auth?: Partial<AuthContextType> }
): RenderResult {
  const { auth, ...renderOptions } = options || {}
  return render(ui, { wrapper: createWrapper(auth), ...renderOptions })
}

export { defaultAuth }
