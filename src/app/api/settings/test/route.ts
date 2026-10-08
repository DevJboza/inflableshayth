import { NextRequest, NextResponse } from "next/server";
import { requireSession, assertSameOrigin } from "@/lib/auth";
export async function POST(req: NextRequest) {
  await requireSession();
  assertSameOrigin(req);
  if (!process.env.N8N_WEBHOOK_URL)
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL no configurada" },
      { status: 400 },
    );
  try {
    const r = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-integration-secret": process.env.N8N_INTEGRATION_SECRET || "",
      },
      body: JSON.stringify({ type: "health-check" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error();
    return NextResponse.json({ message: "n8n respondió correctamente" });
  } catch {
    return NextResponse.json(
      { error: "n8n no respondió. Revisa URL, secreto y workflow." },
      { status: 502 },
    );
  }
}
