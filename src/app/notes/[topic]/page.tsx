"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ExportButtons } from "@/components/ExportButtons";

import { NoteSkeleton } from "@/components/NoteSkeleton";
import { RelatedTopics } from "@/components/RelatedTopics";
import { NoteData } from "@/types/note";

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = params.topic as string;
  const rawQuery = searchParams.get("q") ?? topic;

  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrGenerate() {
      try {
        const getRes = await fetch(`/api/notes/${topic}`);
        if (getRes.ok) {
          const data = await getRes.json();
          setNote(data);
          setLoading(false);
          return;
        }

        const postRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: rawQuery }),
        });

        if (postRes.status === 429) {
          const retryAfter = postRes.headers.get("Retry-After") ?? "60";
          router.push(`/rate-limited?retryAfter=${retryAfter}`);
          return;
        }

        if (!postRes.ok) {
          throw new Error("Failed to generate note");
        }

        const data = await postRes.json();
        setNote(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrGenerate();
  }, [topic, rawQuery, router]);

  if (loading) {
    return <NoteSkeleton />;
  }

  if (error || !note) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-error mb-4">{error ?? "Note not found"}</p>
        <Link
          href="/"
          className="text-primary hover:text-primary-hover transition-colors text-sm font-medium"
        >
          Back to home
        </Link>
      </main>
    );
  }

  const content = note.content;

  return (
    <main className="min-h-screen px-6 py-12 max-w-[42rem] mx-auto">
      <Link
        href="/"
        className="text-sm text-muted hover:text-ink transition-colors inline-flex items-center gap-1 mb-10"
      >
        &larr; Back
      </Link>

      <article>
        <header className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ textWrap: "balance" }}
          >
            {note.title}
          </h1>
          <ExportButtons note={note} />
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
              Introduction
            </h2>
            <p className="text-ink leading-relaxed">{content.intro}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
              Key Concepts
            </h2>
            <ul className="space-y-2">
              {content.keyConcepts.map((concept, i) => (
                <li
                  key={i}
                  className="text-ink leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/40"
                >
                  {concept}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
              How It Works
            </h2>
            <p className="text-ink leading-relaxed whitespace-pre-line">
              {content.howItWorks}
            </p>
            {note.diagramUrl && (
              <img
                src={note.diagramUrl}
                alt={`Diagram of ${note.title}`}
                className="mt-5 rounded-lg max-w-full border border-border"
              />
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
              Example / Analogy
            </h2>
            <p className="text-ink leading-relaxed">{content.example}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
              Summary
            </h2>
            <p className="text-ink leading-relaxed">{content.summary}</p>
          </section>
        </div>

        <RelatedTopics topics={content.relatedTopics} />
      </article>
    </main>
  );
}
