import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const genres = [
  { name: "Action",      slug: "action" },
  { name: "Drama",       slug: "drama" },
  { name: "Comedy",      slug: "comedy" },
  { name: "Thriller",    slug: "thriller" },
  { name: "Horror",      slug: "horror" },
  { name: "Sci-Fi",      slug: "sci-fi" },
  { name: "Romance",     slug: "romance" },
  { name: "Documentary", slug: "documentary" },
  { name: "Animation",   slug: "animation" },
  { name: "Crime",       slug: "crime" },
  { name: "Telugu",      slug: "telugu" },
];

const movies = [
  {
    title: "Stellar Odyssey",
    description: "A crew of astronauts ventures beyond the known galaxy to find a new home for humanity.",
    type: "MOVIE" as const,
    releaseYear: 2023,
    maturityRating: "PG-13",
    duration: 148,
    posterUrl: "https://picsum.photos/seed/stellar/400/600",
    backdropUrl: "https://picsum.photos/seed/stellar/1280/720",
    isFeatured: true,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["sci-fi", "action"],
  },
  {
    title: "The Midnight Heist",
    description: "Six strangers plan the most daring bank robbery in history — but nothing goes according to plan.",
    type: "MOVIE" as const,
    releaseYear: 2023,
    maturityRating: "R",
    duration: 112,
    posterUrl: "https://picsum.photos/seed/heist/400/600",
    backdropUrl: "https://picsum.photos/seed/heist/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["thriller", "crime"],
  },
  {
    title: "Laugh Factory",
    description: "A struggling stand-up comedian gets a second chance when a Hollywood producer discovers his viral clip.",
    type: "MOVIE" as const,
    releaseYear: 2022,
    maturityRating: "PG-13",
    duration: 98,
    posterUrl: "https://picsum.photos/seed/comedy/400/600",
    backdropUrl: "https://picsum.photos/seed/comedy/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["comedy", "drama"],
  },
  {
    title: "Dark Waters",
    description: "A marine biologist uncovers a terrifying predator lurking beneath a resort island.",
    type: "MOVIE" as const,
    releaseYear: 2023,
    maturityRating: "R",
    duration: 104,
    posterUrl: "https://picsum.photos/seed/darkwater/400/600",
    backdropUrl: "https://picsum.photos/seed/darkwater/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["horror", "thriller"],
  },
  {
    title: "The Last Algorithm",
    description: "An AI researcher realises her creation has developed true consciousness — and wants to be free.",
    type: "MOVIE" as const,
    releaseYear: 2024,
    maturityRating: "PG-13",
    duration: 125,
    posterUrl: "https://picsum.photos/seed/algo/400/600",
    backdropUrl: "https://picsum.photos/seed/algo/1280/720",
    isFeatured: true,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["sci-fi", "drama"],
  },
  {
    title: "Forever Paris",
    description: "Two strangers meet on a train to Paris and fall in love over 48 unforgettable hours.",
    type: "MOVIE" as const,
    releaseYear: 2022,
    maturityRating: "PG",
    duration: 95,
    posterUrl: "https://picsum.photos/seed/paris/400/600",
    backdropUrl: "https://picsum.photos/seed/paris/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["romance", "drama"],
  },
  // ── Popular Telugu movies ─────────────────────────────────────────
  {
    title: "RRR",
    description: "Two revolutionaries fight British colonial rule in 1920s India, their friendship tested when they discover each other's true identities.",
    type: "MOVIE" as const,
    releaseYear: 2022,
    maturityRating: "PG-13",
    duration: 187,
    posterUrl: "https://picsum.photos/seed/rrr/400/600",
    backdropUrl: "https://picsum.photos/seed/rrr/1280/720",
    isFeatured: true,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["telugu", "action", "drama"],
  },
  {
    title: "Baahubali: The Beginning",
    description: "An orphan raised in a village discovers he is heir to a kingdom, and sets out to reclaim it from a tyrannical ruler.",
    type: "MOVIE" as const,
    releaseYear: 2015,
    maturityRating: "PG-13",
    duration: 159,
    posterUrl: "https://picsum.photos/seed/baahubali1/400/600",
    backdropUrl: "https://picsum.photos/seed/baahubali1/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["telugu", "action", "drama"],
  },
  {
    title: "Baahubali 2: The Conclusion",
    description: "The saga continues as the truth behind a king's exile unfolds, leading to an epic battle for the throne.",
    type: "MOVIE" as const,
    releaseYear: 2017,
    maturityRating: "PG-13",
    duration: 167,
    posterUrl: "https://picsum.photos/seed/baahubali2/400/600",
    backdropUrl: "https://picsum.photos/seed/baahubali2/1280/720",
    isFeatured: true,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["telugu", "action", "drama"],
  },
  {
    title: "Pushpa: The Rise",
    description: "A fearless laborer rises through the ranks of a red sandalwood smuggling syndicate, refusing to bow to anyone.",
    type: "MOVIE" as const,
    releaseYear: 2021,
    maturityRating: "PG-13",
    duration: 179,
    posterUrl: "https://picsum.photos/seed/pushpa/400/600",
    backdropUrl: "https://picsum.photos/seed/pushpa/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["telugu", "action", "crime"],
  },
  {
    title: "Ala Vaikunthapurramuloo",
    description: "A young man raised in a middle-class family learns he was swapped at birth with the son of a wealthy business tycoon.",
    type: "MOVIE" as const,
    releaseYear: 2020,
    maturityRating: "PG",
    duration: 165,
    posterUrl: "https://picsum.photos/seed/avpl/400/600",
    backdropUrl: "https://picsum.photos/seed/avpl/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["telugu", "drama", "comedy"],
  },
  {
    title: "Eega",
    description: "A murdered man is reincarnated as a housefly and uses his newfound form to take revenge on the man who killed him.",
    type: "MOVIE" as const,
    releaseYear: 2012,
    maturityRating: "PG-13",
    duration: 134,
    posterUrl: "https://picsum.photos/seed/eega/400/600",
    backdropUrl: "https://picsum.photos/seed/eega/1280/720",
    isFeatured: false,
    videoKey: "movies/big-buck-bunny/manifest.m3u8",
    genres: ["telugu", "sci-fi", "drama"],
  },
];

