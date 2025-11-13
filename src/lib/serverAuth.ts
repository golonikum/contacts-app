import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User as PrismaUser } from "@prisma/client";
import { User } from "@/types/user";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: PrismaUser): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookie() {
  const token = (await cookies()).get("token")?.value;
  return token;
}

export async function verifyTokenFromCookie() {
  const token = await getTokenFromCookie();
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
