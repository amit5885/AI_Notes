"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ExportButtons } from "@/components/ExportButtons";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <LoadingSpinner topic={rawQuery} />
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">{error ?? "Note not found"}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  const content = note.content;

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-blue-600 hover:underline mb-6 sm:mb-8 inline-block"
      >
        &larr; Back
      </Link>

      <article>
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">{note.title}</h1>
        <div className="mb-6">
          <ExportButtons note={note} />
        </div>

        <section className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Introduction</h2>
          <p className="text-gray-700">{content.intro}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Key Concepts</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {content.keyConcepts.map((concept, i) => (
              <li key={i}>{concept}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">How It Works</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {content.howItWorks}
          </p>
          {note.diagramUrl && (
            <img
              src={note.diagramUrl}
              alt={`Diagram of ${note.title}`}
              className="mt-4 rounded-lg max-w-full"
            />
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Example / Analogy</h2>
          <p className="text-gray-700">{content.example}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Summary</h2>
          <p className="text-gray-700">{content.summary}</p>
        </section>

        <RelatedTopics topics={content.relatedTopics} />
      </article>
    </main>
  );
}
