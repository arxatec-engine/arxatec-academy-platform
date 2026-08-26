import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "arxatec-ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthField } from "@/modules/auth/components/auth_field";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { AuthSubmitButton } from "@/modules/auth/components/auth_submit_button";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { toAuthMessageKey } from "@/modules/auth/utils/messages";
import { RouteHelpers } from "@/routes/routes";

import { useForgotPassword } from "../../hooks/use_forgot_password";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../../schemas";

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
  const mutation = useForgotPassword();
  const [hasGlobalError, setHasGlobalError] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

  const reportFailure = (error: Error): void => {
    if (isApiError(error) && error.code === API_ERROR_CODES.VALIDATION_ERROR) {
      const serverKey = error.fields?.email;
      if (serverKey === undefined) setHasGlobalError(true);
      else setError("email", { message: toAuthMessageKey(serverKey) }, { shouldFocus: true });
      return;
    }

    toast.error(authErrorMessage(error, t));
  };

  const submit = handleSubmit(({ email }) => {
    setHasGlobalError(false);
    mutation.mutate(email, {
      onSuccess: () => {
        onSent(email);
      },
      onError: reportFailure,
    });
  });

  return (
    <AuthCard
      title={t("forgot_password.title")}
      subtitle={t("forgot_password.subtitle")}
      footer={<AuthFooterLink label={t("forgot_password.footer.link")} to={RouteHelpers.login()} />}
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <AuthField
          id={EMAIL_FIELD_ID}
          label={t("shared.fields.email.label")}
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
              placeholder={t("shared.fields.email.placeholder")}
            />
          )}
        </AuthField>
        {hasGlobalError ? <AuthFormError message={t("errors.validation_error")} /> : null}
        <AuthSubmitButton
          label={t("forgot_password.submit")}
          loadingLabel={t("forgot_password.submitting")}
          loading={mutation.isPending}
        />
      </form>
    </AuthCard>
  );
};
