import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CampaignControls } from "@/components/campaign-controls";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign] = await db()`select c.*,
    count(j.id)::int total,count(j.id) filter(where j.status='sent')::int sent,
    count(j.id) filter(where j.status='pending' or j.status='claimed')::int pending,
    count(j.id) filter(where j.status in ('failed','uncertain','rate_limited','auth_error'))::int failed,
    (select count(*)::int from replies r where r.campaign_id=c.id) replies
    from campaigns c left join email_jobs j on j.campaign_id=c.id where c.id=${id} group by c.id`;
  if (!campaign) notFound();
  const progress = campaign.total
    ? Math.round((campaign.sent / campaign.total) * 100)
    : 0;
  const cards = [
    ["Destinatarios", campaign.total, Mail],
    ["Enviados", campaign.sent, CheckCircle2],
    ["Pendientes", campaign.pending, Clock3],
    ["Con problemas", campaign.failed, TriangleAlert],
    ["Respuestas", campaign.replies, MessageSquare],
  ] as const;
  return (
    <>
      <Link
        href="/campanas"
        className="inline-flex gap-2 items-center text-sm font-bold text-purple-700 mb-4"
      >
        <ArrowLeft size={16} />
        Volver a campañas
      </Link>
      <PageHeader
        title={campaign.name}
        subtitle={`Estado: ${campaign.status}`}
        action={<CampaignControls id={id} status={campaign.status} />}
      />
      <section className="card p-6 mb-5">
        <div className="flex justify-between mb-2">
          <b>Progreso</b>
          <b>{progress}%</b>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>
      <section className="grid grid-cols-5 gap-3 responsive-grid">
        {cards.map(([label, value, Icon]) => (
          <article key={label} className="card p-5">
            <Icon size={20} className="text-purple-600" />
            <div className="text-2xl font-extrabold mt-3">{value}</div>
            <div className="muted text-sm">{label}</div>
          </article>
        ))}
      </section>
      <section className="card p-6 mt-5">
        <h2 className="font-bold flex items-center gap-2">
          <CalendarDays size={19} />
          Plan de envío
        </h2>
        <div className="grid grid-cols-2 gap-4 mt-4 responsive-grid">
          <Info
            label="Inicio"
            value={
              campaign.scheduled_at
                ? new Date(campaign.scheduled_at).toLocaleString("es-CR")
                : "—"
            }
          />
          <Info
            label="Finalización estimada"
            value={
              campaign.estimated_completion
                ? new Date(
                    `${campaign.estimated_completion}T12:00:00`,
                  ).toLocaleDateString("es-CR", { dateStyle: "long" })
                : "—"
            }
          />
          <Info
            label="Máximo diario"
            value={`${campaign.daily_limit} correos`}
          />
          <Info
            label="Horario"
            value={`${String(campaign.send_start).slice(0, 5)} a ${String(campaign.send_end).slice(0, 5)}`}
          />
        </div>
      </section>
    </>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="muted text-xs font-bold uppercase">{label}</div>
      <b>{value}</b>
    </div>
  );
}
