import { useRef, useState, useCallback } from "react";
import { Content } from "../types";
import { ContentCard } from "./ContentCard";

interface Props {
  title: string;
  items: Content[];
  progressMap?: Record<string, number>;
}

const VISIBLE_COUNT = 5;

export function ContentRow({ title, items, progressMap }: Props) {
  const rowRef      = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / VISIBLE_COUNT));

  const scroll = useCallback((dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    if (dir === "right") {
      el.scrollBy({ left: amount, behavior: "smooth" });
      setPage(p => Math.min(p + 1, totalPages - 1));
    } else {
      el.scrollBy({ left: -amount, behavior: "smooth" });
      setPage(p => Math.max(p - 1, 0));
    }
  }, [totalPages]);

  if (!items.length) return null;

  return (
    <div className="px-6 md:px-16 mb-8 group/row">
      {/* Row header */}
      <div className="flex items-center gap-4 mb-3">
        <h2 className="text-white font-semibold text-lg hover:text-gray-300 cursor-pointer transition-colors">
          {title}
        </h2>

        {/* Page indicator dots */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`block h-0.5 w-3 rounded-full transition-colors duration-300 ${
                  i === page ? "bg-gray-300" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative overflow-visible">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          disabled={page === 0}
          className="absolute left-0 top-1/3 -translate-y-1/2 z-20 -ml-6 md:-ml-10 bg-black/60 hover:bg-black/90 p-3 rounded-r opacity-0 group-hover/row:opacity-100 disabled:opacity-0 transition-opacity h-full flex items-center"
          style={{ top: 0, height: "calc(100% - 12px)", transform: "none", left: "-24px" }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Scroll container — overflow-x-scroll, overflow-y-visible for hover panels */}
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pb-16 -mb-16"
        >
          {items.map((c) => (
            <ContentCard
              key={c.id}
              content={c}
              progressPercent={progressMap?.[c.id]}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          disabled={page >= totalPages - 1}
          className="absolute right-0 top-0 z-20 -mr-6 md:-mr-10 bg-black/60 hover:bg-black/90 p-3 rounded-l opacity-0 group-hover/row:opacity-100 disabled:opacity-0 transition-opacity flex items-center"
          style={{ height: "calc(100% - 12px)", right: "-24px" }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
