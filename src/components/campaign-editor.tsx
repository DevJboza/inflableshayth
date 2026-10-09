"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Send,
  Smartphone,
} from "lucide-react";
import { estimateCompletion } from "@/lib/scheduling";

type Template = {
  id: string;
  name: string;
  subject: string;
  html: string;
  kind: string;
};
type School = {
  id: string;
  name: string;
  email: string;
  province: string;
  canton: string;
  type: string;
  status: string;
  contact_permission: string;
};
const DAYS = [
  [1, "Lun"],
  [2, "Mar"],
  [3, "Mié"],
  [4, "Jue"],
  [5, "Vie"],
  [6, "Sáb"],
  [7, "Dom"],
] as const;

export function CampaignEditor() {
  const router = useRouter();
  const requestKey = useRef(crypto.randomUUID());
  const [step, setStep] = useState(1),
    [templates, setTemplates] = useState<Template[]>([]),
    [schools, setSchools] = useState<School[]>([]);
  const [templateId, setTemplateId] = useState(""),
    [name, setName] = useState(""),
    [subject, setSubject] = useState(""),
    [html, setHtml] = useState("");
  const [audienceMode, setAudienceMode] = useState("all"),
    [province, setProvince] = useState(""),
    [canton, setCanton] = useState(""),
    [selectedIds, setSelectedIds] = useState<string[]>([]);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
  }).format(new Date());
  const [date, setDate] = useState(today),
    [startTime, setStartTime] = useState("08:00"),
    [endTime, setEndTime] = useState("16:00"),
    [dailyLimit, setDailyLimit] = useState(20),
    [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [mobile, setMobile] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/institutions").then((r) => r.json()),
    ]).then(([t, s]) => {
      setTemplates(t);
      setSchools(s);
    });
  }, []);
  const eligibleBase = useMemo(
    () =>
      schools.filter(
        (s) =>
          s.type === "Escuela" &&
          s.contact_permission === "Autorizado" &&
          s.status !== "No contactar",
      ),
    [schools],
  );
  const provinces = [
    ...new Set(eligibleBase.map((s) => s.province).filter(Boolean)),
  ].sort();
  const cantons = [
    ...new Set(
      eligibleBase
        .filter((s) => !province || s.province === province)
        .map((s) => s.canton)
        .filter(Boolean),
    ),
  ].sort();
  const eligible = eligibleBase.filter(
    (s) =>
      audienceMode === "all" ||
      (audienceMode === "province" && s.province === province) ||
      (audienceMode === "canton" &&
        s.province === province &&
        s.canton === canton) ||
      (audienceMode === "custom" && selectedIds.includes(s.id)),
  );
  const completion = estimateCompletion({
    recipients: eligible.length,
    dailyLimit,
    startDate: date,
    allowedDays: days,
  });
  const chosenTemplate = templates.find((t) => t.id === templateId);
  const preview = html
    .replaceAll("{{institucion}}", "Escuela Ejemplo")
    .replaceAll("{{contacto}}", "María")
    .replaceAll("{{provincia}}", "San José")
    .replaceAll("{{empresa}}", "Inflables Shayth");
  function chooseTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(id);
    setName(t.name);
    setSubject(t.subject);
    setHtml(t.html);
  }
  function next() {
    if (
      step === 1 &&
      (!templateId || name.trim().length < 2 || subject.trim().length < 2)
    )
      return toast.error("Completa el nombre, asunto y plantilla");
    if (step === 2 && !eligible.length)
      return toast.error("Selecciona al menos una escuela autorizada");
    if (step === 3 && (!days.length || startTime >= endTime))
      return toast.error("Revisa los días y el horario de envío");
    setStep((v) => Math.min(4, v + 1));
  }
  async function start() {
    if (
      !confirm(
        `Se crearán ${eligible.length} envíos. La campaña respetará el horario y límite elegidos. ¿Iniciar?`,
      )
    )
      return;
    setBusy(true);
    const scheduledAt = new Date(`${date}T${startTime}:00-06:00`).toISOString();
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        subject,
        html,
        action: "start",
        idempotencyKey: requestKey.current,
        templateId,
        audienceMode,
        province,
        canton,
        institutionIds: selectedIds,
        scheduledAt,
        dailyLimit,
        allowedDays: days,
        sendStart: startTime,
        sendEnd: endTime,
        catalogPath: "/catalogo-navideno.pdf",
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "No pudimos preparar la campaña");
      setBusy(false);
      return;
    }
    toast.success(
      "Campaña preparada correctamente. El sistema continuará automáticamente.",
      { duration: 7000 },
    );
    router.push(`/campanas/${result.campaign.id}`);
    router.refresh();
  }
  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="grid grid-cols-4 gap-2 responsive-grid">
          {["Campaña", "Destinatarios", "Programación", "Confirmación"].map(
            (label, index) => (
              <div
                key={label}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${step === index + 1 ? "bg-purple-600 text-white" : step > index + 1 ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}
              >
                {step > index + 1 ? "✓ " : `${index + 1}. `}
                {label}
              </div>
            ),
          )}
        </div>
      </div>
      {step === 1 && (
        <section className="card p-6 space-y-5">
          <StepTitle
            title="¿Qué deseas enviar?"
            detail="Elige una plantilla y revisa cómo la recibirá una escuela."
          />
          <div className="grid grid-cols-2 gap-3 responsive-grid">
            {templates.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => chooseTemplate(t.id)}
                className={`text-left rounded-2xl border p-4 ${templateId === t.id ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100" : "border-slate-200"}`}
              >
                <div className="flex justify-between">
                  <b>{t.name}</b>
                  {templateId === t.id && <Check size={18} />}
                </div>
                <p className="muted text-sm mt-2">{t.subject}</p>
              </button>
            ))}
          </div>
          {templateId && (
            <>
              <div className="grid grid-cols-2 gap-4 responsive-grid">
                <label>
                  <span className="label">Nombre de la campaña</span>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  <span className="label">Asunto del correo</span>
                  <input
                    className="input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <b>Vista previa</b>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="btn btn-secondary !p-2"
                      onClick={() => setMobile(false)}
                      aria-label="Computadora"
                    >
                      <Monitor size={17} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary !p-2"
                      onClick={() => setMobile(true)}
                      aria-label="Teléfono"
                    >
                      <Smartphone size={17} />
                    </button>
                  </div>
                </div>
                <div
                  className={`border rounded-2xl overflow-hidden mx-auto bg-white ${mobile ? "max-w-[375px]" : "w-full"}`}
                >
                  <iframe
                    title="Vista previa"
                    sandbox=""
                    srcDoc={preview}
                    className="w-full h-[460px] border-0"
                  />
                </div>
              </div>
            </>
          )}
        </section>
      )}
      {step === 2 && (
        <section className="card p-6 space-y-5">
          <StepTitle
            title="¿A cuáles escuelas?"
            detail="Solo aparecen escuelas con autorización registrada y que no han solicitado una baja."
          />
          <div className="grid grid-cols-2 gap-3 responsive-grid">
            {[
              ["all", "Todas las escuelas elegibles"],
              ["province", "Por provincia"],
              ["canton", "Por cantón"],
              ["custom", "Elegir manualmente"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAudienceMode(value)}
                className={`rounded-xl border p-4 text-left font-bold ${audienceMode === value ? "border-purple-500 bg-purple-50" : "border-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {["province", "canton"].includes(audienceMode) && (
            <div className="grid grid-cols-2 gap-4 responsive-grid">
              <label>
                <span className="label">Provincia</span>
                <select
                  className="select"
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCanton("");
                  }}
                >
                  <option value="">Seleccionar…</option>
                  {provinces.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              {audienceMode === "canton" && (
                <label>
                  <span className="label">Cantón</span>
                  <select
                    className="select"
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                  >
                    <option value="">Seleccionar…</option>
                    {cantons.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
          {audienceMode === "custom" && (
            <div className="border rounded-xl max-h-72 overflow-auto divide-y">
              {eligibleBase.map((s) => (
                <label key={s.id} className="flex gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={(e) =>
                      setSelectedIds((ids) =>
                        e.target.checked
                          ? [...ids, s.id]
                          : ids.filter((id) => id !== s.id),
                      )
                    }
                  />
                  <span>
                    <b>{s.name}</b>
                    <span className="block muted text-xs">
                      {s.email} · {s.province}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <div
            className={`rounded-2xl p-5 ${eligible.length ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}
          >
            <div className="text-3xl font-extrabold">{eligible.length}</div>
            <b>
              escuela{eligible.length === 1 ? "" : "s"} elegible
              {eligible.length === 1 ? "" : "s"}
            </b>
            {!eligibleBase.length && (
              <p className="text-sm mt-2">
                Primero registra la autorización de contacto desde la sección
                Escuelas.
              </p>
            )}
          </div>
        </section>
      )}
      {step === 3 && (
        <section className="card p-6 space-y-5">
          <StepTitle
            title="¿Cuándo se enviará?"
            detail="El sistema respetará estos límites aunque permanezca encendido todo el día."
          />
          <div className="grid grid-cols-2 gap-4 responsive-grid">
            <label>
              <span className="label">Fecha de inicio</span>
              <input
                type="date"
                min={today}
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              <span className="label">Máximo por día</span>
              <input
                type="number"
                min="1"
                max="500"
                className="input"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
              />
            </label>
            <label>
              <span className="label">Desde</span>
              <input
                type="time"
                className="input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label>
              <span className="label">Hasta</span>
              <input
                type="time"
                className="input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>
          <div>
            <span className="label">Días permitidos</span>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setDays((current) =>
                      current.includes(value)
                        ? current.filter((x) => x !== value)
                        : [...current, value],
                    )
                  }
                  className={`rounded-xl px-4 py-2 font-bold ${days.includes(value) ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 text-blue-900 p-4">
            <b>
              Finalización estimada:{" "}
              {completion
                ? new Date(`${completion}T12:00:00`).toLocaleDateString(
                    "es-CR",
                    { dateStyle: "long" },
                  )
                : "No disponible"}
            </b>
            <p className="text-sm mt-1">
              Zona horaria de Costa Rica. El proveedor puede aplicar
              restricciones adicionales.
            </p>
          </div>
        </section>
      )}
      {step === 4 && (
        <section className="card p-6">
          <StepTitle
            title="Todo listo para comenzar"
            detail="Comprueba el resumen antes de crear la cola de envíos."
          />
          <dl className="grid grid-cols-2 gap-4 responsive-grid">
            {[
              ["Campaña", name],
              ["Plantilla", chosenTemplate?.name || "—"],
              ["Destinatarios", `${eligible.length} escuelas`],
              ["Archivo adjunto", "Catálogo navideño PDF"],
              ["Límite diario", `${dailyLimit} correos`],
              [
                "Fecha de inicio",
                new Date(`${date}T12:00:00`).toLocaleDateString("es-CR", {
                  dateStyle: "long",
                }),
              ],
              ["Horario", `${startTime} a ${endTime}`],
              [
                "Finalización estimada",
                completion
                  ? new Date(`${completion}T12:00:00`).toLocaleDateString(
                      "es-CR",
                      { dateStyle: "long" },
                    )
                  : "—",
              ],
            ].map(([label, value]) => (
              <div className="rounded-xl bg-slate-50 p-4" key={label}>
                <dt className="muted text-xs font-bold uppercase">{label}</dt>
                <dd className="font-bold mt-1">{value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            disabled={busy}
            onClick={start}
            className="btn btn-primary w-full mt-6 py-4 text-base"
          >
            <Send size={19} />
            {busy ? "Preparando…" : "INICIAR CAMPAÑA"}
          </button>
        </section>
      )}
      <div className="flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStep((v) => v - 1)}
          >
            <ChevronLeft size={18} />
            Atrás
          </button>
        ) : (
          <span />
        )}
        {step < 4 && (
          <button type="button" className="btn btn-primary" onClick={next}>
            Continuar
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
function StepTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="muted text-sm mt-1">{detail}</p>
    </div>
  );
}
