import { createRootRoute, createRoute, createRouter, Outlet, Navigate } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/contexts/auth-provider'
import { Toaster } from '@/components/toaster'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { BoardPage } from '@/pages/board'
import { ChartsPage } from '@/pages/charts'
import { AppLayout } from '@/layouts/app-layout'
import { AuthLayout } from '@/layouts/auth-layout'
import { useAuth } from '@/contexts/auth-context'

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  )
}

const rootRoute = createRootRoute({
  component: RootComponent,
})

function IndexComponent() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return <BoardPage />
}

function ChartsComponent() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return <ChartsPage />
}

function LoginComponent() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" />
  }
  return <LoginPage />
}

function RegisterComponent() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" />
  }
  return <RegisterPage />
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
})

const chartsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/charts',
  component: ChartsComponent,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginComponent,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterComponent,
})

const routeTree = rootRoute.addChildren([indexRoute, chartsRoute, loginRoute, registerRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export { routeTree }
