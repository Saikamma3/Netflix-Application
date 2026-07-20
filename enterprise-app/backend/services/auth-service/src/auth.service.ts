import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./db";
import { redisClient } from "./redis";
import { TokenPair, JwtPayload, UserRole } from "../../shared/types";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRY  = process.env.JWT_ACCESS_EXPIRES_IN  || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS  = 12;
const REFRESH_TTL_S  = 7 * 24 * 60 * 60; // 7 days in seconds

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const err = new Error("Email already in use") as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, role: UserRole.USER },
    });

    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw this.authError();
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw this.authError();
    }

    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(rawRefreshToken, REFRESH_SECRET) as JwtPayload;
    } catch {
      throw this.authError("Invalid refresh token");
    }

    const redisKey = `refresh:${payload.sub}`;
    const stored = await redisClient.get(redisKey);
    if (stored !== rawRefreshToken) {
      throw this.authError("Refresh token revoked or not found");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw this.authError("User not found");
    }

    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  async logout(userId: string): Promise<void> {
    await redisClient.del(`refresh:${userId}`);
  }

  private async issueTokens(userId: string, email: string, role: UserRole): Promise<TokenPair> {
    const payload: Omit<JwtPayload, "iat" | "exp"> = { sub: userId, email, role };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRY,
      jwtid: uuidv4(),
    });

    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRY,
      jwtid: uuidv4(),
    });

    // Store refresh token in Redis (revocable)
    await redisClient.set(`refresh:${userId}`, refreshToken, "EX", REFRESH_TTL_S);

    return { accessToken, refreshToken };
  }

  private authError(message = "Invalid credentials"): Error & { statusCode: number } {
    const err = new Error(message) as Error & { statusCode: number };
    err.statusCode = 401;
    return err;
  }
}
