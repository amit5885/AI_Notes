"use client";

import { useState, useEffect } from "react";
import { normalizeSlug } from "@/lib/slug";

const DEFAULT_TOPICS = [
  "Photosynthesis",
  "Machine Learning",
  "Solar System",
  "Binary Search",
  "Climate Change",
];

export function TrendingTopics() {
  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics);
        }
      } catch {
        // Use default topics on error
      }
    }

    fetchTrending();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      <p className="text-xs font-medium text-muted mb-2.5 uppercase tracking-wider">
        Try one
      </p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <a
            key={topic}
            href={`/notes/${normalizeSlug(topic)}?q=${encodeURIComponent(topic)}`}
            className="px-3 py-1.5 bg-surface text-ink text-sm rounded-md hover:bg-border transition-colors"
          >
            {topic}
          </a>
        ))}
      </div>
    </div>
  );
}
