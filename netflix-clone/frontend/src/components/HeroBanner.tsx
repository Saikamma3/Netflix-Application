import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Content } from "../types";
import { userApi } from "../api/user.api";

interface Props { content: Content }

export function HeroBanner({ content }: Props) {
  const navigate  = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddList = async () => {
    await userApi.addToWatchlist(content.id);
    setAdded(true);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* Backdrop */}
      <img
        src={content.backdropUrl}
        alt={content.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141414] to-transparent" />

      {/* Content */}
      <div className="absolute bottom-32 left-6 md:left-16 max-w-xl">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
          {content.title}
        </h1>
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-300">
          <span className="text-green-500 font-semibold">New</span>
          <span>{content.releaseYear}</span>
          <span className="border border-gray-500 px-1 rounded text-xs">{content.maturityRating}</span>
          {content.duration && <span>{content.duration} min</span>}
          <span className="border border-white/30 px-1 rounded text-xs">
            {content.type === "MOVIE" ? "Movie" : "Series"}
          </span>
        </div>
        <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed">
          {content.description}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/watch/${content.id}`)}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-white/80 transition-colors"
          >
            <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
          <button
            onClick={handleAddList}
            disabled={added}
            className="flex items-center gap-2 bg-gray-600/70 text-white font-bold px-6 py-2.5 rounded hover:bg-gray-600 transition-colors disabled:opacity-60"
          >
            {added ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            )}
            {added ? "Added" : "My List"}
          </button>
        </div>
      </div>
    </div>
  );
}
