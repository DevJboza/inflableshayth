import Link from "next/link";
import { Clock3, Megaphone, MessageSquare, Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { hasDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";
type Stats = { active: number; sent: number; pending: number; replies: number };
type Recent = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  total: number;
  sent: number;
};
export default async function Dashboard() {
  let stats: Stats = { active: 0, sent: 0, pending: 0, replies: 0 },
    recent: Recent[] = [];
  if (hasDatabase()) {
    [stats] = await query<Stats>`select
      (select count(*)::int from campaigns where status in ('Programada','En ejecución','Pausada','Con errores')) active,
      (select count(*)::int from email_messages where status='sent') sent,
      (select count(*)::int from email_jobs where status in ('pending','claimed')) pending,
      (select count(*)::int from replies) replies`;
    recent =
      await query<Recent>`select c.id,c.name,c.status,c.created_at::text,count(j.id)::int total,count(j.id) filter(where j.status='sent')::int sent from campaigns c left join email_jobs j on j.campaign_id=c.id group by c.id order by c.created_at desc limit 6`;
  }
  const cards = [
    ["Campañas activas", stats.active, Megaphone, "#9256d9"],
    ["Correos enviados", stats.sent, Send, "#55afe9"],
    ["Correos pendientes", stats.pending, Clock3, "#ef8f56"],
    ["Respuestas recibidas", stats.replies, MessageSquare, "#e66da9"],
  ] as const;
  return (
    <>
      <PageHeader
        title="Inicio"
        subtitle="Consulta el avance de tus campañas en un solo lugar."
        action={
          <Link className="btn btn-primary" href="/campanas/nueva">
            <Plus size={18} />
            Nueva campaña
          </Link>
        }
      />
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
      <section className="card mt-5 overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-lg">Campañas recientes</h2>
            <p className="muted text-sm">
              Abre una campaña para consultar su progreso y controles.
            </p>
          </div>
          <Link href="/campanas" className="text-sm font-bold text-purple-700">
            Ver todas
          </Link>
        </div>
        {recent.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaña</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Inicio</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link
                        href={`/campanas/${c.id}`}
                        className="font-bold text-purple-800"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td>
                      <span className="badge">{c.status}</span>
                    </td>
                    <td>
                      {c.sent} de {c.total}
                    </td>
                    <td>
                      {new Date(c.created_at).toLocaleDateString("es-CR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Megaphone className="mx-auto text-purple-300" />
            <b className="block mt-3">Aún no hay campañas</b>
            <p className="muted text-sm">
              Crea la primera cuando tengas escuelas autorizadas.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
