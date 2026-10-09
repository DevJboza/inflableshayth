"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pause, Play, XCircle } from "lucide-react";

export function CampaignControls({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act(action: "pause" | "resume" | "cancel") {
    const labels = { pause: "pausar", resume: "reanudar", cancel: "cancelar" };
    if (!confirm(`¿Deseas ${labels[action]} esta campaña?`)) return;
    setBusy(true);
    const response = await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = await response.json();
    if (response.ok) {
      toast.success("Campaña actualizada");
      router.refresh();
    } else toast.error(result.error || "No pudimos actualizar la campaña");
    setBusy(false);
  }
  if (["Completada", "Cancelada"].includes(status)) return null;
  return (
    <div className="flex gap-2 flex-wrap">
      {status === "Pausada" || status === "Con errores" ? (
        <button
          disabled={busy}
          onClick={() => act("resume")}
          className="btn btn-primary"
        >
          <Play size={17} />
          Reanudar
        </button>
      ) : (
        <button
          disabled={busy}
          onClick={() => act("pause")}
          className="btn btn-secondary"
        >
          <Pause size={17} />
          Pausar
        </button>
      )}
      <button
        disabled={busy}
        onClick={() => act("cancel")}
        className="btn btn-secondary text-red-600"
      >
        <XCircle size={17} />
        Cancelar
      </button>
    </div>
  );
}
