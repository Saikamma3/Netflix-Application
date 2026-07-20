import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { getRedis } from "../../../shared/cache/redis.client";
import { TokenPair, JwtPayload } from "../../../shared/types";

const prisma = new PrismaClient();
const ACCESS_SECRET  = () => process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXP     = () => process.env.JWT_ACCESS_EXPIRES_IN  || "15m";
const REFRESH_EXP    = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_TTL    = 7 * 24 * 3600;

function err(msg: string, code = 400): Error & { statusCode: number } {
  return Object.assign(new Error(msg), { statusCode: code });
}

export class AuthService {
  async register(email: string, password: string): Promise<TokenPair> {
    if (await prisma.user.findUnique({ where: { email } })) throw err("Email already registered", 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    // Auto-create a default profile
    await prisma.profile.create({ data: { userId: user.id, name: email.split("@")[0] } });
    return this.issue(user.id, user.email);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw err("Invalid credentials", 401);
    return this.issue(user.id, user.email);
  }

  async refresh(token: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try { payload = jwt.verify(token, REFRESH_SECRET()) as JwtPayload; }
    catch { throw err("Invalid refresh token", 401); }

    const stored = await getRedis().get(`refresh:${payload.sub}`);
    if (stored !== token) throw err("Refresh token revoked", 401);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw err("User not found", 401);
    return this.issue(user.id, user.email, payload.profileId);
  }

  async logout(userId: string): Promise<void> {
    await getRedis().del(`refresh:${userId}`);
  }

  async selectProfile(userId: string, profileId: string): Promise<TokenPair> {
    const profile = await prisma.profile.findFirst({ where: { id: profileId, userId } });
    if (!profile) throw err("Profile not found", 404);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw err("User not found", 401);
    return this.issue(user.id, user.email, profileId);
  }

  private async issue(userId: string, email: string, profileId?: string): Promise<TokenPair> {
    const base: Omit<JwtPayload, "iat" | "exp"> = { sub: userId, email, ...(profileId ? { profileId } : {}) };
    const accessToken  = jwt.sign(base, ACCESS_SECRET(),  { expiresIn: ACCESS_EXP(),  jwtid: uuidv4() });
    const refreshToken = jwt.sign(base, REFRESH_SECRET(), { expiresIn: REFRESH_EXP(), jwtid: uuidv4() });
    await getRedis().set(`refresh:${userId}`, refreshToken, "EX", REFRESH_TTL);
    return { accessToken, refreshToken };
  }
}
