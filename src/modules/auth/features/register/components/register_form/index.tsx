import { Button, Input } from "arxatec-ui";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthField } from "@/modules/auth/components/auth_field";
import { PasswordField } from "@/modules/auth/components/password_field";
import { register as registerKeys } from "@/modules/auth/features/register/i18n";
import { useRegisterForm } from "@/modules/auth/features/register/hooks/use_register_form";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { shared } from "@/modules/auth/i18n";
import { RouteHelpers } from "@/routes/routes";

import { REGISTER_FIELD_IDS } from "../../utils";

export const RegisterForm = () => {
  const { t } = useTranslation(NS.auth);
  const readMessage = useAuthMessage();
  const { errors, register, submit, isPending, emailTaken } = useRegisterForm();

  const fullNameRegistration = register("fullName");
  const emailRegistration = register("email");
  const passwordRegistration = register("password");

  return (
    <form noValidate onSubmit={submit}>
      <div>
        <div className="flex flex-col gap-4">
          <AuthField
            id={REGISTER_FIELD_IDS.fullName}
            label={t(shared.fields.fullName.label)}
            error={readMessage(errors.fullName?.message)}
          >
            {(field) => (
              <Input
                {...field}
                {...fullNameRegistration}
                size="sm"
                type="text"
                autoComplete="name"
                placeholder={t(shared.fields.fullName.placeholder)}
                disabled={isPending}
              />
            )}
          </AuthField>
          <AuthField
            id={REGISTER_FIELD_IDS.email}
            label={t(shared.fields.email.label)}
            error={readMessage(errors.email?.message)}
            action={
              emailTaken ? (
                <Link
                  to={RouteHelpers.loginEmail()}
                  className="text-sm font-normal text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {t(registerKeys.emailTaken.action)}
                </Link>
              ) : undefined
            }
          >
            {(field) => (
              <Input
                {...field}
                {...emailRegistration}
                size="sm"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t(shared.fields.email.placeholder)}
                disabled={isPending}
              />
            )}
          </AuthField>
          <PasswordField
            id={REGISTER_FIELD_IDS.password}
            label={t(shared.fields.password.label)}
            placeholder={t(shared.fields.password.placeholder)}
            autoComplete="new-password"
            registration={passwordRegistration}
            error={readMessage(errors.password?.message)}
            disabled={isPending}
          />
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
            {isPending ? t(registerKeys.submitting) : t(registerKeys.submit)}
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-secondary-foreground">
        {t(registerKeys.footer.question)}{" "}
        <Link
          to={RouteHelpers.loginEmail()}
          className="underline underline-offset-4 text-foreground"
        >
          {t(registerKeys.footer.link)}
        </Link>
      </div>
    </form>
  );
};
