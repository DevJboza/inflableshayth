import { PageHeader } from "@/components/page-header";
import { CampaignEditor } from "@/components/campaign-editor";
export default function Page() {
  return (
    <>
      <PageHeader
        title="Nueva campaña"
        subtitle="Cuatro pasos sencillos para preparar y programar tus correos."
      />
      <CampaignEditor />
    </>
  );
}
