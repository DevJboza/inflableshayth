import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";
import { hasDatabase, query } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page() {
  const rows = hasDatabase()
    ? await query<{
        key: string;
        value: string;
      }>`select key,value from app_settings`
    : [];
  return (
    <>
      <PageHeader
        title="Configuración"
        subtitle="Preferencias comerciales; los secretos permanecen en el servidor."
      />
      <SettingsForm
        initial={Object.fromEntries(rows.map((r) => [r.key, r.value]))}
      />
    </>
  );
}
