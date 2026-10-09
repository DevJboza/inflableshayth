"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  Inbox,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
const nav = [
  ["/dashboard", "Inicio", LayoutDashboard],
  ["/instituciones", "Escuelas", Building2],
  ["/campanas", "Campañas", Megaphone],
  ["/respuestas", "Respuestas", Inbox],
  ["/configuracion", "Configuración", Settings],
] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return (
    <>
      <aside className="desktop-sidebar fixed inset-y-0 left-0 w-64 border-r border-[#e9e4f3] bg-white/85 backdrop-blur p-4 z-40">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="size-10 rounded-xl bg-gradient-to-br from-pink-200 to-purple-300 overflow-hidden">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </div>
          <div>
            <b>Shayth Center</b>
            <div className="muted text-xs">Centro de campañas</div>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${path.startsWith(href) ? "bg-purple-100 text-purple-800" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/campanas/nueva" className="btn btn-primary w-full mb-2">
            <Plus size={17} />
            Nueva campaña
          </Link>
          <button onClick={logout} className="btn btn-secondary w-full">
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="app-main ml-64 min-h-screen p-8 max-w-[1600px]">
        {children}
      </main>
      <nav className="mobile-nav">
        {nav.slice(0, 5).map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-[10px] ${path.startsWith(href) ? "text-purple-700" : "muted"}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
