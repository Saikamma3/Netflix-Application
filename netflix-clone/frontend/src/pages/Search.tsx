import { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { ContentCard } from "../components/ContentCard";
import { contentApi } from "../api/content.api";
import { Content } from "../types";

export function Search() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.length < 2) { setResults([]); return; }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await contentApi.search(query);
        setResults(data.data);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="pt-24 px-6 md:px-16">
        {/* Search input */}
        <div className="relative mb-10 max-w-xl">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, genres..."
            className="w-full bg-[#222] text-white pl-12 pr-4 py-4 rounded text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"/>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-gray-400 text-sm mb-4">{results.length} results for "{query}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {results.map(c => <ContentCard key={c.id} content={c} />)}
            </div>
          </>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white text-xl mb-2">No results for "{query}"</p>
            <p className="text-gray-400 text-sm">Try a different title or genre.</p>
          </div>
        )}

        {!loading && query.length < 2 && (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p className="text-gray-500">Start typing to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
