"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

interface NoteContent {
  intro: string;
  keyConcepts: string[];
  howItWorks: string;
  example: string;
  summary: string;
}

interface Note {
  id: string;
  topic: string;
  rawQuery: string;
  title: string;
  content: NoteContent;
  diagramUrl: string | null;
  createdAt: string;
}

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const topic = params.topic as string;
  const rawQuery = searchParams.get("q") ?? topic;

  const [note, setNote] = useState<Note | null>(null);
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
  }, [topic, rawQuery]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="animate-pulse text-xl text-gray-500">
          Thinking about {rawQuery}...
        </div>
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

  const content = note.content as NoteContent;

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-blue-600 hover:underline mb-8 inline-block"
      >
        &larr; Back
      </Link>

      <article>
        <h1 className="text-4xl font-bold mb-6">{note.title}</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Introduction</h2>
          <p className="text-gray-700">{content.intro}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Key Concepts</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {content.keyConcepts.map((concept, i) => (
              <li key={i}>{concept}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">How It Works</h2>
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
          <h2 className="text-xl font-semibold mb-2">Example / Analogy</h2>
          <p className="text-gray-700">{content.example}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="text-gray-700">{content.summary}</p>
        </section>
      </article>
    </main>
  );
}
