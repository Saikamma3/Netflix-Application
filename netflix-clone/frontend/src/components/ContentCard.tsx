import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Content } from "../types";
import { userApi } from "../api/user.api";

interface Props {
  content: Content;
  progressPercent?: number;
}

export function ContentCard({ content, progressPercent }: Props) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [added,   setAdded]   = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await userApi.addToWatchlist(content.id);
    setAdded(true);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${content.id}`);
  };

  const fmtLen =
    content.type === "MOVIE" && content.duration
      ? `${content.duration}m`
      : "Series";

  return (
    <div
      className="relative flex-shrink-0 w-44 md:w-52 lg:w-60 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
    >
      {/* ── Thumbnail — 16:9 landscape ── */}
      <div className={`relative w-full aspect-video rounded overflow-hidden transition-all duration-200 ${
        hovered ? "rounded-b-none brightness-90 ring-1 ring-white/20" : ""
      }`}>
        <img
          src={content.backdropUrl}
          alt={content.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Progress bar (Continue Watching) */}
        {progressPercent !== undefined && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-600">
            <div
              className="h-full bg-[#E50914] transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Hover panel — slides in below the thumbnail ── */}
      {hovered && (
        <div
          className="absolute top-full left-0 right-0 bg-[#181818] rounded-b-md shadow-2xl border border-t-0 border-white/10 z-50"
          onClick={e => e.stopPropagation()}
        >
          {/* Buttons row */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <div className="flex items-center gap-2">
              {/* Play */}
              <button
                onClick={handlePlay}
                className="bg-white rounded-full p-1.5 hover:bg-white/80 transition-colors"
                title="Play"
              >
                <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>

              {/* Add to list */}
              <button
                onClick={handleAdd}
                className="border-2 border-gray-400 rounded-full p-1.5 hover:border-white transition-colors"
                title={added ? "Remove from My List" : "Add to My List"}
              >
                {added
                  ? <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  : <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                }
              </button>

              {/* Thumbs up */}
              <button
                className="border-2 border-gray-400 rounded-full p-1.5 hover:border-white transition-colors"
                title="I like this"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                </svg>
              </button>
            </div>

            {/* Chevron — go to detail */}
            <button
              onClick={handlePlay}
              className="border-2 border-gray-400 rounded-full p-1.5 hover:border-white transition-colors"
              title="More info"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          {/* Metadata */}
          <div className="px-3 pb-3">
            <p className="text-white text-xs font-semibold truncate mb-1.5">{content.title}</p>
            <div className="flex items-center gap-2 text-[11px] mb-1.5">
              <span className="text-green-500 font-semibold">{content.releaseYear}</span>
              <span className="border border-gray-500 px-1 rounded text-gray-300 text-[10px]">
                {content.maturityRating}
              </span>
              <span className="text-gray-300">{fmtLen}</span>
            </div>
            {content.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                {content.genres.slice(0, 3).map((g, i) => (
                  <span key={g.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-gray-600">•</span>}
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
