"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id: string;
  top: number;
  height: number;
}

export function LineMinimap() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const measured = Array.from(
      document.querySelectorAll<HTMLElement>("[data-minimap]")
    ).map((el) => ({
      id: el.getAttribute("data-minimap") ?? "",
      top: el.offsetTop,
      height: el.offsetHeight,
    }));

    if (measured.length === 0) return;
    setSections(measured);
    setVisible(true);
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-minimap");
            const idx = measured.findIndex((s) => s.id === id);
            if (idx !== -1) {
              setActiveIndex(idx);
            }
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    document
      .querySelectorAll("[data-minimap]")
      .forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (!visible || sections.length === 0) return null;

  const totalHeight = sections.reduce((sum, s) => sum + s.height, 0);
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 800;
  const trackHeight = viewportHeight * 0.6;

  const segmentTop = (sections[activeIndex]?.top ?? 0) / totalHeight;
  const segmentHeight = Math.max(
    (sections[activeIndex]?.height ?? 0) / totalHeight,
    0.05
  );

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      style={{ height: trackHeight }}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="relative w-[3px] rounded-full overflow-hidden"
        style={{
          height: trackHeight,
          backgroundColor: "var(--color-border)",
        }}
      >
        <div
          className="absolute left-0 w-full rounded-full"
          style={{
            top: `${segmentTop * 100}%`,
            height: `${segmentHeight * 100}%`,
            backgroundColor: "var(--color-primary)",
            transition: reducedMotion
              ? "none"
              : "top 200ms ease-out, height 200ms ease-out",
          }}
        />
      </div>
    </div>
  );
}
