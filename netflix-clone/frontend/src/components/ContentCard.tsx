import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Content } from "../types";
import { userApi } from "../api/user.api";

interface Props { content: Content }

export function ContentCard({ content }: Props) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [added,   setAdded]   = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await userApi.addToWatchlist(content.id);
    setAdded(true);
  };

  return (
    <div
      className="relative flex-shrink-0 w-40 md:w-48 cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/watch/${content.id}`)}
    >
      {/* Poster */}
      <img
        src={content.posterUrl}
        alt={content.title}
        className="w-full rounded object-cover aspect-[2/3]"
        loading="lazy"
      />

      {/* Hover overlay */}
      {hovered && (
        <div className="absolute inset-0 rounded bg-black/80 flex flex-col justify-end p-2">
          {/* Mini backdrop */}
          <img
            src={content.backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-2/3 object-cover rounded-t opacity-60"
          />
          <div className="relative z-10">
            <p className="text-xs font-bold text-white truncate mb-1">{content.title}</p>
            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/watch/${content.id}`); }}
                className="bg-white rounded-full p-1 hover:bg-white/80"
              >
                <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <button
                onClick={handleAdd}
                className="border border-gray-400 rounded-full p-1 hover:border-white"
              >
                {added
                  ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  : <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                }
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <span className="text-green-400 font-semibold">{content.releaseYear}</span>
              <span className="border border-gray-500 px-0.5 rounded text-[10px]">{content.maturityRating}</span>
              <span>{content.type === "MOVIE" ? `${content.duration}m` : "Series"}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {content.genres.slice(0, 2).map(g => (
                <span key={g.id} className="text-[10px] text-gray-400">{g.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
