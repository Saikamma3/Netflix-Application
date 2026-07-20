import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { selectProfileThunk } from "../store/auth.slice";
import { authApi } from "../api/auth.api";
import { Profile } from "../types";

// Distinct Netflix-style avatar background colors
const AVATAR_COLORS = [
  "#E50914", "#0071EB", "#2ECC71", "#F39C12", "#8E44AD", "#1ABC9C",
];

export function ProfileSelect() {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    authApi.getProfiles()
      .then(({ data }) => setProfiles(data.data))
      .finally(() => setLoading(false));
  }, []);

  const select = async (profileId: string) => {
    setSelecting(profileId);
    await dispatch(selectProfileThunk(profileId));
    navigate("/browse");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
      {/* Netflix logo top-left */}
      <div className="absolute top-6 left-8">
        <span className="text-[#E50914] font-black text-3xl tracking-tighter select-none">NETFLIX</span>
      </div>

      <h1 className="text-white text-4xl md:text-5xl font-medium mb-10 tracking-wide">
        Who's watching?
      </h1>

      <div className="flex flex-wrap gap-6 justify-center max-w-3xl mb-12">
        {profiles.map((p, i) => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            disabled={!!selecting}
            className="flex flex-col items-center gap-3 group disabled:opacity-70 transition-opacity"
          >
            {/* Avatar tile */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-md overflow-hidden">
              {/* Colored background with initial */}
              <div
                className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-black text-white transition-all duration-200 group-hover:opacity-90"
                style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              {/* Loading spinner overlay when selecting this profile */}
              {selecting === p.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                </div>
              )}

              {/* Hover ring */}
              <div className="absolute inset-0 ring-inset ring-4 ring-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-md"/>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium">
                {p.name}
              </span>
              {p.isKidsProfile && (
                <span className="text-[10px] font-bold bg-[#0071EB] text-white px-2 py-0.5 rounded tracking-wider">
                  KIDS
                </span>
              )}
            </div>
          </button>
        ))}

        {/* Add Profile button */}
        {profiles.length < 5 && (
          <button className="flex flex-col items-center gap-3 group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-md bg-[#333] flex items-center justify-center group-hover:bg-white/10 transition-colors duration-200 ring-inset ring-4 ring-transparent group-hover:ring-white/40">
              <svg className="w-14 h-14 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span className="text-gray-500 group-hover:text-white text-sm transition-colors">Add Profile</span>
          </button>
        )}
      </div>

      {/* Manage Profiles button */}
      <button className="border border-gray-500 text-gray-400 hover:text-white hover:border-white px-8 py-2 text-sm font-medium tracking-widest transition-colors">
        MANAGE PROFILES
      </button>
    </div>
  );
}
