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
        subtitle="Datos del negocio y límites generales de envío."
      />
      <SettingsForm
        initial={Object.fromEntries(rows.map((r) => [r.key, r.value]))}
      />
    </>
  );
}
