"use client";

import { Suspense } from "react";
import RateLimitedContent from "./content";

export default function RateLimitedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RateLimitedContent />
    </Suspense>
  );
}
