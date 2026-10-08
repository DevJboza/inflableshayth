import { PageHeader } from "@/components/page-header";
import { CampaignEditor } from "@/components/campaign-editor";
export default function Page() {
  return (
    <>
      <PageHeader
        title="Nueva campaña"
        subtitle="Redacta, previsualiza y confirma antes de crear la cola."
      />
      <CampaignEditor />
    </>
  );
}
