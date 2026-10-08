import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireSession();
  assertSameOrigin(req);
  const { id } = await params;
  await db()`update institutions set deleted_at=now() where id=${id}`;
  return NextResponse.json({ ok: true });
}