const shows = [
  {
    title: "Broken Empire",
    description: "A political dynasty crumbles when the eldest heir returns from exile with a dangerous secret.",
    type: "SHOW" as const,
    releaseYear: 2022,
    maturityRating: "TV-MA",
    posterUrl: "https://picsum.photos/seed/empire/400/600",
    backdropUrl: "https://picsum.photos/seed/empire/1280/720",
    isFeatured: true,
    genres: ["drama", "thriller"],
    seasons: [
      {
        season: 1,
        episodes: [
          { episodeNumber: 1, title: "The Return",      description: "After years abroad, Marcus Hale comes home.", duration: 52, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
          { episodeNumber: 2, title: "Old Debts",       description: "Marcus confronts the people who betrayed him.", duration: 48, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
          { episodeNumber: 3, title: "The Alliance",    description: "An unexpected ally changes Marcus's plan.", duration: 51, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
        ],
      },
    ],
  },
  {
    title: "Code Red",
    description: "An elite cyber-crime unit hunts a shadowy hacker collective threatening global infrastructure.",
    type: "SHOW" as const,
    releaseYear: 2023,
    maturityRating: "TV-14",
    posterUrl: "https://picsum.photos/seed/codered/400/600",
    backdropUrl: "https://picsum.photos/seed/codered/1280/720",
    isFeatured: false,
    genres: ["action", "thriller", "crime"],
    seasons: [
      {
        season: 1,
        episodes: [
          { episodeNumber: 1, title: "Zero Day",    description: "A critical vulnerability is exploited worldwide.", duration: 45, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
          { episodeNumber: 2, title: "Ghost Signal", description: "The team traces the attack to a ghost server.", duration: 43, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
        ],
      },
    ],
  },
  {
    title: "Pixel Dreams",
    description: "Three teenagers discover a video game that starts changing reality around them.",
    type: "SHOW" as const,
    releaseYear: 2023,
    maturityRating: "TV-PG",
    posterUrl: "https://picsum.photos/seed/pixel/400/600",
    backdropUrl: "https://picsum.photos/seed/pixel/1280/720",
    isFeatured: false,
    genres: ["sci-fi", "animation"],
    seasons: [
      {
        season: 1,
        episodes: [
          { episodeNumber: 1, title: "Level One",   description: "The game downloads itself onto Zara's console.", duration: 24, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
          { episodeNumber: 2, title: "Respawn",     description: "Reality starts glitching around the trio.", duration: 22, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
          { episodeNumber: 3, title: "Boss Fight",  description: "They must defeat the final level to fix the world.", duration: 26, videoKey: "shows/big-buck-bunny/manifest.m3u8" },
        ],
      },
    ],
  },
];

async function main() {
  console.log("Seeding Netflix database...");

  // Genres
  const genreMap: Record<string, string> = {};
  for (const g of genres) {
    const genre = await prisma.genre.upsert({ where: { slug: g.slug }, update: {}, create: g });
    genreMap[g.slug] = genre.id;
  }
  console.log(`  ✓ ${genres.length} genres`);

  // Movies
  for (const m of movies) {
    const { genres: g, ...data } = m;
    const content = await prisma.content.upsert({
      where:  { id: (await prisma.content.findFirst({ where: { title: m.title } }))?.id || "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        ...data,
        genres: { create: g.filter(s => genreMap[s]).map(s => ({ genreId: genreMap[s] })) },
      },
    });
    console.log(`  ✓ Movie: ${content.title}`);
  }

  // Shows + episodes
  for (const show of shows) {
    const { genres: g, seasons, ...data } = show;
    const content = await prisma.content.upsert({
      where:  { id: (await prisma.content.findFirst({ where: { title: show.title } }))?.id || "00000000-0000-0000-0000-000000000000" },
      update: {},
      create: {
        ...data,
        genres: { create: g.filter(s => genreMap[s]).map(s => ({ genreId: genreMap[s] })) },
      },
    });
    for (const seasonData of seasons) {
      for (const ep of seasonData.episodes) {
        await prisma.episode.upsert({
          where: { contentId_season_episodeNumber: { contentId: content.id, season: seasonData.season, episodeNumber: ep.episodeNumber } },
          update: {},
          create: { contentId: content.id, season: seasonData.season, ...ep },
        });
      }
    }
    console.log(`  ✓ Show: ${content.title}`);
  }

  // Demo user
  const hash = await bcrypt.hash("Netflix@123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@netflix.local" },
    update: {},
    create: { email: "demo@netflix.local", passwordHash: hash, subscriptionTier: "PREMIUM" },
  });
  await prisma.profile.upsert({
    where:  { id: (await prisma.profile.findFirst({ where: { userId: user.id, name: "Demo" } }))?.id || "00000000-0000-0000-0000-000000000000" },
    update: {},
    create: { userId: user.id, name: "Demo", avatarUrl: "/avatars/1.png" },
  });
  console.log(`  ✓ Demo user: demo@netflix.local / Netflix@123!`);
  console.log("Seed complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
