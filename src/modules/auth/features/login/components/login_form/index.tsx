import { Button, Input } from "arxatec-ui";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthField } from "@/modules/auth/components/auth_field";
import { GoogleButton } from "@/modules/auth/components/google_button";
import { PasswordField } from "@/modules/auth/components/password_field";
import { login } from "@/modules/auth/features/login/i18n";
import { useLoginForm } from "@/modules/auth/features/login/hooks/use_login_form";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { shared } from "@/modules/auth/i18n";
import { RouteHelpers } from "@/routes/routes";

const EMAIL_FIELD_ID = "login-email";
const PASSWORD_FIELD_ID = "login-password";

export interface LoginFormProps {
  onGoogleLogin: () => void;
}

export const LoginForm = ({ onGoogleLogin }: LoginFormProps) => {
  const { t } = useTranslation(NS.auth);
  const readMessage = useAuthMessage();
  const { errors, register, submit, isPending, showGoogleLogin } = useLoginForm();

  const emailRegistration = register("email");
  const passwordRegistration = register("password");

  return (
    <form noValidate onSubmit={submit}>
      <div className="flex flex-col gap-4">
        <AuthField
          id={EMAIL_FIELD_ID}
          label={t(shared.fields.email.label)}
          error={readMessage(errors.email?.message)}
        >
          {(field) => (
            <Input
              {...field}
              {...emailRegistration}
              size="sm"
              type="email"
              autoComplete="email"
              placeholder={t(shared.fields.email.placeholder)}
            />
          )}
        </AuthField>

        <div className="grid gap-2">
          <PasswordField
            id={PASSWORD_FIELD_ID}
            label={t(shared.fields.password.label)}
            placeholder={t(shared.fields.password.placeholder)}
            autoComplete="current-password"
            registration={passwordRegistration}
            error={readMessage(errors.password?.message)}
          />
          <Link
            to={RouteHelpers.forgotPassword()}
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-secondary-foreground"
          >
            {t(login.forgotLink)}
          </Link>
        </div>

        {showGoogleLogin ? (
          <GoogleButton
            label={t(login.googleAccount.action)}
            onClick={onGoogleLogin}
          />
        ) : null}

        <Button
          type="submit"
          className="w-full"
          size="sm"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          )}
          {isPending ? t(login.submitting) : t(login.submit)}
        </Button>
      </div>
      <div className="mt-4 text-center text-sm text-secondary-foreground">
        {t(login.footer.question)}{" "}
        <Link
          to={RouteHelpers.register()}
          className="underline underline-offset-4 text-foreground"
        >
          {t(login.footer.link)}
        </Link>
      </div>
    </form>
  );
};
