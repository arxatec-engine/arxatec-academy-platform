import { Checkbox, Label } from "arxatec-ui";
import { useId } from "react";
import { Trans, useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { LEGAL_URLS } from "../../../../constants";
import { LOGIN_OPTIONS_TEXT } from "../../../../i18n";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const PolicyConsent = ({ checked, onCheckedChange }: Props) => {
  const { t } = useTranslation(NS.auth);
  const consentId = useId();

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={consentId}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5 shrink-0 rounded-md"
      />
      <Label
        htmlFor={consentId}
        className="block cursor-pointer text-sm font-normal normal-case leading-5 text-muted-foreground"
      >
        <Trans
          t={t}
          i18nKey={LOGIN_OPTIONS_TEXT.consent}
          components={{
            privacy: (
              <a
                href={LEGAL_URLS.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
                className="normal-case text-foreground underline-offset-4 hover:underline"
              />
            ),
            terms: (
              <a
                href={LEGAL_URLS.termsAndConditions}
                target="_blank"
                rel="noopener noreferrer"
                className="normal-case text-foreground underline-offset-4 hover:underline"
              />
            ),
          }}
        />
      </Label>
    </div>
  );
};
