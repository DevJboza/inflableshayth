import { NextRequest, NextResponse } from "next/server";
import { integrationAllowed } from "@/lib/integration-auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!integrationAllowed(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { limit = 1 } = await req.json().catch(() => ({}));
  const safe = Math.max(1, Math.min(Number(limit) || 1, 10));
  const jobs = await db().begin(async (sql) => {
    await sql`select pg_advisory_xact_lock(hashtext('shayth-sender-daily'))`;
    const stale =
      await sql`update email_jobs set status='uncertain',completed_at=now(),last_error='El envío quedó interrumpido y requiere revisión' where status='claimed' and claimed_at < now()-interval '20 minutes' returning campaign_id`;
    if (stale.length) {
      const affected = [...new Set(stale.map((row) => row.campaign_id))];
      await sql`update campaigns set status='Con errores',updated_at=now() where id in ${sql(affected)}`;
    }
    const [settings] =
      await sql`select coalesce((select value::int from app_settings where key='daily_limit'),20) global_limit`;
    const [usage] =
      await sql`select count(*)::int sent from email_messages where status='sent' and (sent_at at time zone 'America/Costa_Rica')::date=(now() at time zone 'America/Costa_Rica')::date`;
    const remaining = Math.max(0, settings.global_limit - usage.sent);
    if (!remaining) return [];
    const claimLimit = Math.min(safe, remaining);
    const claimed = await sql`
      with campaign_usage as (
        select c.id,count(m.id)::int sent_today from campaigns c
        left join email_messages m on m.campaign_id=c.id and m.status='sent'
          and (m.sent_at at time zone c.timezone)::date=(now() at time zone c.timezone)::date
        group by c.id
      ), chosen as (
        select j.id from email_jobs j
        join campaigns c on c.id=j.campaign_id
        join campaign_usage u on u.id=c.id
        join campaign_recipients cr on cr.id=j.recipient_id
        join institutions i on i.id=cr.institution_id
        left join suppression_list s on lower(s.email)=lower(cr.email)
        where j.status='pending' and j.available_at<=now()
          and c.status in ('Programada','En ejecución') and c.scheduled_at<=now()
          and extract(isodow from now() at time zone c.timezone)::int=any(c.allowed_days)
          and (now() at time zone c.timezone)::time between c.send_start and c.send_end
          and u.sent_today<c.daily_limit and i.type='Escuela'
          and i.contact_permission='Autorizado' and i.status<>'No contactar' and s.id is null
          and i.email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        order by c.scheduled_at,j.created_at for update of j skip locked limit ${claimLimit}
      )
      update email_jobs j set status='claimed',claimed_at=now(),attempts=attempts+1
      from chosen where j.id=chosen.id returning j.*`;
    if (claimed.length) {
      const campaignIds = [...new Set(claimed.map((job) => job.campaign_id))];
      await sql`update campaigns set status='En ejecución',started_at=coalesce(started_at,now()),updated_at=now() where id in ${sql(campaignIds)} and status='Programada'`;
    }
    return claimed;
  });
  if (!jobs.length) return NextResponse.json({ jobs: [] });
  const ids = (jobs as { id: string }[]).map((job) => job.id);
  const full =
    await db()`select j.id,j.idempotency_key,j.attempts,c.id campaign_id,c.subject,c.html,c.catalog_path,i.name institution,i.contact_name contact,i.province,cr.email from email_jobs j join campaigns c on c.id=j.campaign_id join campaign_recipients cr on cr.id=j.recipient_id join institutions i on i.id=cr.institution_id where j.id in ${db()(ids)}`;
  return NextResponse.json({ jobs: full });
}
