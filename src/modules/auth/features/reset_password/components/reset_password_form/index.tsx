import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { AuthSubmitButton } from "@/modules/auth/components/auth_submit_button";
import { PasswordField } from "@/modules/auth/components/password_field";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";

import { resetPasswordSchema, type ResetPasswordFormValues } from "../../schemas";

export interface ResetPasswordFormProps {
  isPending: boolean;
  errorMessage: string | null;
  onSubmit: (values: ResetPasswordFormValues) => void;
}

export const ResetPasswordForm = ({
  isPending,
  errorMessage,
  onSubmit,
}: ResetPasswordFormProps) => {
  const { t } = useTranslation(NS.auth);
  const readMessage = useAuthMessage();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <PasswordField
        id="reset-password-new"
        label={t("shared.fields.new_password.label")}
        hint={t("shared.fields.new_password.hint")}
        autoComplete="new-password"
        autoFocus
        registration={register("password")}
        error={readMessage(errors.password?.message)}
      />
      <PasswordField
        id="reset-password-confirm"
        label={t("shared.fields.confirm_password.label")}
        autoComplete="new-password"
        registration={register("confirmPassword")}
        error={readMessage(errors.confirmPassword?.message)}
      />
      {errorMessage === null ? null : <AuthFormError message={errorMessage} />}
      <AuthSubmitButton
        label={t("reset_password.submit")}
        loadingLabel={t("reset_password.submitting")}
        loading={isPending}
      />
    </form>
  );
};
