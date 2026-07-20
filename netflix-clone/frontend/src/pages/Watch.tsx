import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { contentApi } from "../api/content.api";
import { userApi } from "../api/user.api";
import { Content, Episode } from "../types";

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [content,   setContent]   = useState<Content | null>(null);
  const [episodes,  setEpisodes]  = useState<Episode[]>([]);
  const [activeEp,  setActiveEp]  = useState<Episode | null>(null);
  const [startAt,   setStartAt]   = useState(0);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      const [contentRes, progressRes] = await Promise.all([
        contentApi.getById(id),
        userApi.getProgress(id),
      ]);
      const c = contentRes.data.data;
      setContent(c);

      if (c.type === "SHOW") {
        const epRes = await contentApi.getEpisodes(id);
        setEpisodes(epRes.data.data);
        const savedEpId = progressRes.data.data?.episodeId;
        const saved = savedEpId ? epRes.data.data.find(e => e.id === savedEpId) : epRes.data.data[0];
        setActiveEp(saved || epRes.data.data[0] || null);
      }

      setStartAt(progressRes.data.data?.secondsWatched || 0);
      setLoading(false);
    };
    init();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!content) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Content not found.
    </div>
  );

  // Determine what video key to use
  const videoKey = content.type === "MOVIE"
    ? (content as unknown as { videoKey: string }).videoKey
    : activeEp ? (activeEp as unknown as { videoKey: string }).videoKey : null;

  if (!videoKey) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <p>Video not available for this title yet.</p>
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-white underline">Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer
        contentId={content.id}
        videoKey={videoKey}
        episodeId={activeEp?.id}
        startAt={startAt}
        onBack={() => navigate(-1)}
      />

      {/* Episode selector (shows only) */}
      {content.type === "SHOW" && episodes.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 z-50 overflow-x-auto">
          <div className="flex gap-2 px-6 pb-2">
            {episodes.map(ep => (
              <button
                key={ep.id}
                onClick={() => { setActiveEp(ep); setStartAt(0); }}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded transition-colors ${
                  activeEp?.id === ep.id
                    ? "bg-white text-black font-bold"
                    : "bg-white/20 text-white hover:bg-white/40"
                }`}
              >
                S{ep.season}:E{ep.episodeNumber} {ep.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
