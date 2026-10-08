import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { institutionSchema } from "@/lib/validation";
export async function GET() {
  await requireSession();
  const rows =
    await db()`select id,name,email,phone,province,canton,contact_name,type,status,notes,last_contact_at from institutions where deleted_at is null order by created_at desc`;
  return NextResponse.json(rows);
}
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    assertSameOrigin(req);
    const v = institutionSchema.parse(await req.json());
    const [row] =
      await db()`insert into institutions(name,email,phone,province,canton,contact_name,type,status,notes) values(${v.name},${v.email},${v.phone},${v.province},${v.canton},${v.contactName},${v.type},${v.status},${v.notes}) returning *`;
    await db()`insert into activity_logs(action,entity_type,entity_id) values(${"Institución creada: " + v.name},'institution',${row.id})`;
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Datos inválidos";
    return NextResponse.json(
      { error: m.includes("unique") ? "Ese correo ya está registrado" : m },
      { status: 400 },
    );
  }
}
