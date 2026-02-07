import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AuthCard, AuthLayout } from "@/layouts/auth-layout";
import { Button, Input, Label } from "@tasky/ui";
import { Loader2, Lock, User } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);

    const { error: loginError } = await login(username, password);
    if (loginError) {
      toast.error("Login failed", loginError.message || "Invalid credentials");
    } else {
      toast.success("Welcome", "You are logged in");
    }
    setLoading(false);
  }

  return (
    <AuthLayout>
      <AuthCard brandOnly tagline="Sign in to your account">
        <form
          onSubmit={handleSubmit}
          className="font-brand space-y-4 sm:space-y-5"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="username" className="auth-form-label">
              Username
            </Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted-foreground) sm:left-3.5"
                aria-hidden
              />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                autoComplete="username"
                autoFocus
                className="auth-form-input h-11 pl-10 sm:h-12 sm:pl-11"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="auth-form-label">
              Password
            </Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted-foreground) sm:left-3.5"
                aria-hidden
              />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
                minLength={4}
                className="auth-form-input h-11 pl-10 sm:h-12 sm:pl-11"
              />
            </div>
          </div>
          <Button type="submit" className="auth-form-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <div className="border-t border-(--border)/80 pt-5 text-center text-sm text-(--muted-foreground) sm:pt-6 sm:text-base">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="rounded font-semibold text-(--primary) transition-colors outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--card)"
            >
              Sign up
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
