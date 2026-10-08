import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { institutionSchema } from "@/lib/validation";
export async function POST(req: NextRequest) {
  await requireSession();
  assertSameOrigin(req);
  const rows = await req.json();
  if (!Array.isArray(rows) || rows.length > 5000)
    return NextResponse.json(
      { error: "El CSV debe contener entre 1 y 5000 filas" },
      { status: 400 },
    );
  let imported = 0,
    skipped = 0;
  for (const raw of rows) {
    const p = institutionSchema.safeParse({
      name: raw.nombre || raw.name,
      email: raw.correo || raw.email,
      phone: raw.telefono || raw.phone || "",
      province: raw.provincia || raw.province || "",
      canton: raw.canton || "",
      contactName: raw.contacto || raw.contactName || "",
      type: raw.tipo || raw.type || "Otra",
      status: raw.estado || raw.status || "Sin contactar",
      notes: raw.notas || raw.notes || "",
    });
    if (!p.success) {
      skipped++;
      continue;
    }
    const v = p.data;
    const result =
      await db()`insert into institutions(name,email,phone,province,canton,contact_name,type,status,notes) values(${v.name},${v.email},${v.phone},${v.province},${v.canton},${v.contactName},${v.type},${v.status},${v.notes}) on conflict do nothing returning id`;
    if (result.length) imported++;
    else skipped++;
  }
  await db()`insert into activity_logs(action,entity_type,metadata) values(${"Importación CSV: " + imported + " instituciones"},'institution',${JSON.stringify({ imported, skipped })}::jsonb)`;
  return NextResponse.json({ imported, skipped });
}
