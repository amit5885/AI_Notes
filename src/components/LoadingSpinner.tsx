"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Thinking about {topic}...",
  "Exploring {topic}...",
  "Almost there with {topic}...",
];

interface LoadingSpinnerProps {
  topic: string;
}

export function LoadingSpinner({ topic }: LoadingSpinnerProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const message = MESSAGES[messageIndex].replace("{topic}", topic);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xl text-gray-600 animate-pulse">{message}</p>
    </div>
  );
}
