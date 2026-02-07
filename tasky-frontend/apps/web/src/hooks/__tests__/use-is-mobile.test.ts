import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "../use-is-mobile";

describe("useIsMobile", () => {
  let removeEventListener: ReturnType<typeof vi.fn>;
  let listener: () => void;

  beforeEach(() => {
    removeEventListener = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        get matches() {
          return false;
        },
        media: query,
        addEventListener: (_ev: string, fn: () => void) => {
          listener = fn;
        },
        removeEventListener,
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns boolean", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });

  it("calls matchMedia with max-width 767px", () => {
    const matchMedia = vi.mocked(window.matchMedia);
    renderHook(() => useIsMobile());
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("removes change listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });
});
