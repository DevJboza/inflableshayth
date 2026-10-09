import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { hasDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";
type CampaignRow = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  total: number;
  sent: number;
  active: number;
  problems: number;
};

function displayStatus(row: CampaignRow) {
  if (row.total > 0 && row.sent === row.total)
    return {
      label: "Completada",
      Icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50",
    };
  if (row.problems > 0 && row.active === 0)
    return {
      label: "Requiere atención",
      Icon: AlertCircle,
      color: "text-amber-700 bg-amber-50",
    };
  if (row.active > 0)
    return {
      label: row.sent ? "Enviando" : "En cola",
      Icon: Clock3,
      color: "text-purple-700 bg-purple-50",
    };
  return {
    label: row.status,
    Icon: Clock3,
    color: "text-slate-700 bg-slate-50",
  };
}

export default async function Page() {
  const rows = hasDatabase()
    ? await query<CampaignRow>`
    select c.id,c.name,c.status,c.created_at::text,count(j.id)::int total,
      count(j.id) filter (where j.status='sent')::int sent,
      count(j.id) filter (where j.status in ('pending','claimed'))::int active,
      count(j.id) filter (where j.status not in ('sent','pending','claimed'))::int problems
    from campaigns c left join email_jobs j on j.campaign_id=c.id
    group by c.id order by c.created_at desc`
    : [];
  return (
    <>
      <PageHeader
        title="Campañas"
        subtitle="Consulta fácilmente si tus correos están en cola, enviándose o terminados."
        action={
          <Link href="/campanas/nueva" className="btn btn-primary">
            <Plus size={17} />
            Crear campaña
          </Link>
        }
      />
      <div className="card p-4 mb-4 bg-purple-50 border-purple-100 text-sm text-purple-900">
        <b>¿Ves “En cola”?</b> Todo está bien: el sistema recoge los correos
        automáticamente y puede tardar hasta 10 minutos en comenzar.
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Progreso</th>
              <th>Estado</th>
              <th>Creada</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const state = displayStatus(row);
              return (
                <tr key={row.id}>
                  <td>
                    <b>{row.name}</b>
                  </td>
                  <td>
                    <b>
                      {row.sent} de {row.total}
                    </b>{" "}
                    enviados
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${state.color}`}
                    >
                      <state.Icon size={14} />
                      {state.label}
                    </span>
                  </td>
                  <td>
                    {new Date(row.created_at).toLocaleDateString("es-CR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <div className="p-12 text-center">
            <b>No hay campañas todavía</b>
            <p className="muted text-sm mt-1">
              Pulsa “Crear campaña” para comenzar.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
