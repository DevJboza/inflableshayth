import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
export async function proxy(req: NextRequest) {
  const token = req.cookies.get("shayth_session")?.value;
  let valid = false;
  try {
    if (token && process.env.SESSION_SECRET)
      valid =
        (
          await jwtVerify(
            token,
            new TextEncoder().encode(process.env.SESSION_SECRET),
          )
        ).payload.role === "admin";
  } catch {
    valid = false;
  }
  if (!valid) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/instituciones/:path*",
    "/campanas/:path*",
    "/respuestas/:path*",
    "/historial/:path*",
    "/configuracion/:path*",
  ],
};
