import { type ReactNode } from "react";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, type AuthContextType } from "@/contexts/auth-context";
import { ThemeContext, type Theme } from "@/contexts/theme-context";

const defaultAuth: AuthContextType = {
  username: "testuser",
  isAuthenticated: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
};

const defaultTheme = {
  theme: "light" as Theme,
  setTheme: () => {},
  toggleTheme: () => {},
};

function createWrapper(authOverrides?: Partial<AuthContextType>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={defaultTheme}>
          <AuthContext.Provider value={{ ...defaultAuth, ...authOverrides }}>
            {children}
          </AuthContext.Provider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & {
    auth?: Partial<AuthContextType>;
    initialRoute?: string;
  }
): RenderResult {
  const { auth, initialRoute: _initialRoute, ...renderOptions } = options || {};
  return render(ui, { wrapper: createWrapper(auth), ...renderOptions });
}

export { defaultAuth };
