"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  Clock3,
  Monitor,
  Send,
  Smartphone,
} from "lucide-react";
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
};
export function CampaignEditor() {
  const router = useRouter();
  const requestKey = useRef(crypto.randomUUID());
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [recipients, setRecipients] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch("/api/templates").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/institutions").then((r) => (r.ok ? r.json() : [])),
    ]).then(([items, institutions]) => {
      setTemplates(items);
      setRecipients(
        institutions.filter(
          (i: { status: string }) => i.status !== "No contactar",
        ).length,
      );
    });
  }, []);
  function chooseTemplate(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setSelected(id);
    setName(template.name);
    setSubject(template.subject);
    setHtml(template.html);
  }
  async function startCampaign() {
    if (!selected) return toast.error("Primero selecciona una plantilla");
    if (!recipients)
      return toast.error("No hay instituciones disponibles para contactar");
    if (
      !confirm(
        `Se preparará esta campaña para ${recipients} destinatario${recipients === 1 ? "" : "s"}. ¿Deseas continuar?`,
      )
    )
      return;
    setBusy(true);
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        subject,
        html,
        action: "start",
        idempotencyKey: requestKey.current,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "No fue posible preparar la campaña");
      setBusy(false);
      return;
    }
    toast.success(
      `${result.jobs} correo${result.jobs === 1 ? "" : "s"} en cola. El primero saldrá en un máximo de 10 minutos.`,
      { duration: 7000 },
    );
    router.push("/campanas");
    router.refresh();
  }
  const preview = html
    .replaceAll("{{institucion}}", "Institución Ejemplo")
    .replaceAll("{{contacto}}", "María")
    .replaceAll("{{provincia}}", "San José")
    .replaceAll("{{empresa}}", "Inflables Shayth");
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <Step
          number={1}
          title="Elige qué deseas enviar"
          detail="La plantilla ya incluye diseño, texto y enlaces."
        />
        <div className="grid grid-cols-2 gap-3 responsive-grid">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => chooseTemplate(template.id)}
              className={`text-left rounded-2xl border p-4 transition ${selected === template.id ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100" : "border-slate-200 bg-white hover:border-purple-300"}`}
            >
              <div className="flex justify-between gap-3">
                <b>{template.name}</b>
                {selected === template.id && (
                  <Check className="text-purple-600" size={19} />
                )}
              </div>
              <p className="muted text-sm mt-2">{template.subject}</p>
            </button>
          ))}
        </div>
      </section>
      {selected && (
        <section className="grid grid-cols-[.7fr_1.3fr] gap-5 responsive-grid">
          <div className="card p-6">
            <Step
              number={2}
              title="Revisa los detalles"
              detail="Puedes ajustar el nombre y asunto."
            />
            <label className="block mb-4">
              <span className="label">Nombre para identificarla</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Asunto del correo</span>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <details className="mt-5 border-t border-slate-100 pt-4">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-600">
                <ChevronDown size={16} />
                Opciones avanzadas
              </summary>
              <textarea
                className="textarea font-mono text-xs mt-3"
                rows={10}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
            </details>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <b>Así se verá el correo</b>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Vista de computadora"
                  className="btn btn-secondary !p-2"
                  onClick={() => setMobile(false)}
                >
                  <Monitor size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Vista de teléfono"
                  className="btn btn-secondary !p-2"
                  onClick={() => setMobile(true)}
                >
                  <Smartphone size={17} />
                </button>
              </div>
            </div>
            <div
              className={`card bg-white mx-auto overflow-hidden ${mobile ? "max-w-[375px]" : "w-full"}`}
            >
              <iframe
                title="Vista previa"
                sandbox=""
                className="w-full h-[610px] border-0"
                srcDoc={preview}
              />
            </div>
          </div>
        </section>
      )}
      <section className="card p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <Clock3 size={18} className="text-purple-600" />
            {recipients} destinatario{recipients === 1 ? "" : "s"}
          </div>
          <p className="muted text-sm mt-1">
            Los correos salen de uno en uno. El primero puede tardar hasta 10
            minutos.
          </p>
        </div>
        <button
          type="button"
          disabled={busy || !selected || !recipients}
          onClick={startCampaign}
          className="btn btn-primary min-w-48 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {busy ? "Preparando…" : "Confirmar y enviar"}
        </button>
      </section>
    </div>
  );
}
function Step({
  number,
  title,
  detail,
}: {
  number: number;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="size-9 shrink-0 rounded-full bg-purple-600 text-white grid place-items-center font-bold">
        {number}
      </div>
      <div>
        <h2 className="font-bold text-lg">{title}</h2>
        <p className="muted text-sm">{detail}</p>
      </div>
    </div>
  );
}
