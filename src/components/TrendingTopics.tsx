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
    <div className="w-full max-w-2xl mx-auto mt-8 px-4 sm:px-0">
      <p className="text-sm text-gray-500 mb-3 text-center">Trending topics</p>
      <div className="flex flex-wrap justify-center gap-2">
        {topics.map((topic) => (
          <a
            key={topic}
            href={`/notes/${normalizeSlug(topic)}?q=${encodeURIComponent(topic)}`}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm hover:bg-gray-200 transition-colors"
          >
            {topic}
          </a>
        ))}
      </div>
    </div>
  );
}
