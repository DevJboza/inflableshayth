"use client";
import { useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [p, setP] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: p }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error);
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }
  return (
    <main className="min-h-screen grid place-items-center p-5">
      <form onSubmit={submit} className="card w-full max-w-[420px] p-8">
        <div className="relative mx-auto mb-5 size-20 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 grid place-items-center overflow-hidden">
          <img
            src="/logo.png"
            alt="Inflables Shayth"
            className="size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <LockKeyhole className="absolute text-purple-700" />
        </div>
        <h1 className="text-center text-2xl font-extrabold">
          Bienvenido a Shayth
        </h1>
        <p className="muted text-center mt-2 mb-7">
          Centro de campañas y gestión comercial
        </p>
        <label className="label">Contraseña</label>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          value={p}
          onChange={(e) => setP(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="btn btn-primary w-full mt-5">
          {busy ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <LockKeyhole size={18} />
          )}
          Entrar al panel
        </button>
        <p className="muted text-xs text-center mt-5">
          Sesión privada · Expira en 12 horas
        </p>
      </form>
    </main>
  );
}
