import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Navigate,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/auth-provider";
import { useTheme } from "@/contexts/theme-context";
import { Toaster } from "@tasky/ui";
import { AppLayout } from "@/layouts/app-layout";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { BoardPage } from "@/pages/board";
import { BoardListPage } from "@/pages/board-list";
import { useAuth } from "@/contexts/auth-context";

function RootComponent() {
  const { theme } = useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster theme={theme} />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

function IndexComponent() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return (
    <AppLayout>
      <BoardListPage />
    </AppLayout>
  );
}

function BoardComponent() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return (
    <AppLayout>
      <BoardPage />
    </AppLayout>
  );
}

function LoginComponent() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  return <LoginPage />;
}

function RegisterComponent() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  return <RegisterPage />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

const boardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/board/$boardId",
  component: BoardComponent,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginComponent,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  boardRoute,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { routeTree };
