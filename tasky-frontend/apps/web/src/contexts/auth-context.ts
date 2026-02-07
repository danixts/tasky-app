import { createContext, use } from "react";

export interface AuthContextType {
  username: string | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
