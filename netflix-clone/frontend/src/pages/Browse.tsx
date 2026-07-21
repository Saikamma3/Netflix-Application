import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { HeroBanner } from "../components/HeroBanner";
import { ContentRow } from "../components/ContentRow";
import { contentApi } from "../api/content.api";
import { userApi } from "../api/user.api";
import { Content, Genre, WatchProgress } from "../types";

export function Browse() {
  const [params]     = useSearchParams();
  const genreFilter  = params.get("genre");

  const [featured,   setFeatured]   = useState<Content[]>([]);
  const [genres,     setGenres]     = useState<Genre[]>([]);
  const [byGenre,    setByGenre]    = useState<Record<string, Content[]>>({});
  const [telugu,     setTelugu]     = useState<Content[]>([]);
  const [continueW,  setContinueW]  = useState<WatchProgress[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [featuredRes, genresRes, continueRes, teluguRes] = await Promise.all([
          contentApi.getFeatured(),
          contentApi.getGenres(),
          userApi.getContinueWatching(),
          contentApi.getByGenre("telugu"),
        ]);
        setFeatured(featuredRes.data.data);
        setGenres(genresRes.data.data);
        setContinueW(continueRes.data.data);
        setTelugu(teluguRes.data.data);

        const targetGenres = genreFilter
          ? genresRes.data.data.filter((g: Genre) => g.slug === genreFilter && g.slug !== "telugu")
          : genresRes.data.data.filter((g: Genre) => g.slug !== "telugu").slice(0, 6);

        const rows = await Promise.all(
          targetGenres.map((g: Genre) =>
            contentApi.getByGenre(g.slug).then((r: { data: { data: Content[] } }) => ({
              slug: g.slug,
              items: r.data.data,
            }))
          )
        );
        const map: Record<string, Content[]> = {};
        rows.forEach((r: { slug: string; items: Content[] }) => { map[r.slug] = r.items; });
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

  // Build progress map: contentId → percent watched (0-100)
  const progressMap: Record<string, number> = {};
  continueW.forEach((w) => {
    if (w.content?.duration && w.content.duration > 0) {
      progressMap[w.contentId] = Math.min(
        (w.secondsWatched / (w.content.duration * 60)) * 100,
        100
      );
    }
  });

  const continueItems = continueW.filter((w) => w.content).map((w) => w.content!);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {heroContent && <HeroBanner content={heroContent} />}

      {/* Rows sit below the hero with slight overlap for that Netflix look */}
      <div className="-mt-16 relative z-10 pb-20">
        {/* Continue Watching */}
        {continueItems.length > 0 && (
          <ContentRow
            title={`Continue Watching`}
            items={continueItems}
            progressMap={progressMap}
          />
        )}

        {/* Featured row (excludes hero item) */}
        {featured.length > 1 && (
          <ContentRow
            title="Featured on Netflix"
            items={featured.slice(1)}
          />
        )}

        {/* Telugu Movies — always shown, regardless of genre pagination */}
        {telugu.length > 0 && (
          <ContentRow title="Telugu Movies" items={telugu} />
        )}

        {/* Genre rows */}
        {genres.map((g) =>
          byGenre[g.slug]?.length > 0 ? (
            <ContentRow key={g.id} title={g.name} items={byGenre[g.slug]} />
          ) : null
        )}
      </div>
    </div>
  );
}
