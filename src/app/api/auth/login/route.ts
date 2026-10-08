import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  safeEqual,
  SESSION_COOKIE,
  assertSameOrigin,
} from "@/lib/auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    if (!checkRateLimit(ip))
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta en 15 minutos." },
        { status: 429 },
      );
    const { password } = await req.json();
    if (
      typeof password !== "string" ||
      !process.env.ADMIN_PASSWORD ||
      !safeEqual(password, process.env.ADMIN_PASSWORD)
    )
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 },
      );
    clearRateLimit(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 43200,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "No fue posible iniciar sesión. Revisa la configuración." },
      { status: 500 },
    );
  }
}
