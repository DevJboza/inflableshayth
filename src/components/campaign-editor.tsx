"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Monitor, Smartphone, Save, Play, Send } from "lucide-react";
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
  is_default: boolean;
};
const defaultHtml = `<div style="font-family:Arial;color:#342a43;line-height:1.6"><img src="{{logo_url}}" alt="Inflables Shayth" width="110"><h1 style="color:#9256d9">¡Hola, {{institucion}}!</h1><p>En <strong>Inflables Shayth</strong> creamos experiencias alegres y seguras para actividades escolares.</p><p>Nos encantaría ayudarles a organizar su próxima celebración con una propuesta adaptada a sus necesidades.</p><p><a href="https://wa.me/50664043069" style="background:#9256d9;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Solicitar cotización</a></p><p>Con cariño,<br>Equipo de Inflables Shayth<br>+506 6404-3069</p><p style="font-size:11px;color:#777">Si no desea recibir más promociones, responda a este correo con la palabra NO o use el enlace de exclusión.</p></div>`;
export function CampaignEditor() {
  const [html, setHtml] = useState(defaultHtml),
    [mobile, setMobile] = useState(false),
    [recipients, setRecipients] = useState(0),
    [templates, setTemplates] = useState<EmailTemplate[]>([]),
    [subject, setSubject] = useState("");
  useEffect(() => {
    fetch("/api/institutions")
      .then((r) => (r.ok ? r.json() : []))
      .then((x) =>
        setRecipients(
          x.filter((i: { status: string }) => i.status !== "No contactar")
            .length,
        ),
      );
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : []))
      .then((items: EmailTemplate[]) => setTemplates(items));
  }, []);
  function selectTemplate(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setHtml(template.html);
    setSubject(template.subject);
  }
  async function submit(form: HTMLFormElement, start = false) {
    if (
      start &&
      !confirm(
        `Se crearán trabajos para ${recipients} destinatarios elegibles. ¿Continuar?`,
      )
    )
      return;
    const f = new FormData(form),
      body = {
        name: f.get("name"),
        subject: f.get("subject"),
        html,
        action: start ? "start" : "draft",
      };
    const r = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      j = await r.json();
    if (r.ok)
      toast.success(
        start
          ? `Campaña iniciada: ${j.jobs} trabajos creados`
          : "Borrador guardado",
      );
    else toast.error(j.error);
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
    >
      <div className="grid grid-cols-[1.05fr_.95fr] gap-5 responsive-grid">
        <section className="card p-6 space-y-4">
          <label>
            <span className="label">Plantilla</span>
            <select
              className="select"
              defaultValue=""
              onChange={(event) => selectTemplate(event.target.value)}
            >
              <option value="" disabled>
                Seleccionar plantilla…
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Nombre interno</span>
            <input
              className="input"
              name="name"
              required
              placeholder="Promoción regreso a clases"
            />
          </label>
          <label>
            <span className="label">Asunto</span>
            <input
              className="input"
              name="subject"
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Una actividad especial para {{institucion}}"
            />
          </label>
          <div>
            <span className="label">Contenido HTML</span>
            <textarea
              className="textarea font-mono text-xs"
              rows={18}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
            <p className="muted text-xs mt-2">
              Variables:{" "}
              {"{{institucion}}, {{contacto}}, {{provincia}}, {{empresa}}"}
            </p>
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center mb-3">
            <b>Vista previa</b>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn btn-secondary !p-2"
                onClick={() => setMobile(false)}
              >
                <Monitor size={17} />
              </button>
              <button
                type="button"
                className="btn btn-secondary !p-2"
                onClick={() => setMobile(true)}
              >
                <Smartphone size={17} />
              </button>
            </div>
          </div>
          <div
            className={`card bg-white mx-auto overflow-hidden transition-all ${mobile ? "max-w-[375px]" : "w-full"}`}
          >
            <iframe
              title="Vista previa"
              sandbox=""
              className="w-full h-[570px] border-0"
              srcDoc={html
                .replaceAll("{{institucion}}", "Institución Ejemplo")
                .replaceAll("{{contacto}}", "María")
                .replaceAll("{{provincia}}", "San José")
                .replaceAll("{{empresa}}", "Inflables Shayth")}
            />
          </div>
        </section>
      </div>
      <div className="sticky bottom-4 card p-3 mt-5 flex justify-between items-center gap-3">
        <span className="muted text-sm">
          <b>{recipients}</b> destinatarios elegibles
        </span>
        <div className="flex gap-2">
          <button className="btn btn-secondary">
            <Save size={17} />
            Guardar borrador
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              toast.info("Configura Gmail/n8n para enviar pruebas reales")
            }
          >
            <Send size={17} />
            Enviar prueba
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => submit(e.currentTarget.form!, true)}
          >
            <Play size={17} />
            Iniciar campaña
          </button>
        </div>
      </div>
    </form>
  );
}
