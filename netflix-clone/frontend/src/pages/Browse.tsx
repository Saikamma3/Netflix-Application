import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { HeroBanner } from "../components/HeroBanner";
import { ContentRow } from "../components/ContentRow";
import { contentApi } from "../api/content.api";
import { userApi } from "../api/user.api";
import { Content, Genre, WatchProgress } from "../types";

export function Browse() {
  const [params] = useSearchParams();
  const genreFilter = params.get("genre");

  const [featured,  setFeatured]  = useState<Content[]>([]);
  const [genres,    setGenres]    = useState<Genre[]>([]);
  const [byGenre,   setByGenre]   = useState<Record<string, Content[]>>({});
  const [continueW, setContinueW] = useState<WatchProgress[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [featuredRes, genresRes, continueRes] = await Promise.all([
          contentApi.getFeatured(),
          contentApi.getGenres(),
          userApi.getContinueWatching(),
        ]);
        setFeatured(featuredRes.data.data);
        setGenres(genresRes.data.data);
        setContinueW(continueRes.data.data);

        // Load first 5 genres (or filtered genre)
        const targetGenres = genreFilter
          ? genresRes.data.data.filter(g => g.slug === genreFilter)
          : genresRes.data.data.slice(0, 6);

        const rows = await Promise.all(
          targetGenres.map(g => contentApi.getByGenre(g.slug).then(r => ({ slug: g.slug, items: r.data.data })))
        );
        const map: Record<string, Content[]> = {};
        rows.forEach(r => { map[r.slug] = r.items; });
        setByGenre(map);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [genreFilter]);

  if (loading) return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const heroContent = featured[0];

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {heroContent && <HeroBanner content={heroContent} />}

      <div className="-mt-16 relative z-10 pb-16">
        {/* Continue Watching */}
        {continueW.length > 0 && (
          <ContentRow
            title="Continue Watching"
            items={continueW.filter(w => w.content).map(w => w.content!)}
          />
        )}

        {/* Featured row */}
        {featured.length > 1 && (
          <ContentRow title="Featured on Netflix" items={featured.slice(1)} />
        )}

        {/* Genre rows */}
        {genres.map(g => byGenre[g.slug]?.length > 0 && (
          <ContentRow key={g.id} title={g.name} items={byGenre[g.slug] || []} />
        ))}
      </div>
    </div>
  );
}
