import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual, createHash, randomBytes } from "crypto";
export const SESSION_COOKIE = "shayth_session";
const enc = new TextEncoder();
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
  return enc.encode(s);
}
export function safeEqual(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export async function createSession() {
  return new SignJWT({ role: "admin", nonce: randomBytes(12).toString("hex") })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}
export async function verifySession(token?: string) {
  if (!token) return false;
  try {
    return (await jwtVerify(token, secret())).payload.role === "admin";
  } catch {
    return false;
  }
}
export async function requireSession() {
  if (!(await verifySession((await cookies()).get(SESSION_COOKIE)?.value)))
    throw new Error("No autorizado");
}
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin"),
    host = req.headers.get("host");
  if (origin && new URL(origin).host !== host)
    throw new Error("Origen inválido");
}
