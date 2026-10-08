import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
const schema = z.object({ action: z.enum(["pause", "resume", "cancel"]) });
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireSession();
  assertSameOrigin(req);
  const { id } = await params;
  const { action } = schema.parse(await req.json());
  const desired = {
    pause: "Pausada",
    resume: "En ejecución",
    cancel: "Cancelada",
  }[action];
  const [campaign] =
    await db()`update campaigns set status=${desired},updated_at=now() where id=${id} and status not in ('Completada','Cancelada') returning id,name,status`;
  if (!campaign)
    return NextResponse.json(
      { error: "La campaña no admite esa acción" },
      { status: 409 },
    );
  await db()`insert into activity_logs(action,entity_type,entity_id) values(${`Campaña ${action}: ${campaign.name}`},'campaign',${id})`;
  return NextResponse.json(campaign);
}
