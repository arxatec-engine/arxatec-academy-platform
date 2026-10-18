import { PageShell } from "@/components/layout/page_shell";
import { LegalDocument } from "@/modules/legal/components/legal_document";

const TermsPage = () => (
  <PageShell>
    <LegalDocument kind="terms" />
  </PageShell>
);

export default TermsPage;
