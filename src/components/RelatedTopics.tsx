"use client";

import { useRouter } from "next/navigation";
import { normalizeSlug } from "@/lib/slug";

export function RelatedTopics({ topics }: { topics: string[] }) {
  const router = useRouter();

  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Related Topics</h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() =>
              router.push(
                `/notes/${normalizeSlug(topic)}?q=${encodeURIComponent(topic)}`
              )
            }
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm hover:bg-gray-200 transition-colors"
          >
            {topic}
          </button>
        ))}
      </div>
    </section>
  );
}
