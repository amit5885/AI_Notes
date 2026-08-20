import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import RateLimitedContent from "../content";

describe("RateLimitedContent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.pushState({}, "", "/rate-limited?retryAfter=60");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the rate limited message", () => {
    render(<RateLimitedContent />);
    expect(screen.getByText(/You've been busy/i)).toBeInTheDocument();
  });

  it("shows retry-after time in minutes format", () => {
    render(<RateLimitedContent />);
    expect(screen.getByText(/1m 0s/)).toBeInTheDocument();
  });

  it("shows progress bar", () => {
    const { container } = render(<RateLimitedContent />);
    const progressBar = container.querySelector(".bg-blue-600");
    expect(progressBar).toBeInTheDocument();
  });

  it("decrements countdown", () => {
    render(<RateLimitedContent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/59s/)).toBeInTheDocument();
  });

  it("shows retry link when countdown reaches zero", () => {
    render(<RateLimitedContent />);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByRole("link", { name: /try again/i })).toBeInTheDocument();
  });

  it("retry link points to home", () => {
    render(<RateLimitedContent />);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    const link = screen.getByRole("link", { name: /try again/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
