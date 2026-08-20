import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelatedTopics } from "../RelatedTopics";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RelatedTopics", () => {
  const topics = ["Machine Learning", "Data Structures", "Neural Networks"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the section heading", () => {
    render(<RelatedTopics topics={topics} />);
    expect(screen.getByText("Related Topics")).toBeInTheDocument();
  });

  it("renders all topic chips", () => {
    render(<RelatedTopics topics={topics} />);
    topics.forEach((topic) => {
      expect(screen.getByText(topic)).toBeInTheDocument();
    });
  });

  it("renders correct number of chips", () => {
    render(<RelatedTopics topics={topics} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("navigates to the topic page when clicked", async () => {
    render(<RelatedTopics topics={topics} />);
    const chip = screen.getByText("Machine Learning");
    chip.click();
    expect(mockPush).toHaveBeenCalledWith(
      "/notes/machine-learning?q=Machine%20Learning"
    );
  });

  it("renders nothing when topics array is empty", () => {
    const { container } = render(<RelatedTopics topics={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
