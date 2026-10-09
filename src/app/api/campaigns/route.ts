import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { campaignSchema } from "@/lib/validation";
import { cleanEmailHtml } from "@/lib/sanitize";
import { estimateCompletion } from "@/lib/scheduling";

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    assertSameOrigin(req);
    const raw = await req.json();
    const v = campaignSchema.parse(raw);
    const html = cleanEmailHtml(v.html);
    const start = raw.action === "start";
    const startDate = v.scheduledAt.slice(0, 10);
    const result = await db().begin(async (sql) => {
      const [existing] =
        await sql`select * from campaigns where request_key=${v.idempotencyKey}`;
      if (existing) return { campaign: existing, reused: true };
      const status = start
        ? new Date(v.scheduledAt) > new Date()
          ? "Programada"
          : "En ejecución"
        : "Preparada";
      const [campaign] = await sql`
        insert into campaigns(name,subject,html,template_id,status,request_key,scheduled_at,audience_mode,audience_province,audience_canton,daily_limit,allowed_days,send_start,send_end,timezone,catalog_path)
        values(${v.name},${v.subject},${html},${v.templateId},${status},${v.idempotencyKey},${v.scheduledAt},${v.audienceMode},${v.province || null},${v.canton || null},${v.dailyLimit},${v.allowedDays},${v.sendStart},${v.sendEnd},'America/Costa_Rica',${v.catalogPath}) returning *`;
      const selectedIds = v.institutionIds.length
        ? v.institutionIds
        : ["00000000-0000-0000-0000-000000000000"];
      if (start)
        await sql`
          insert into campaign_recipients(campaign_id,institution_id,email,status)
          select ${campaign.id},i.id,lower(i.email),'Pendiente'
          from institutions i left join suppression_list s on lower(s.email)=lower(i.email)
          where i.deleted_at is null and i.type='Escuela' and i.contact_permission='Autorizado'
            and i.email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
            and i.status<>'No contactar' and s.id is null
            and (${v.audienceMode} not in ('province','canton') or i.province=${v.province})
            and (${v.audienceMode}<>'canton' or i.canton=${v.canton})
            and (${v.audienceMode}<>'custom' or i.id in ${sql(selectedIds)})
          on conflict do nothing`;
      if (start)
        await sql`
          insert into email_jobs(campaign_id,recipient_id,status,idempotency_key)
          select ${campaign.id},cr.id,'pending',encode(sha256((${campaign.id}::text||':'||lower(cr.email))::bytea),'hex')
          from campaign_recipients cr where cr.campaign_id=${campaign.id} on conflict do nothing`;
      const [{ count }] =
        await sql`select count(*)::int count from email_jobs where campaign_id=${campaign.id}`;
      if (start && count === 0)
        throw new Error(
          "No hay escuelas autorizadas que cumplan los filtros seleccionados",
        );
      const estimate = estimateCompletion({
        recipients: count,
        dailyLimit: v.dailyLimit,
        startDate,
        allowedDays: v.allowedDays,
      });
      await sql`update campaigns set estimated_completion=${estimate} where id=${campaign.id}`;
      await sql`insert into activity_logs(action,entity_type,entity_id) values(${start ? `Campaña iniciada: ${v.name}` : `Campaña preparada: ${v.name}`},'campaign',${campaign.id})`;
      return {
        campaign: { ...campaign, estimated_completion: estimate },
        reused: false,
      };
    });
    const [{ count }] =
      await db()`select count(*)::int count from email_jobs where campaign_id=${result.campaign.id}`;
    return NextResponse.json({
      campaign: result.campaign,
      jobs: count,
      reused: result.reused,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear la campaña",
      },
      { status: 400 },
    );
  }
}
