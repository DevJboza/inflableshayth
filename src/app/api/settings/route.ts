import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
const schema = z.object({
  business_name: z.string().min(2).max(100),
  sender_email: z.email(),
  whatsapp: z.string().min(8).max(30),
  daily_limit: z.coerce.number().int().min(1).max(500),
  send_interval_seconds: z.coerce.number().int().min(30).max(3600),
  signature: z.string().max(2000),
});
export async function PUT(req: NextRequest) {
  await requireSession();
  assertSameOrigin(req);
  const v = schema.parse(await req.json());
  for (const [k, val] of Object.entries(v))
    await db()`insert into app_settings(key,value) values(${k},${String(val)}) on conflict(key) do update set value=excluded.value,updated_at=now()`;
  return NextResponse.json({ ok: true });
}
