import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Content } from "../types";
import { userApi } from "../api/user.api";

interface Props { content: Content }

export function HeroBanner({ content }: Props) {
  const navigate  = useNavigate();
  const [added,    setAdded]    = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);

  const handleAddList = async () => {
    await userApi.addToWatchlist(content.id);
    setAdded(true);
  };

  const fmtDuration = (mins: number) =>
    `${Math.floor(mins / 60)}h ${mins % 60}m`;

  return (
    <>
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* Backdrop */}
        <img
          src={content.backdropUrl}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />

        {/* Gradients — matches real Netflix layering */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #141414 0%, transparent 50%)" }}
        />

        {/* Content */}
        <div className="absolute bottom-28 left-6 md:left-16 max-w-xl">
          {/* Badge row */}
          <div className="flex items-center gap-3 mb-3">
            {content.isFeatured && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <svg className="w-4 h-4 text-[#E50914]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                #1 in Movies Today
              </span>
            )}
            <span className="text-xs font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded">
              Recently Added
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none drop-shadow-2xl">
            {content.title}
          </h1>

          {/* Attributes row */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
            <span className="text-green-500 font-semibold">{content.releaseYear}</span>
            <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs text-gray-300">
              {content.maturityRating}
            </span>
            {content.duration && (
              <span className="text-gray-300">{fmtDuration(content.duration)}</span>
            )}
            <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs text-gray-300">
              {content.type === "MOVIE" ? "Movie" : "Series"}
            </span>
          </div>

          {/* Genre dots */}
          {content.genres.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 text-sm text-gray-300">
              {content.genres.slice(0, 3).map((g, i) => (
                <span key={g.id} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-gray-600">•</span>}
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <p className="text-gray-200 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed">
            {content.description}
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/watch/${content.id}`)}
              className="flex items-center gap-2 bg-white text-black font-bold px-7 py-2.5 rounded hover:bg-white/80 transition-colors text-base"
            >
              <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Play
            </button>
            <button
              onClick={() => setMoreInfo(true)}
              className="flex items-center gap-2 bg-gray-500/70 text-white font-semibold px-7 py-2.5 rounded hover:bg-gray-500/90 transition-colors text-base"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* ── More Info modal ── */}
      {moreInfo && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setMoreInfo(false)}
        >
          <div
            className="bg-[#181818] rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal hero */}
            <div className="relative h-56 md:h-72">
              <img
                src={content.backdropUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, #181818 0%, transparent 60%)" }}
              />
              {/* Close */}
              <button
                onClick={() => setMoreInfo(false)}
                className="absolute top-3 right-3 bg-[#181818] rounded-full p-1.5 text-white hover:bg-[#2a2a2a] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              {/* Overlaid title + buttons */}
              <div className="absolute bottom-4 left-6">
                <h2 className="text-white text-2xl font-bold mb-3">{content.title}</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setMoreInfo(false); navigate(`/watch/${content.id}`); }}
                    className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2 rounded text-sm hover:bg-white/80 transition-colors"
                  >
                    <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Play
                  </button>
                  <button
                    onClick={handleAddList}
                    disabled={added}
                    title={added ? "Added to My List" : "Add to My List"}
                    className="border-2 border-gray-400 rounded-full p-2 text-white hover:border-white disabled:opacity-60 transition-colors"
                  >
                    {added
                      ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Modal details */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                    <span className="text-green-500 font-semibold">{content.releaseYear}</span>
                    <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs text-gray-300">
                      {content.maturityRating}
                    </span>
                    {content.duration && (
                      <span className="text-gray-300">{fmtDuration(content.duration)}</span>
                    )}
                    <span className="text-gray-300">
                      {content.type === "MOVIE" ? "Movie" : "Series"}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{content.description}</p>
                </div>

                {content.genres.length > 0 && (
                  <div className="text-sm min-w-[160px]">
                    <span className="text-gray-500">Genres: </span>
                    <span className="text-gray-300">{content.genres.map(g => g.name).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
