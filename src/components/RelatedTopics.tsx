"use client";

import { useRouter } from "next/navigation";
import { normalizeSlug } from "@/lib/slug";

export function RelatedTopics({ topics }: { topics: string[] }) {
  const router = useRouter();

  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
        Related Topics
      </h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() =>
              router.push(
                `/notes/${normalizeSlug(topic)}?q=${encodeURIComponent(topic)}`
              )
            }
            className="px-3 py-1.5 bg-surface text-ink text-sm rounded-md hover:bg-border transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>
    </section>
  );
}
