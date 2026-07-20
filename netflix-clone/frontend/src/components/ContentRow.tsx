import { useRef } from "react";
import { Content } from "../types";
import { ContentCard } from "./ContentCard";

interface Props { title: string; items: Content[] }

export function ContentRow({ title, items }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <div className="px-6 md:px-16 mb-8 group">
      <h2 className="text-white font-semibold text-lg mb-3">{title}</h2>
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/90 p-2 rounded-full -ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Scroll container */}
        <div ref={rowRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {items.map((c) => <ContentCard key={c.id} content={c} />)}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/90 p-2 rounded-full -mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
