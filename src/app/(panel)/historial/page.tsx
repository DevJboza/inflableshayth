import { PageHeader } from "@/components/page-header";
import { hasDatabase, query } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page() {
  const rows = hasDatabase()
    ? await query<{
        id: string;
        email: string;
        subject: string;
        status: string;
        gmail_message_id: string;
        sent_at: string;
      }>`select id,email,subject,status,gmail_message_id,sent_at::text from email_messages order by created_at desc limit 200`
    : [];
  return (
    <>
      <PageHeader
        title="Historial"
        subtitle="Trazabilidad verificable de los correos procesados."
      />
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Destinatario</th>
              <th>Asunto</th>
              <th>Estado</th>
              <th>ID Gmail</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.subject}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
                <td className="font-mono text-xs">
                  {r.gmail_message_id || "—"}
                </td>
                <td>
                  {r.sent_at
                    ? new Date(r.sent_at).toLocaleString("es-CR")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="p-12 text-center">
            <b>Aún no hay envíos registrados</b>
            <p className="muted text-sm">
              Aceptar un correo en Gmail se registra como “enviado”, no como
              “entregado”.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
