"use client";
import { useState } from "react";
import { toast } from "sonner";
import { PlugZap } from "lucide-react";
export function SettingsForm({
  initial,
}: {
  initial: Record<string, string | number>;
}) {
  const [busy, setBusy] = useState(false);
  async function save(fd: FormData) {
    setBusy(true);
    const r = await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd)),
    });
    if (r.ok) toast.success("Configuración guardada");
    else toast.error("No se pudo guardar");
    setBusy(false);
  }
  async function test() {
    const r = await fetch("/api/settings/test", { method: "POST" }),
      j = await r.json();
    if (r.ok) toast.success(j.message);
    else toast.error(j.error);
  }
  return (
    <form action={save} className="card p-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4 responsive-grid">
        {[
          ["business_name", "Nombre del negocio", "Inflables Shayth"],
          ["sender_email", "Correo emisor", "inflablesshaythcr@gmail.com"],
          ["whatsapp", "WhatsApp", "+506 6404-3069"],
          ["daily_limit", "Límite diario", "40"],
          ["send_interval_seconds", "Intervalo entre envíos (segundos)", "90"],
        ].map(([n, l, d]) => (
          <label key={n}>
            <span className="label">{l}</span>
            <input className="input" name={n} defaultValue={initial[n] ?? d} />
          </label>
        ))}
      </div>
      <label className="block mt-4">
        <span className="label">Firma comercial</span>
        <textarea
          className="textarea"
          name="signature"
          rows={4}
          defaultValue={
            initial.signature ??
            "Equipo de Inflables Shayth\nWhatsApp: +506 6404-3069"
          }
        />
      </label>
      <div className="flex gap-2 mt-5">
        <button disabled={busy} className="btn btn-primary">
          Guardar cambios
        </button>
        <button type="button" onClick={test} className="btn btn-secondary">
          <PlugZap size={17} />
          Probar n8n
        </button>
      </div>
    </form>
  );
}
