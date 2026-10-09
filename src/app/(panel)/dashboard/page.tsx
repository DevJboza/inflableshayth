import Link from "next/link";
import {
  Building2,
  Send,
  MessageSquare,
  Heart,
  Plus,
  Wifi,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { hasDatabase, query } from "@/lib/db";
export const dynamic = "force-dynamic";
type Stats = {
  institutions: number;
  sent: number;
  replies: number;
  interested: number;
  queued: number;
};
export default async function Dashboard() {
  let s: Stats = {
      institutions: 0,
      sent: 0,
      replies: 0,
      interested: 0,
      queued: 0,
    },
    activities: { action: string; created_at: string }[] = [];
  let ready = hasDatabase();
  if (ready)
    try {
      const rows =
        await query<Stats>`select (select count(*)::int from institutions where deleted_at is null) institutions,(select count(*)::int from email_messages where status='sent') sent,(select count(*)::int from replies) replies,(select count(*)::int from institutions where status in ('Interesado','Cotización solicitada','Cliente')) interested,(select count(*)::int from email_jobs where status in ('pending','claimed')) queued`;
      s = rows[0];
      activities = await query<{
        action: string;
        created_at: string;
      }>`select action,created_at::text from activity_logs order by created_at desc limit 6`;
    } catch {
      ready = false;
    }
  const cards = [
    ["Instituciones", s.institutions, Building2, "#9256d9"],
    ["Correos enviados", s.sent, Send, "#55afe9"],
    ["Respuestas", s.replies, MessageSquare, "#e66da9"],
    ["Interesadas", s.interested, Heart, "#ef8f56"],
  ] as const;
  return (
    <>
      <PageHeader
        title="Buenos días 👋"
        subtitle="Este es el pulso comercial de Inflables Shayth."
        action={
          <Link className="btn btn-primary" href="/campanas/nueva">
            <Plus size={18} />
            Nueva campaña
          </Link>
        }
      />
      {!ready && (
        <div className="card p-4 mb-5 border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <b>Configuración pendiente.</b> Conecta Supabase con{" "}
          <code>DATABASE_URL</code> y ejecuta la migración. No se muestran datos
          ficticios.
        </div>
      )}
      <section className="grid grid-cols-4 gap-4 responsive-grid">
        {cards.map(([label, value, Icon, color]) => (
          <article className="card p-5" key={label}>
            <div className="flex justify-between">
              <span className="muted text-sm font-semibold">{label}</span>
              <span
                className="rounded-xl p-2"
                style={{ background: `${color}18`, color }}
              >
                <Icon size={19} />
              </span>
            </div>
            <div className="text-3xl font-extrabold mt-5">{value}</div>
          </article>
        ))}
      </section>
      <section className="grid grid-cols-[2fr_1fr] gap-5 mt-5 responsive-grid">
        <div className="card p-6 min-h-72">
          <h2 className="font-bold">Actividad reciente</h2>
          {activities.length ? (
            <div className="mt-4 space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="border-b border-slate-100 pb-3 text-sm">
                  {a.action}
                  <div className="muted text-xs mt-1">
                    {new Date(a.created_at).toLocaleString("es-CR")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center h-52 text-center">
              <div>
                <MessageSquare className="mx-auto text-purple-300" />
                <p className="font-semibold mt-3">Aún no hay actividad</p>
                <p className="muted text-sm">
                  Las acciones reales aparecerán aquí.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-bold mb-4">Conexiones</h2>
            <div className="flex items-center justify-between py-2">
              <span className="flex gap-2 items-center">
                <Wifi size={17} />
                Gmail
              </span>
              <span className="badge">
                {s.sent > 0 ? "Operativo" : "Listo para probar"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex gap-2 items-center">
                <Workflow size={17} />
                n8n
              </span>
              <span className="badge">
                {process.env.N8N_INTEGRATION_SECRET ? "Conectado" : "Pendiente"}
              </span>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Próximos envíos</h2>
            <p className="muted text-sm mt-4">
              {s.queued > 0
                ? `${s.queued} correo${s.queued === 1 ? "" : "s"} esperando envío. El sistema los procesará automáticamente.`
                : "No hay correos esperando envío."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
