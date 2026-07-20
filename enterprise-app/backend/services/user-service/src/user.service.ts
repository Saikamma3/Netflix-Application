import { prisma } from "./db";
import { redisClient } from "./redis";
import { UpdateUserDto, UserDto, UserRole } from "../../shared/types";

const CACHE_TTL = 300; // seconds

function cacheKey(id: string) {
  return `user:${id}`;
}

function toDto(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): UserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as UserRole,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserService {
  async findById(id: string): Promise<UserDto> {
    // Cache-aside: check Redis first
    const cached = await redisClient.get(cacheKey(id));
    if (cached) return JSON.parse(cached) as UserDto;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const err = Object.assign(new Error("User not found"), { statusCode: 404 });
      throw err;
    }

    const dto = toDto(user);
    await redisClient.set(cacheKey(id), JSON.stringify(dto), "EX", CACHE_TTL);
    return dto;
  }

  async findAll(page = 1, pageSize = 20): Promise<{ users: UserDto[]; total: number }> {
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return { users: users.map(toDto), total };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await prisma.user.update({
      where: { id },
      data: dto,
    });

    const updated = toDto(user);
    // Invalidate cache on write
    await redisClient.del(cacheKey(id));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
    await redisClient.del(cacheKey(id));
  }
}
