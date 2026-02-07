import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { LoginPage } from "../login";
import { renderWithProviders } from "@/test/test-utils";

describe("LoginPage", () => {
  it("renders login form", () => {
    renderWithProviders(<LoginPage />, {
      auth: { isAuthenticated: false },
      initialRoute: "/login",
    });
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("has link to register page", () => {
    renderWithProviders(<LoginPage />, {
      auth: { isAuthenticated: false },
      initialRoute: "/login",
    });
    expect(screen.getByText("Sign up")).toHaveAttribute("href", "/register");
  });

  it("calls login on form submit", async () => {
    const login = vi.fn().mockResolvedValue({ error: null });
    renderWithProviders(<LoginPage />, {
      auth: { isAuthenticated: false, login },
      initialRoute: "/login",
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "daniel" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("daniel", "1234");
    });
  });

  it("shows error toast on failed login", async () => {
    const login = vi
      .fn()
      .mockResolvedValue({ error: new Error("Invalid credentials") });
    renderWithProviders(<LoginPage />, {
      auth: { isAuthenticated: false, login },
      initialRoute: "/login",
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Login failed",
        expect.objectContaining({ description: "Invalid credentials" })
      );
    });
  });
});
