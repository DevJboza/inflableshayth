"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function SettingsForm({
  initial,
}: {
  initial: Record<string, string | number>;
}) {
  const [busy, setBusy] = useState(false);
  async function save(fd: FormData) {
    setBusy(true);
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    if (response.ok) toast.success("Cambios guardados");
    else toast.error("No pudimos guardar los cambios");
    setBusy(false);
  }
  return (
    <form action={save} className="space-y-5 max-w-3xl">
      <section className="card p-6">
        <h2 className="font-extrabold text-lg">Datos del negocio</h2>
        <p className="muted text-sm mb-5">
          Información que aparece en los correos.
        </p>
        <div className="grid grid-cols-2 gap-4 responsive-grid">
          <Field
            name="business_name"
            label="Nombre del negocio"
            value={initial.business_name ?? "Inflables Shayth"}
          />
          <Field
            name="sender_email"
            label="Correo de envío"
            type="email"
            value={initial.sender_email ?? "inflablesshaythcr@gmail.com"}
          />
          <Field
            name="whatsapp"
            label="WhatsApp"
            value={initial.whatsapp ?? "+506 6404-3069"}
          />
        </div>
        <label className="block mt-4">
          <span className="label">Firma comercial</span>
          <textarea
            className="textarea"
            name="signature"
            rows={3}
            defaultValue={
              initial.signature ??
              "Equipo de Inflables Shayth\nWhatsApp: +506 6404-3069"
            }
          />
        </label>
      </section>
      <section className="card p-6">
        <h2 className="font-extrabold text-lg">Protección de envíos</h2>
        <p className="muted text-sm mb-5">
          Este límite se aplica entre todas las campañas para proteger la
          cuenta.
        </p>
        <Field
          name="daily_limit"
          label="Máximo total de correos por día"
          type="number"
          value={initial.daily_limit ?? 20}
        />
        <input type="hidden" name="timezone" value="America/Costa_Rica" />
      </section>
      <button disabled={busy} className="btn btn-primary">
        <Save size={17} />
        {busy ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
function Field({
  name,
  label,
  value,
  type = "text",
}: {
  name: string;
  label: string;
  value: string | number;
  type?: string;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input" name={name} type={type} defaultValue={value} />
    </label>
  );
}
