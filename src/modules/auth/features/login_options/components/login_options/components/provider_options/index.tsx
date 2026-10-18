import { AppleIsotype, Button, MicrosoftIsotype } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { GoogleButton } from "@/modules/auth/components/google_button";
import { startGoogleAuthorize } from "@/modules/auth/utils/google_authorize";
import { LOGIN_OPTIONS_TEXT } from "../../../../i18n";

interface Props {
  disabled: boolean;
}

export const ProviderOptions = ({ disabled }: Props) => {
  const { t } = useTranslation(NS.auth);

  return (
    <div className="flex w-full flex-col gap-2">
      <GoogleButton
        label={t(LOGIN_OPTIONS_TEXT.google)}
        disabled={disabled}
        onClick={startGoogleAuthorize}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={disabled}
        onClick={() => toast.info(t(LOGIN_OPTIONS_TEXT.comingSoon))}
      >
        <MicrosoftIsotype className="size-4" />
        {t(LOGIN_OPTIONS_TEXT.microsoft)}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={disabled}
        onClick={() => toast.info(t(LOGIN_OPTIONS_TEXT.comingSoon))}
      >
        <AppleIsotype className="size-4" />
        {t(LOGIN_OPTIONS_TEXT.apple)}
      </Button>
    </div>
  );
};
