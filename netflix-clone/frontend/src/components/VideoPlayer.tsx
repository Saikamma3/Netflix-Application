import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { userApi } from "../api/user.api";

interface Props {
  contentId: string;
  videoKey:  string;  // MinIO key, e.g. "movies/big-buck-bunny/manifest.m3u8"
  episodeId?: string;
  startAt?:   number; // seconds
  onBack:     () => void;
}

const STREAM_BASE = import.meta.env.VITE_STREAM_BASE_URL || "/stream";

export function VideoPlayer({ contentId, videoKey, episodeId, startAt = 0, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<Hls | null>(null);
  const saveRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [muted,     setMuted]     = useState(false);
  const [showCtrl,  setShowCtrl]  = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive HLS URL from the video key
  // The key already ends with /manifest.m3u8 or is a folder path
  const manifestUrl = videoKey.endsWith("manifest.m3u8")
    ? `${STREAM_BASE}/${videoKey}`
    : `${STREAM_BASE}/${videoKey}/manifest.m3u8`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1 }); // auto quality
      hlsRef.current = hls;
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = startAt;
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifestUrl;
      video.currentTime = startAt;
      video.play().catch(() => {});
    }

    // Auto-save progress every 10 seconds
    saveRef.current = setInterval(() => {
      if (video.currentTime > 5) {
        userApi.saveProgress(contentId, Math.floor(video.currentTime), episodeId, video.ended);
      }
    }, 10_000);

    return () => {
      hlsRef.current?.destroy();
      if (saveRef.current) clearInterval(saveRef.current);
    };
  }, [manifestUrl, startAt, contentId, episodeId]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime);
    setDuration(v.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`;
  };

  const showControls = () => {
    setShowCtrl(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowCtrl(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onMouseMove={showControls}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        muted={muted}
        onClick={togglePlay}
      />

      {/* Controls */}
      {showCtrl && (
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {/* Top bar */}
          <div className="flex items-center gap-4 px-6 pt-6 pointer-events-auto">
            <button onClick={onBack} className="text-white hover:text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>

          {/* Bottom controls */}
          <div className="bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pointer-events-auto">
            {/* Seek bar */}
            <input type="range" min={0} max={duration || 100} value={progress}
              onChange={handleSeek}
              className="w-full h-1 accent-[#E50914] cursor-pointer mb-3"
            />
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:text-gray-300">
                  {playing
                    ? <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    : <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>
                <button onClick={() => setMuted(!muted)} className="hover:text-gray-300">
                  {muted
                    ? <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    : <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  }
                </button>
                <span className="text-sm text-gray-300">{fmt(progress)} / {fmt(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
