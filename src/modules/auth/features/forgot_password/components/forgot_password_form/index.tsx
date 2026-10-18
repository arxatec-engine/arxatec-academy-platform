import { Input } from "arxatec-ui";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthBackButton } from "@/modules/auth/components/auth_back_button";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthField } from "@/modules/auth/components/auth_field";
import { AuthSubmitButton } from "@/modules/auth/components/auth_submit_button";
import { useForgotPasswordForm } from "@/modules/auth/features/forgot_password/hooks/use_forgot_password_form";
import { forgotPassword } from "@/modules/auth/features/forgot_password/i18n";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { shared } from "@/modules/auth/i18n";

const EMAIL_FIELD_ID = "forgot-password-email";

export interface ForgotPasswordFormProps {
  defaultEmail: string;
  autoFocus: boolean;
  onSent: (email: string) => void;
}

export const ForgotPasswordForm = ({
  defaultEmail,
  autoFocus,
  onSent,
}: ForgotPasswordFormProps) => {
  const { t } = useTranslation(NS.auth);
  const readMessage = useAuthMessage();
  const { register, errors, submit, isPending } =
    useForgotPasswordForm({ defaultEmail, onSent });

  return (
    <>
      <AuthBackButton />
      <AuthCard
        title={t(forgotPassword.title)}
        subtitle={t(forgotPassword.subtitle)}
      >
        <form noValidate onSubmit={submit} className="flex flex-col gap-2">
          <AuthField
            id={EMAIL_FIELD_ID}
            label={t(shared.fields.email.label)}
            error={readMessage(errors.email?.message)}
          >
            {(control) => (
              <Input
                {...register("email")}
                {...control}
                size="sm"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus={autoFocus}
                placeholder={t(shared.fields.email.placeholder)}
              />
            )}
          </AuthField>
          <AuthSubmitButton
            label={t(forgotPassword.submit)}
            loadingLabel={t(forgotPassword.submitting)}
            loading={isPending}
          />
        </form>
      </AuthCard>
    </>
  );
};
