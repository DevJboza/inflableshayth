import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { hasDatabase, query } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page() {
  const rows = hasDatabase()
    ? await query<{
        id: string;
        name: string;
        subject: string;
        status: string;
        created_at: string;
      }>`select id,name,subject,status,created_at::text from campaigns order by created_at desc`
    : [];
  return (
    <>
      <PageHeader
        title="Campañas"
        subtitle="Borradores, envíos programados y campañas completadas."
        action={
          <Link href="/campanas/nueva" className="btn btn-primary">
            <Plus size={17} />
            Nueva campaña
          </Link>
        }
      />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Asunto</th>
              <th>Estado</th>
              <th>Creada</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.name}</b>
                </td>
                <td>{r.subject}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
                <td>{new Date(r.created_at).toLocaleDateString("es-CR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="p-12 text-center">
            <b>No hay campañas todavía</b>
            <p className="muted text-sm mt-1">Crea un borrador para empezar.</p>
          </div>
        )}
      </div>
    </>
  );
}
