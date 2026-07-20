import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { ContentCard } from "../components/ContentCard";
import { userApi } from "../api/user.api";
import { Content } from "../types";

export function MyList() {
  const [items,   setItems]   = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getWatchlist()
      .then(({ data }) => setItems(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="pt-24 px-6 md:px-16 pb-16">
        <h1 className="text-white text-2xl font-semibold mb-6">My List</h1>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"/>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 4v16m8-8H4"/>
            </svg>
            <p className="text-gray-400 text-lg mb-2">Your list is empty</p>
            <p className="text-gray-500 text-sm">Add movies and shows to watch later.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map(c => <ContentCard key={c.id} content={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
