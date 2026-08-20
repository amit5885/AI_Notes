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
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!visible || sections.length === 0) return null;

  const totalHeight = sections.reduce((sum, s) => sum + s.height, 0);
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 800;
  const trackHeight = viewportHeight * 0.7;

  const mmCount = 70;
  const cmInterval = 10;

  const activeSection = sections[activeIndex];
  const activeStart = activeSection ? activeSection.top / totalHeight : 0;
  const activeEnd = activeSection
    ? (activeSection.top + activeSection.height) / totalHeight
    : 0;

  return (
    <div
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      style={{ height: trackHeight }}
      role="presentation"
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="relative"
        style={{ height: trackHeight, width: 24 }}
      >
        {Array.from({ length: mmCount + 1 }, (_, i) => {
          const pos = i / mmCount;
          const isCm = i % cmInterval === 0;
          const isInActive = pos >= activeStart && pos <= activeEnd;
          const isNearScroll =
            Math.abs(pos - scrollProgress) < 0.02;

          const tickWidth = isCm ? 16 : 6;
          const tickHeight = isCm ? 1.5 : 1;

          let tickColor = "var(--color-border)";
          if (isInActive) {
            tickColor = "var(--color-primary)";
          } else if (isNearScroll) {
            tickColor = "var(--color-muted)";
          }

          return (
            <div
              key={i}
              className="absolute right-0 flex items-center"
              style={{
                top: `${pos * 100}%`,
                height: 0,
                transition: reducedMotion
                  ? "none"
                  : "opacity 150ms ease-out",
              }}
            >
              {isCm && (
                <span
                  className="absolute text-[8px] leading-none select-none whitespace-nowrap"
                  style={{
                    right: tickWidth + 4,
                    color: isInActive
                      ? "var(--color-primary)"
                      : "var(--color-muted)",
                    opacity: isInActive ? 1 : 0.5,
                    fontWeight: isInActive ? 600 : 400,
                  }}
                >
                  {Math.round(pos * 100)}
                </span>
              )}
              <div
                style={{
                  width: tickWidth,
                  height: tickHeight,
                  backgroundColor: tickColor,
                  borderRadius: 0.5,
                  transition: reducedMotion
                    ? "none"
                    : "background-color 150ms ease-out, width 150ms ease-out",
                }}
              />
            </div>
          );
        })}

        <div
          className="absolute right-0 w-[1.5px] rounded-full"
          style={{
            top: `${scrollProgress * 100}%`,
            height: 3,
            backgroundColor: "var(--color-primary)",
            boxShadow: "0 0 6px oklch(0.500 0.180 279 / 0.4)",
            transition: reducedMotion ? "none" : "top 50ms linear",
          }}
        />
      </div>
    </div>
  );
}
