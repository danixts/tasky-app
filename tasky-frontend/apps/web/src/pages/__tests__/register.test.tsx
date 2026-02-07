import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { RegisterPage } from "../register";
import { renderWithProviders } from "@/test/test-utils";

describe("RegisterPage", () => {
  it("renders register form", () => {
    renderWithProviders(<RegisterPage />, {
      auth: { isAuthenticated: false },
      initialRoute: "/register",
    });
    expect(screen.getByText("Tasky")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("has link to login page", () => {
    renderWithProviders(<RegisterPage />, {
      auth: { isAuthenticated: false },
      initialRoute: "/register",
    });
    expect(screen.getByText("Sign in")).toHaveAttribute("href", "/login");
  });

  it("calls register on form submit", async () => {
    const register = vi.fn().mockResolvedValue({ error: null });
    renderWithProviders(<RegisterPage />, {
      auth: { isAuthenticated: false, register },
      initialRoute: "/register",
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith("newuser", "new@test.com", "1234");
    });
  });

  it("shows error toast on failed registration", async () => {
    const register = vi
      .fn()
      .mockResolvedValue({ error: new Error("User already exists") });
    renderWithProviders(<RegisterPage />, {
      auth: { isAuthenticated: false, register },
      initialRoute: "/register",
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "existing" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "e@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Registration failed",
        expect.objectContaining({ description: "User already exists" })
      );
    });
  });
});
