import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { campaignSchema } from "@/lib/validation";
import { cleanEmailHtml } from "@/lib/sanitize";
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    assertSameOrigin(req);
    const raw = await req.json(),
      v = campaignSchema.parse(raw),
      html = cleanEmailHtml(v.html);
    const start = raw.action === "start";
    const [c] = await db().begin(async (sql) => {
      const rows =
        await sql`insert into campaigns(name,subject,html,status) values(${v.name},${v.subject},${html},${start ? "En ejecución" : "Borrador"}) returning *`;
      if (start)
        await sql`insert into campaign_recipients(campaign_id,institution_id,email,status) select ${rows[0].id},i.id,i.email,'Pendiente' from institutions i left join suppression_list s on s.email=i.email where i.deleted_at is null and i.status<>'No contactar' and s.email is null on conflict do nothing`;
      if (start)
        await sql`insert into email_jobs(campaign_id,recipient_id,status,idempotency_key) select ${rows[0].id},cr.id,'pending',encode(sha256((${rows[0].id}::text||':'||cr.id::text)::bytea),'hex') from campaign_recipients cr where cr.campaign_id=${rows[0].id} on conflict do nothing`;
      await sql`insert into activity_logs(action,entity_type,entity_id) values(${start ? "Campaña iniciada: " + v.name : "Borrador creado: " + v.name},'campaign',${rows[0].id})`;
      return rows;
    });
    const [{ count }] =
      await db()`select count(*)::int count from email_jobs where campaign_id=${c.id}`;
    if (start && process.env.N8N_WEBHOOK_URL)
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-integration-secret": process.env.N8N_INTEGRATION_SECRET || "",
        },
        body: JSON.stringify({ campaignId: c.id }),
      }).catch(() => {});
    return NextResponse.json({ campaign: c, jobs: count });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo crear" },
      { status: 400 },
    );
  }
}
