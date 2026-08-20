"use client";

import { useState, useEffect } from "react";

const STEPS = [
  "Expanding your query",
  "Generating study notes",
  "Creating concept diagram",
];

export function NoteSkeleton() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 3000),
      setTimeout(() => setStep(2), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main className="min-h-screen px-6 py-12 max-w-[42rem] mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-sm text-muted">{STEPS[step]}...</p>
        </div>
        <div className="h-0.5 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/40 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="animate-pulse">
        <header className="mb-10">
          <div className="h-9 w-3/4 bg-border rounded mb-4" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-border rounded-md" />
            <div className="h-8 w-24 bg-border rounded-md" />
          </div>
        </header>

        <div className="space-y-8">
          <section>
            <div className="h-3 w-24 bg-border rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-5/6 bg-border rounded" />
              <div className="h-4 w-2/3 bg-border rounded" />
            </div>
          </section>

          <section>
            <div className="h-3 w-28 bg-border rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-4/5 bg-border rounded" />
            </div>
          </section>

          <section>
            <div className="h-3 w-28 bg-border rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-3/4 bg-border rounded" />
            </div>
            <div className="h-48 w-full bg-border rounded-lg mt-5" />
          </section>

          <section>
            <div className="h-3 w-32 bg-border rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-5/6 bg-border rounded" />
            </div>
          </section>

          <section>
            <div className="h-3 w-20 bg-border rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-2/3 bg-border rounded" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
