import { cookies } from "next/headers";
import { verifyToken } from "./auth";

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
