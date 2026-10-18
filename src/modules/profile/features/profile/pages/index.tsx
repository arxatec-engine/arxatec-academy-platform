import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/layout/page_shell";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { PROFILE_TEXT } from "@/modules/profile/i18n";
import { ProfileContent } from "../components/profile_content";

const ProfilePage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(PROFILE_TEXT.title));
  return (
    <PageShell>

      <ProfileContent />
    </PageShell>
  );
};

export default ProfilePage;
