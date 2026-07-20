import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { selectProfileThunk } from "../store/auth.slice";
import { authApi } from "../api/auth.api";
import { Profile } from "../types";

const AVATAR_COLORS = ["#E50914","#B20710","#831010","#4A0404","#0071EB","#0057B7"];

export function ProfileSelect() {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    authApi.getProfiles()
      .then(({ data }) => setProfiles(data.data))
      .finally(() => setLoading(false));
  }, []);

  const select = async (profileId: string) => {
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
      <h1 className="text-white text-4xl md:text-5xl font-medium mb-10">Who's watching?</h1>
      <div className="flex flex-wrap gap-6 justify-center max-w-2xl">
        {profiles.map((p, i) => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            className="flex flex-col items-center gap-3 group"
          >
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded flex items-center justify-center text-3xl font-bold text-white group-hover:ring-4 ring-white transition-all"
              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-400 group-hover:text-white transition-colors text-sm">
              {p.name}
            </span>
            {p.isKidsProfile && (
              <span className="text-xs bg-[#0071EB] text-white px-2 py-0.5 rounded">KIDS</span>
            )}
          </button>
        ))}

        {/* Add profile button */}
        {profiles.length < 5 && (
          <button className="flex flex-col items-center gap-3 group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
              <svg className="w-12 h-12 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span className="text-gray-400 group-hover:text-white text-sm">Add Profile</span>
          </button>
        )}
      </div>
    </div>
  );
}
