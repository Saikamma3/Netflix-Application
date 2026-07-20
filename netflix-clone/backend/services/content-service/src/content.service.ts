import { PrismaClient } from "@prisma/client";
import { cache } from "../../../shared/cache/cache.service";
import { ContentDto, EpisodeDto, GenreDto } from "../../../shared/types";

const prisma = new PrismaClient();

const CONTENT_INCLUDE = {
  genres: { include: { genre: true } },
};

function toDto(c: {
  id: string; title: string; description: string; type: string;
  releaseYear: number; maturityRating: string; duration: number | null;
  posterUrl: string; backdropUrl: string; isFeatured: boolean;
  genres: { genre: { id: string; name: string; slug: string } }[];
}): ContentDto {
  return {
    id: c.id, title: c.title, description: c.description,
    type: c.type as "MOVIE" | "SHOW", releaseYear: c.releaseYear,
    maturityRating: c.maturityRating, duration: c.duration,
    posterUrl: c.posterUrl, backdropUrl: c.backdropUrl, isFeatured: c.isFeatured,
    genres: c.genres.map(g => g.genre) as GenreDto[],
  };
}

function toEpDto(e: {
  id: string; season: number; episodeNumber: number;
  title: string; description: string; duration: number; thumbnailUrl: string | null;
}): EpisodeDto {
  return {
    id: e.id, season: e.season, episodeNumber: e.episodeNumber,
    title: e.title, description: e.description,
    duration: e.duration, thumbnailUrl: e.thumbnailUrl,
  };
}

export class ContentService {
  async getFeatured(): Promise<ContentDto[]> {
    return cache.getOrSet("content:featured", async () => {
      const rows = await prisma.content.findMany({
        where: { isFeatured: true },
        include: CONTENT_INCLUDE,
        take: 5,
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toDto);
    }, 600);
  }

  async getGenres(): Promise<GenreDto[]> {
    return cache.getOrSet("genres:all", () => prisma.genre.findMany({ orderBy: { name: "asc" } }), 3600);
  }

  async getByGenre(slug: string, page = 1, pageSize = 20): Promise<{ items: ContentDto[]; total: number }> {
    const key = `content:genre:${slug}:${page}`;
    return cache.getOrSet(key, async () => {
      const genre = await prisma.genre.findUnique({ where: { slug } });
      if (!genre) return { items: [], total: 0 };
      const [rows, total] = await prisma.$transaction([
        prisma.content.findMany({
          where: { genres: { some: { genreId: genre.id } } },
          include: CONTENT_INCLUDE,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { releaseYear: "desc" },
        }),
        prisma.content.count({ where: { genres: { some: { genreId: genre.id } } } }),
      ]);
      return { items: rows.map(toDto), total };
    }, 300);
  }

  async search(q: string): Promise<ContentDto[]> {
    if (!q || q.trim().length < 2) return [];
    const rows = await prisma.content.findMany({
      where: {
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: CONTENT_INCLUDE,
      take: 30,
    });
    return rows.map(toDto);
  }

  async getById(id: string): Promise<ContentDto> {
    return cache.getOrSet(`content:${id}`, async () => {
      const c = await prisma.content.findUnique({ where: { id }, include: CONTENT_INCLUDE });
      if (!c) throw Object.assign(new Error("Content not found"), { statusCode: 404 });
      return toDto(c);
    }, 600);
  }

  async getEpisodes(contentId: string, season?: number): Promise<EpisodeDto[]> {
    const key = `episodes:${contentId}:${season ?? "all"}`;
    return cache.getOrSet(key, async () => {
      const rows = await prisma.episode.findMany({
        where: { contentId, ...(season ? { season } : {}) },
        orderBy: [{ season: "asc" }, { episodeNumber: "asc" }],
      });
      return rows.map(toEpDto);
    }, 600);
  }
}
