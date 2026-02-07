import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AuthCard, AuthLayout } from "@/layouts/auth-layout";
import { Button, Input, Label } from "@tasky/ui";
import { Loader2, Lock, Mail, User } from "lucide-react";

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword || !confirmPassword;
  const canSubmit =
    username.trim().length >= 3 &&
    email.trim().length > 0 &&
    password.length >= 4 &&
    confirmPassword.length >= 4 &&
    passwordsMatch;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.warning(
        "Passwords do not match",
        "Make sure both passwords are the same"
      );
      return;
    }
    setLoading(true);

    const { error: regError } = await register(
      username.trim(),
      email.trim(),
      password
    );
    if (regError) {
      toast.error(
        "Registration failed",
        regError.message || "Could not create account"
      );
    } else {
      toast.success("Account created", "Welcome to Tasky!");
    }
    setLoading(false);
  }

  return (
    <AuthLayout>
      <AuthCard brandOnly tagline="Create your account">
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
                minLength={3}
                maxLength={50}
                autoComplete="username"
                autoFocus
                className="auth-form-input h-11 pl-10 sm:h-12 sm:pl-11"
              />
            </div>
            {username.length > 0 && username.length < 3 && (
              <p className="text-xs text-(--muted-foreground) sm:text-sm">
                Min. 3 characters
              </p>
            )}
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="auth-form-label">
              Email
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted-foreground) sm:left-3.5"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
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
                minLength={4}
                autoComplete="new-password"
                className="auth-form-input h-11 pl-10 sm:h-12 sm:pl-11"
              />
            </div>
            {password.length > 0 && password.length < 4 && (
              <p className="text-xs text-(--muted-foreground) sm:text-sm">
                Min. 4 characters
              </p>
            )}
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="confirmPassword" className="auth-form-label">
              Confirm password
            </Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--muted-foreground) sm:left-3.5"
                aria-hidden
              />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength={4}
                autoComplete="new-password"
                className="auth-form-input h-11 pl-10 sm:h-12 sm:pl-11"
              />
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-(--destructive) sm:text-sm">
                Passwords do not match
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="auth-form-button"
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <div className="border-t border-(--border)/80 pt-5 text-center text-sm text-(--muted-foreground) sm:pt-6 sm:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="rounded font-semibold text-(--primary) transition-colors outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--card)"
            >
              Sign in
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
