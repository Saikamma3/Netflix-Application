import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { logoutThunk, clearAuth } from "../store/auth.slice";

export function Navbar() {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    dispatch(clearAuth());
    navigate("/login");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 transition-all duration-300 ${
      scrolled ? "bg-[#141414]" : "bg-gradient-to-b from-black/80 to-transparent"
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link to="/browse">
          <span className="text-[#E50914] font-extrabold text-3xl tracking-tighter select-none">
            NETFLIX
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
          <Link to="/browse"   className="hover:text-white transition-colors">Home</Link>
          <Link to="/browse?genre=action" className="hover:text-white transition-colors">TV Shows</Link>
          <Link to="/browse?genre=drama"  className="hover:text-white transition-colors">Movies</Link>
          <Link to="/my-list"  className="hover:text-white transition-colors">My List</Link>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Link to="/search" className="text-gray-300 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
        <button onClick={handleLogout}
          className="text-sm text-gray-300 hover:text-white transition-colors">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
