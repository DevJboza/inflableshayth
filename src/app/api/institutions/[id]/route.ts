import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  contactPermission: z.enum(["Pendiente", "Autorizado", "No autorizado"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireSession();
  assertSameOrigin(req);
  const { id } = await params;
  const { contactPermission } = updateSchema.parse(await req.json());
  const [row] = await db()`update institutions set contact_permission=${contactPermission},updated_at=now() where id=${id} and deleted_at is null returning id,contact_permission`;
  if (!row)
    return NextResponse.json({ error: "Escuela no encontrada" }, { status: 404 });
  if (contactPermission === "No autorizado")
    await db()`insert into suppression_list(email,reason,source) select email,'Marcado desde el panel','manual' from institutions where id=${id} on conflict(lower(email)) do nothing`;
  else if (contactPermission === "Autorizado")
    await db()`delete from suppression_list where source='manual' and lower(email)=(select lower(email) from institutions where id=${id})`;
  return NextResponse.json(row);
}
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
