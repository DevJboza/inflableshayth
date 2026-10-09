import { PageHeader } from "@/components/page-header";
import { hasDatabase, query } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page() {
  const rows = hasDatabase()
    ? await query<{
        id: string;
        institution: string;
        sender: string;
        subject: string;
        body_text: string;
        received_at: string;
        followup_status: string;
      }>`select r.id,coalesce(i.name,'Sin asociar') institution,r.sender,r.subject,r.body_text,r.received_at::text,r.followup_status from replies r left join institutions i on i.id=r.institution_id order by r.received_at desc`
    : [];
  return (
    <>
      <PageHeader
        title="Respuestas"
        subtitle="Mensajes recibidos de escuelas que respondieron a tus campañas."
      />
      <div className="space-y-3">
        {rows.map((r) => (
          <article className="card p-5" key={r.id}>
            <div className="flex justify-between gap-3">
              <div>
                <b>{r.institution}</b>
                <p className="text-sm">{r.subject}</p>
              </div>
              <span className="badge">{r.followup_status}</span>
            </div>
            <p className="muted text-sm mt-3 line-clamp-3">{r.body_text}</p>
            <div className="muted text-xs mt-3">
              {r.sender} · {new Date(r.received_at).toLocaleString("es-CR")}
            </div>
          </article>
        ))}
        {!rows.length && (
          <div className="card p-12 text-center">
            <b>No hay respuestas sincronizadas</b>
            <p className="muted text-sm mt-1">
              El workflow de Gmail registrará aquí únicamente mensajes reales.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
