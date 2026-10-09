import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  await requireSession();
  const templates = await db()`
    select id, name, kind, subject, html, is_default
    from email_templates
    order by is_default desc, name asc
  `;
  return NextResponse.json(templates);
}
