import { PageHeader } from "@/components/page-header";
import { InstitutionManager } from "@/components/institution-manager";
export default function Page() {
  return (
    <>
      <PageHeader
        title="Escuelas"
        subtitle="Administra las escuelas y su autorización para recibir campañas."
      />
      <InstitutionManager />
    </>
  );
}
