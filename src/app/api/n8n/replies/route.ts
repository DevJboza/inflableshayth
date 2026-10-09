import { NextRequest, NextResponse } from "next/server";
import { integrationAllowed } from "@/lib/integration-auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  gmailMessageId: z.string(),
  threadId: z.string().optional(),
  from: z.email(),
  subject: z.string(),
  bodyText: z.string().max(100000),
  receivedAt: z.iso.datetime(),
  inReplyTo: z.string().optional(),
});
export async function POST(req: NextRequest) {
  if (!integrationAllowed(req))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const v = schema.parse(await req.json());
  const [message] =
    await db()`select m.campaign_id,cr.institution_id from email_messages m join campaign_recipients cr on cr.id=m.recipient_id where (${v.threadId || ""}<>'' and m.thread_id=${v.threadId || ""}) or lower(m.email)=lower(${v.from}) order by m.sent_at desc limit 1`;
  if (!message) return NextResponse.json({ ok: true, ignored: true });
  const unsubscribe =
    /(^|\s)(no|baja|desuscribir|no deseo|no quiero|dejar de recibir)(\s|$)/i.test(
      v.bodyText,
    );
  await db().begin(async (sql) => {
    await sql`insert into replies(institution_id,campaign_id,gmail_message_id,thread_id,sender,subject,body_text,received_at) values(${message.institution_id},${message.campaign_id},${v.gmailMessageId},${v.threadId || null},${v.from},${v.subject},${v.bodyText},${v.receivedAt}) on conflict(gmail_message_id) do nothing`;
    await sql`update institutions set status=${unsubscribe ? "No contactar" : "Respondió"},contact_permission=${unsubscribe ? "No autorizado" : "Autorizado"},last_contact_at=${v.receivedAt} where id=${message.institution_id}`;
    await sql`update email_messages set status='replied',replied_at=${v.receivedAt} where campaign_id=${message.campaign_id} and lower(email)=lower(${v.from})`;
    if (unsubscribe)
      await sql`insert into suppression_list(email,reason,source) values(${v.from},'Solicitud recibida por correo','automatic') on conflict(lower(email)) do nothing`;
  });
  return NextResponse.json({ ok: true, unsubscribe });
}
