"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Highlight Grid
 *
 * A grid of labelled cells with a single coloured highlight that glides to sit
 * behind whichever cell the cursor is over — morphing its position, size and
 * colour with a smooth transition. Each cell carries its own accent colour, and
 * rows can hold any number of cells.
 *
 * Ported 1:1 from the vanilla "CodeGrid Direction-Aware Hover" experiment into
 * a single, self-contained, prop-driven React component. No animation library —
 * the highlight is a CSS transition driven by pointer events.
 */

export interface HighlightItem {
  label?: string;
  /** Accent colour for this cell. Falls back to the cycled `colors` palette. */
  color?: string;
  /** Custom content element to render inside this cell */
  content?: React.ReactNode;
}

export interface HighlightGridProps {
  /** Optional flat list of items. If provided, renders a responsive CSS grid. */
  items?: HighlightItem[];
  /** Columns class for CSS grid mode. Defaults to "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5". */
  columnsClassName?: string;
  /** Rows of cells. Each row can hold a different number of cells. */
  rows?: HighlightItem[][];
  /** Palette cycled for cells without an explicit `color`. */
  colors?: string[];
  /** Highlight transition duration in ms. Defaults to 250. */
  transitionDuration?: number;
  /** Park the highlight on the first cell on mount. Defaults to false when used for items, true for rows. */
  highlightFirst?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Extra classes for the inner grid box. */
  gridClassName?: string;
  /** Extra classes for individual cells */
  cellClassName?: string;
}

const DEFAULT_COLORS = [
  "#E24E1B",
  "#4381C1",
  "#F79824",
  "#04A777",
  "#5B8C5A",
  "#2176FF",
  "#818D92",
  "#22AAA1",
];

const DEFAULT_ROWS: HighlightItem[][] = [
  [{ label: "html" }, { label: "css" }, { label: "javascript" }],
  [{ label: "gsap" }, { label: "scrolltrigger" }, { label: "react" }, { label: "next.js" }, { label: "three.js" }],
];

