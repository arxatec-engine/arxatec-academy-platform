import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthSubmitButton } from "@/modules/auth/components/auth_submit_button";
import { PasswordField } from "@/modules/auth/components/password_field";
import { resetPassword } from "@/modules/auth/features/reset_password/i18n";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { shared } from "@/modules/auth/i18n";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../../schemas";

export interface ResetPasswordFormProps {
  isPending: boolean;
  onSubmit: (values: ResetPasswordFormValues) => void;
}

export const ResetPasswordForm = ({
  isPending,
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
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <PasswordField
        id="reset-password-new"
        label={t(shared.fields.newPassword.label)}
        hint={t(shared.fields.newPassword.hint)}
        autoComplete="new-password"
        autoFocus
        registration={register("password")}
        error={readMessage(errors.password?.message)}
      />
      <PasswordField
        id="reset-password-confirm"
        label={t(shared.fields.confirmPassword.label)}
        autoComplete="new-password"
        registration={register("confirmPassword")}
        error={readMessage(errors.confirmPassword?.message)}
      />
      <AuthSubmitButton
        label={t(resetPassword.submit)}
        loadingLabel={t(resetPassword.submitting)}
        loading={isPending}
      />
    </form>
  );
};
