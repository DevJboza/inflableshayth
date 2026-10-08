import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, SESSION_COOKIE } from "@/lib/auth";
export async function POST(req: NextRequest) {
  assertSameOrigin(req);
  const r = NextResponse.json({ ok: true });
  r.cookies.set(SESSION_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
  });
  return r;
}