export function HighlightGrid({
  items,
  columnsClassName = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  rows,
  colors = DEFAULT_COLORS,
  transitionDuration = 250,
  highlightFirst = false,
  className,
  gridClassName,
  cellClassName,
}: HighlightGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<number, HTMLElement>>(new Map());
  const activeRef = useRef<{ gi: number; color: string } | null>(null);
  const [active, setActive] = useState<number | null>(highlightFirst ? 0 : null);

  // If flat items are provided, map them directly.
  const flatGridItems = useMemo(() => {
    if (!items) return null;
    return items.map((item, idx) => ({
      label: item.label,
      color: item.color ?? colors[idx % colors.length],
      content: item.content,
      gi: idx,
    }));
  }, [items, colors]);

  // Otherwise flatten rows into cells with running global index + resolved colour.
  const gridRows = useMemo(() => {
    if (items) return null;
    const effectiveRows = rows || DEFAULT_ROWS;
    let gi = 0;
    return effectiveRows.map((row) =>
      row.map((item) => {
        const idx = gi++;
        return {
          label: item.label,
          color: item.color ?? colors[idx % colors.length],
          content: item.content,
          gi: idx,
        };
      }),
    );
  }, [items, rows, colors]);

  const moveTo = useCallback((gi: number, color: string) => {
    const grid = gridRef.current;
    const highlight = highlightRef.current;
    const el = cellRefs.current.get(gi);
    if (!grid || !highlight || !el) return;

    const rect = el.getBoundingClientRect();
    const crect = grid.getBoundingClientRect();
    highlight.style.transform = `translate(${rect.left - crect.left}px, ${rect.top - crect.top}px)`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.backgroundColor = color;
    activeRef.current = { gi, color };
  }, []);

  // Park on the first cell initially if highlightFirst is true.
  useEffect(() => {
    const first = flatGridItems ? flatGridItems[0] : gridRows?.[0]?.[0];
    if (highlightFirst && first) {
      const h = highlightRef.current;
      if (h) {
        h.style.opacity = "0.85";
        h.style.transitionDuration = "0s";
        moveTo(first.gi, first.color);
        requestAnimationFrame(() => {
          if (h) h.style.transitionDuration = `${transitionDuration}ms`;
        });
      }
    }

    const onResize = () => {
      if (activeRef.current) moveTo(activeRef.current.gi, activeRef.current.color);
    };
    const grid = gridRef.current;
    const ro = grid ? new ResizeObserver(onResize) : null;
    if (grid && ro) ro.observe(grid);
    window.addEventListener("resize", onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [flatGridItems, gridRows, highlightFirst, moveTo, transitionDuration]);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <div
        ref={gridRef}
        onMouseLeave={() => {
          if (!highlightFirst) {
            setActive(null);
            if (highlightRef.current) {
              highlightRef.current.style.opacity = "0";
            }
          }
        }}
        className={cn(
          "relative mx-auto w-full border border-white/10 rounded-3xl overflow-hidden bg-[#0e1017]",
          flatGridItems ? cn("grid", columnsClassName) : "flex flex-col",
          gridClassName
        )}
      >
        {/* Sliding highlight — solid accent with radiant gradient sheen */}
        <div
          ref={highlightRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-0 transition-opacity duration-300",
            highlightFirst ? "opacity-85" : "opacity-0"
          )}
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.24), rgba(255,255,255,0) 55%), linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.5) 100%)",
            transitionProperty: "transform, width, height, background-color, opacity",
            transitionDuration: `${transitionDuration}ms`,
            transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />

        {/* 1. Flat items responsive grid mode */}
        {flatGridItems &&
          flatGridItems.map((cell) => {
            const isActive = active === cell.gi;
            return (
              <div
                key={cell.gi}
                ref={(el) => {
                  if (el) cellRefs.current.set(cell.gi, el);
                  else cellRefs.current.delete(cell.gi);
                }}
                onMouseEnter={() => {
                  setActive(cell.gi);
                  moveTo(cell.gi, cell.color);
                  if (highlightRef.current) {
                    highlightRef.current.style.opacity = "0.85";
                  }
                }}
                className={cn(
                  "flex items-stretch justify-center relative p-2.5 sm:p-3 border-b border-r border-white/10 transition-all",
                  isActive ? "z-30" : "z-[1]",
                  "hover:z-30",
                  cellClassName
                )}
              >
                {cell.content ? (
                  <div className="w-full h-full relative z-[2] flex flex-col">
                    {cell.content}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4">
                    <p
                      className={cn(
                        "relative z-[2] font-mono text-[13px] font-medium uppercase transition-colors duration-200",
                        isActive ? "text-white font-bold" : "text-neutral-300",
                      )}
                    >
                      ( {cell.label} )
                    </p>
                  </div>
                )}
              </div>
            );
          })}

        {/* 2. Explicit Rows mode */}
        {!flatGridItems &&
          gridRows &&
          gridRows.map((row, r) => (
            <div
              key={r}
              className={cn(
                "flex flex-col sm:flex-row flex-1",
                r < gridRows.length - 1 && "border-b border-white/10",
              )}
            >
              {row.map((cell, c) => {
                const isActive = active === cell.gi;
                return (
                  <div
                    key={cell.gi}
                    ref={(el) => {
                      if (el) cellRefs.current.set(cell.gi, el);
                      else cellRefs.current.delete(cell.gi);
                    }}
                    onMouseEnter={() => {
                      setActive(cell.gi);
                      moveTo(cell.gi, cell.color);
                      if (highlightRef.current) {
                        highlightRef.current.style.opacity = "0.85";
                      }
                    }}
                    className={cn(
                      "flex flex-1 items-stretch justify-center relative p-2.5 sm:p-3 transition-all",
                      isActive ? "z-30" : "z-[1]",
                      "hover:z-30",
                      c < row.length - 1 && "border-b sm:border-b-0 sm:border-r border-white/10",
                      cellClassName
                    )}
                  >
                    {cell.content ? (
                      <div className="w-full h-full relative z-[2] flex flex-col">
                        {cell.content}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-4">
                        <p
                          className={cn(
                            "relative z-[2] font-mono text-[13px] font-medium uppercase transition-colors duration-200",
                            isActive ? "text-white font-bold" : "text-neutral-300",
                          )}
                        >
                          ( {cell.label} )
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}

export default HighlightGrid;
