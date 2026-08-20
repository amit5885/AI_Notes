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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-0"
      style={{ height: trackHeight }}
      role="presentation"
      aria-hidden="true"
    >
      {sections.map((section, i) => {
        const isActive = i === activeIndex;
        const isHovered = i === hoveredIndex;
        const sectionRatio = section.height / totalHeight;

        return (
          <div
            key={section.id}
            className="flex items-center justify-end group cursor-default"
            style={{ flex: sectionRatio }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="flex items-center gap-2"
              style={{
                transition: reducedMotion
                  ? "none"
                  : "transform 150ms ease-out",
                transform: isHovered && !isActive ? "scaleX(1.3)" : "scaleX(1)",
                transformOrigin: "right center",
              }}
            >
              <span
                className="text-[10px] leading-none select-none whitespace-nowrap opacity-0 group-hover:opacity-100"
                style={{
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-muted)",
                  transition: reducedMotion ? "none" : "opacity 150ms ease-out",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {section.id}
              </span>
              <div
                style={{
                  width: isActive ? 18 : isHovered ? 14 : 8,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : isHovered
                      ? "var(--color-muted)"
                      : "var(--color-border)",
                  transition: reducedMotion
                    ? "none"
                    : "width 150ms ease-out, background-color 150ms ease-out",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
