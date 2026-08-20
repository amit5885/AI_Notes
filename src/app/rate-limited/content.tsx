"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RateLimitedContent() {
  const searchParams = useSearchParams();
  const retryAfter = parseInt(searchParams?.get("retryAfter") ?? "60", 10);

  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">⏱️</div>
        <h1 className="text-2xl font-bold mb-4">You&apos;ve been busy!</h1>
        <p className="text-gray-600 mb-6">
          Please wait <span className="font-semibold">{timeDisplay}</span> before trying again.
        </p>

        {countdown > 0 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / retryAfter) * 100}%` }}
              />
            </div>
          </div>
        )}

        {countdown === 0 && (
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </Link>
        )}
      </div>
    </main>
  );
}
