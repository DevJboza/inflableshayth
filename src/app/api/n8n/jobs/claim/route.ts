import { NextRequest, NextResponse } from "next/server";
import { integrationAllowed } from "@/lib/integration-auth";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  if (!integrationAllowed(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { limit = 10 } = await req.json().catch(() => ({}));
  const safe = Math.max(1, Math.min(Number(limit) || 10, 25));
  const jobs = await db().begin(
    async (sql) =>
      sql`with chosen as(select j.id from email_jobs j join campaigns c on c.id=j.campaign_id where j.status='pending' and j.available_at<=now() and c.status='En ejecución' order by j.created_at for update skip locked limit ${safe}) update email_jobs j set status='claimed',claimed_at=now(),attempts=attempts+1 from chosen where j.id=chosen.id returning j.*`,
  );
  if (!jobs.length) return NextResponse.json({ jobs: [] });
  const ids = jobs.map((j) => j.id);
  const full =
    await db()`select j.id,j.idempotency_key,j.attempts,c.id campaign_id,c.subject,c.html,i.name institution,i.contact_name contact,i.province,cr.email from email_jobs j join campaigns c on c.id=j.campaign_id join campaign_recipients cr on cr.id=j.recipient_id join institutions i on i.id=cr.institution_id where j.id in ${db()(ids)}`;
  return NextResponse.json({ jobs: full });
}
