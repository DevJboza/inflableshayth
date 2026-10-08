"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { Plus, Upload, Download, Search, Trash2 } from "lucide-react";
type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  province: string;
  contact_name: string;
  type: string;
  status: string;
};
export function InstitutionManager() {
  const [rows, setRows] = useState<Row[]>([]),
    [open, setOpen] = useState(false),
    [q, setQ] = useState("");
  async function load() {
    const r = await fetch("/api/institutions");
    if (r.ok) setRows(await r.json());
  }
  useEffect(() => {
    fetch("/api/institutions").then(async (r) => {
      if (r.ok) setRows(await r.json());
    });
  }, []);
  async function save(fd: FormData) {
    const o = Object.fromEntries(fd);
    const r = await fetch("/api/institutions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(o),
    });
    const j = await r.json();
    if (!r.ok) {
      toast.error(j.error || "No se pudo guardar");
      return;
    }
    toast.success("Institución guardada");
    setOpen(false);
    load();
  }
  async function del(id: string) {
    if (!confirm("¿Eliminar esta institución?")) return;
    await fetch(`/api/institutions/${id}`, { method: "DELETE" });
    toast.success("Institución eliminada");
    load();
  }
  function csv(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (r) => {
        const res = await fetch("/api/institutions/import", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(r.data),
        });
        const j = await res.json();
        if (res.ok)
          toast.success(`${j.imported} importadas; ${j.skipped} omitidas`);
        else toast.error(j.error);
        load();
      },
    });
  }
  function exportCsv() {
    const blob = new Blob([Papa.unparse(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "instituciones-shayth.csv";
    a.click();
  }
  const filtered = rows.filter((r) =>
    (r.name + r.email + r.province).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-5">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Buscar institución, correo o provincia…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label className="btn btn-secondary">
          <Upload size={17} />
          Importar CSV
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => e.target.files?.[0] && csv(e.target.files[0])}
          />
        </label>
        <button className="btn btn-secondary" onClick={exportCsv}>
          <Download size={17} />
          Exportar
        </button>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus size={17} />
          Agregar
        </button>
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Institución</th>
              <th>Contacto</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.name}</b>
                  <div className="muted text-xs">{r.type}</div>
                </td>
                <td>
                  {r.email}
                  <div className="muted text-xs">{r.phone}</div>
                </td>
                <td>{r.province || "—"}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
                <td>
                  <button
                    aria-label="Eliminar"
                    onClick={() => del(r.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="p-12 text-center">
            <BuildingIcon />
            <b className="block mt-3">No hay instituciones</b>
            <p className="muted text-sm">
              Agrega una manualmente o importa un CSV.
            </p>
          </div>
        )}
      </div>
      {open && (
        <div className="fixed inset-0 bg-slate-950/35 z-50 grid place-items-center p-4">
          <form
            action={save}
            className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <h2 className="text-xl font-bold mb-5">Nueva institución</h2>
            <div className="grid grid-cols-2 gap-4 responsive-grid">
              {[
                ["name", "Nombre *"],
                ["email", "Correo *"],
                ["phone", "Teléfono"],
                ["province", "Provincia"],
                ["canton", "Cantón"],
                ["contactName", "Persona de contacto"],
              ].map(([n, l]) => (
                <label key={n}>
                  <span className="label">{l}</span>
                  <input
                    name={n}
                    className="input"
                    required={n === "name" || n === "email"}
                  />
                </label>
              ))}
              <label>
                <span className="label">Tipo</span>
                <select name="type" className="select">
                  {["Escuela", "Colegio", "Jardín infantil", "Otra"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                <span className="label">Estado</span>
                <select name="status" className="select">
                  {[
                    "Sin contactar",
                    "Contactado",
                    "Respondió",
                    "Interesado",
                    "Cotización solicitada",
                    "Cliente",
                    "No interesado",
                    "No contactar",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block mt-4">
              <span className="label">Notas internas</span>
              <textarea name="notes" className="textarea" rows={3} />
            </label>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">Guardar institución</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function BuildingIcon() {
  return (
    <div className="mx-auto size-12 rounded-xl bg-purple-100 grid place-items-center text-purple-500">
      <Plus />
    </div>
  );
}
