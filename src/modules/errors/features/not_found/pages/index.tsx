import { PageShell } from "@/components/layout/page_shell";
import { NotFoundContent } from "@/components/shared/error_screen/components/not_found_content";

const NotFoundPage = () => (
  <PageShell className="flex items-center justify-center px-5 py-16 sm:py-20">
    <NotFoundContent />
  </PageShell>
);

export default NotFoundPage;
