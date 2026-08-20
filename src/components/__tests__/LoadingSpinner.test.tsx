import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with default message", () => {
    render(<LoadingSpinner topic="photosynthesis" />);
    expect(screen.getByText(/photosynthesis/i)).toBeInTheDocument();
  });

  it("rotates through messages", () => {
    render(<LoadingSpinner topic="test" />);

    expect(screen.getByText(/Thinking about/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/Exploring/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/Almost there/i)).toBeInTheDocument();
  });

  it("shows spinner animation", () => {
    const { container } = render(<LoadingSpinner topic="test" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("cycles back to first message after last", () => {
    render(<LoadingSpinner topic="test" />);

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(2000);
      });
    }

    expect(screen.getByText(/Thinking about/i)).toBeInTheDocument();
  });
});
