import { NextRequest, NextResponse } from "next/server";
import { integrationAllowed } from "@/lib/integration-auth";
import { db } from "@/lib/db";
import { z } from "zod";
const schema = z.object({
  jobId: z.uuid(),
  status: z.enum(["sent", "failed", "uncertain", "rate_limited", "auth_error"]),
  gmailMessageId: z.string().max(255).optional(),
  gmailThreadId: z.string().max(255).optional(),
  error: z.string().max(2000).optional(),
});
export async function POST(req: NextRequest) {
  if (!integrationAllowed(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const v = schema.parse(await req.json());
  await db().begin(async (sql) => {
    const [j] =
      await sql`select j.*,cr.email,c.subject from email_jobs j join campaign_recipients cr on cr.id=j.recipient_id join campaigns c on c.id=j.campaign_id where j.id=${v.jobId} for update`;
    if (!j) return;
    if (j.status === "sent") return;
    const terminal =
      v.status === "sent" || v.status === "uncertain" || j.attempts >= 3;
    const nextStatus =
      !terminal && v.status === "failed" ? "pending" : v.status;
    await sql`update email_jobs set status=${nextStatus},last_error=${v.error || null},completed_at=${terminal ? new Date() : null},available_at=${terminal ? new Date() : new Date(Date.now() + 15 * 60000)} where id=${v.jobId}`;
    if (v.status === "sent")
      await sql`insert into email_messages(campaign_id,recipient_id,email,subject,gmail_message_id,thread_id,status,sent_at) values(${j.campaign_id},${j.recipient_id},${j.email},${j.subject},${v.gmailMessageId || null},${v.gmailThreadId || null},'sent',now()) on conflict(gmail_message_id) do nothing`;
    if (v.status === "auth_error" || v.status === "rate_limited")
      await sql`update campaigns set status='Pausada' where id=${j.campaign_id}`;
    const [progress] = await sql`
      select count(*)::int total,
        count(*) filter (where status='sent')::int sent,
        count(*) filter (where status in ('pending','claimed'))::int active,
        count(*) filter (where status not in ('sent','pending','claimed'))::int problems
      from email_jobs where campaign_id=${j.campaign_id}`;
    if (progress.total > 0 && progress.sent === progress.total)
      await sql`update campaigns set status='Completada',completed_at=now() where id=${j.campaign_id} and status<>'Cancelada'`;
    else if (progress.active === 0 && progress.problems > 0)
      await sql`update campaigns set status='Requiere atención' where id=${j.campaign_id}`;
  });
  return NextResponse.json({ ok: true });
}
