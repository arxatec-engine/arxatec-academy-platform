import { PageShell } from "@/components/layout/page_shell";
import { LegalDocument } from "@/modules/legal/components/legal_document";

const PrivacyPage = () => (
  <PageShell>
    <LegalDocument kind="privacy" />
  </PageShell>
);

export default PrivacyPage;
