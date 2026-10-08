import { PageHeader } from "@/components/page-header";
import { InstitutionManager } from "@/components/institution-manager";
export default function Page() {
  return (
    <>
      <PageHeader
        title="Instituciones"
        subtitle="CRM de escuelas, colegios y organizaciones."
      />
      <InstitutionManager />
    </>
  );
}
