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
  const [i] =
    await db()`select id from institutions where lower(email)=lower(${v.from}) and deleted_at is null limit 1`;
  await db().begin(async (sql) => {
    await sql`insert into replies(institution_id,gmail_message_id,thread_id,sender,subject,body_text,received_at) values(${i?.id || null},${v.gmailMessageId},${v.threadId || null},${v.from},${v.subject},${v.bodyText},${v.receivedAt}) on conflict(gmail_message_id) do nothing`;
    if (i)
      await sql`update institutions set status='Respondió',last_contact_at=${v.receivedAt} where id=${i.id}`;
  });
  return NextResponse.json({ ok: true });
}
