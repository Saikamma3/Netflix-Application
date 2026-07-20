import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { logoutThunk, clearAuth } from "../store/auth.slice";

const NAV_LINKS = [
  { label: "Home",          to: "/browse"               },
  { label: "TV Shows",      to: "/browse?genre=drama"   },
  { label: "Movies",        to: "/browse?genre=action"  },
  { label: "New & Popular", to: "/browse?genre=sci-fi"  },
  { label: "My List",       to: "/my-list"              },
];

export function Navbar() {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [scrolled,    setScrolled]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef  = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await dispatch(logoutThunk());
    dispatch(clearAuth());
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (to: string) =>
    location.pathname + location.search === to ||
    (to === "/browse" && location.pathname === "/browse" && !location.search);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-16 transition-all duration-500 ${
        scrolled ? "bg-[#141414]" : "bg-gradient-to-b from-black/90 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between h-16">
        {/* ── Left: Logo + Nav links ── */}
        <div className="flex items-center gap-6">
          <Link to="/browse" className="flex-shrink-0">
            <span className="text-[#E50914] font-black text-2xl md:text-3xl tracking-tighter select-none">
              NETFLIX
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-4">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`text-xs transition-colors whitespace-nowrap ${
                  isActive(to) ? "text-white font-semibold" : "text-gray-300 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile: Browse dropdown */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-1 text-sm text-white font-semibold"
            >
              Browse
              <svg
                className={`w-3 h-3 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute top-8 left-0 bg-[#141414] border border-gray-700 rounded shadow-xl py-2 min-w-[160px] z-50">
                {NAV_LINKS.map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Search, Bell, Profile ── */}
        <div className="flex items-center gap-5">
          {/* Expandable search */}
          <form onSubmit={handleSearch}>
            <div
              className={`flex items-center overflow-hidden transition-all duration-300 rounded ${
                searchOpen
                  ? "w-52 border border-white/60 bg-black/80 px-2"
                  : "w-6"
              }`}
            >
              <button
                type="button"
                onClick={() => setSearchOpen(o => !o)}
                className="text-white flex-shrink-0 py-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
              {searchOpen && (
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-transparent text-white text-xs px-2 py-1 outline-none w-full placeholder-gray-400"
                />
              )}
            </div>
          </form>

          {/* Notification bell */}
          <button className="text-white hover:text-gray-300 transition-colors relative">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 4.07A7 7 0 0 1 19 11v4.25q1.58.12 3.1.28l-.2 2a93 93 0 0 0-19.8 0l-.2-2q1.52-.15 3.1-.28V11a7 7 0 0 1 6-6.93V2h2zm4 11.06V11a5 5 0 0 0-10 0v4.13a97 97 0 0 1 10 0m-8.37 4.24C8.66 20.52 10.15 22 12 22s3.34-1.48 3.37-2.63c.01-.22-.2-.37-.42-.37h-5.9c-.23 0-.43.15-.42.37"/>
            </svg>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-1.5 group"
            >
              <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                N
              </div>
              <svg
                className={`w-3 h-3 text-white transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-52 bg-[#141414] border border-gray-700 rounded shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#E50914] flex items-center justify-center text-white text-xs font-bold">N</div>
                    <p className="text-white text-sm">My Account</p>
                  </div>
                </div>
                <Link
                  to="/profiles"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Switch Profile
                </Link>
                <div className="border-t border-gray-700/60 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Sign out of Netflix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
