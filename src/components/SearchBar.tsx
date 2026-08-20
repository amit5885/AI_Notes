"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeSlug } from "@/lib/slug";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      const slug = normalizeSlug(trimmed);
      router.push(`/notes/${slug}?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to learn about?"
          className="w-full px-5 py-3.5 text-base rounded-lg border border-border bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          Search
        </button>
      </div>
    </form>
  );
}
