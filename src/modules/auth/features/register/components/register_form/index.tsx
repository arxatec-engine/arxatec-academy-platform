import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "arxatec-ui";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { NS } from "@/locales/namespaces";
import { CHECK_EMAIL_STATE_KEY } from "@/modules/auth/constants";
import { AuthDivider } from "@/modules/auth/components/auth_divider";
import { AuthField } from "@/modules/auth/components/auth_field";
import { AuthNote } from "@/modules/auth/components/auth_note";
import { AuthSubmitButton } from "@/modules/auth/components/auth_submit_button";
import { GoogleButton } from "@/modules/auth/components/google_button";
import { PasswordField } from "@/modules/auth/components/password_field";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { startGoogleAuthorize } from "@/modules/auth/utils/google_authorize";
import { RouteHelpers } from "@/routes/routes";

import { useRegister } from "../../hooks/use_register";
import {
  REGISTER_FORM_DEFAULTS,
  registerSchema,
  toRegisterRequest,
  type RegisterFormInput,
  type RegisterFormValues,
} from "../../schemas";
import type { RegisterRequest } from "../../types";
import { REGISTER_EMAIL_TAKEN_KEY, REGISTER_FIELD_IDS, resolveRegisterError } from "../../utils";
import { CityField } from "../city_field";
import { OrganizationField } from "../organization_field";

export const RegisterForm = () => {
  const { t } = useTranslation(NS.auth);
  const { t: tCommon } = useTranslation(NS.common);
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const readMessage = useAuthMessage();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
    clearErrors,
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: REGISTER_FORM_DEFAULTS,
  });

  const fullNameRegistration = register("fullName");
  const emailRegistration = register("email");
  const passwordRegistration = register("password");
  const organizationRegistration = register("organization");
  const cityOtherRegistration = register("cityOther");

  const isIndependent = useWatch({ control, name: "isIndependent" });
  const city = useWatch({ control, name: "city" });
  const isPending = registerMutation.isPending;
  const emailTaken = errors.email?.message === REGISTER_EMAIL_TAKEN_KEY;

  const submit = (request: RegisterRequest): void => {
    registerMutation.mutate(request, {
      onSuccess: () => {
        void navigate(RouteHelpers.checkEmail(), {
          replace: true,
          state: { [CHECK_EMAIL_STATE_KEY]: true },
        });
      },
      onError: (error) => {
        const result = resolveRegisterError(error);

        result.fieldErrors.forEach((fieldError, index) => {
          setError(fieldError.field, { message: fieldError.key }, { shouldFocus: index === 0 });
        });

        if (!result.notify) return;

        toast.error(authErrorMessage(error, t), {
          action: {
            label: tCommon("actions.retry"),
            onClick: () => {
              submit(request);
            },
          },
        });
      },
    });
  };

  const handleIndependentChange = (checked: boolean): void => {
    if (!checked) return;
    setValue("organization", "");
    clearErrors("organization");
  };

  const handleCityChange = (value: string): void => {
    if (value === "OTHER") return;
    setValue("cityOther", "");
    clearErrors("cityOther");
  };

  return (
    <>
      <GoogleButton
        label={t("shared.google_button")}
        onClick={startGoogleAuthorize}
        disabled={isPending}
      />
      <AuthDivider label={t("shared.divider")} />
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => {
          submit(toRegisterRequest(values));
        })}
      >
        <AuthField
          id={REGISTER_FIELD_IDS.fullName}
          label={t("shared.fields.full_name.label")}
          error={readMessage(errors.fullName?.message)}
        >
          {(field) => (
            <Input
              {...field}
              {...fullNameRegistration}
              size="sm"
              type="text"
              autoComplete="name"
              placeholder={t("shared.fields.full_name.placeholder")}
              disabled={isPending}
            />
          )}
        </AuthField>
        <AuthField
          id={REGISTER_FIELD_IDS.email}
          label={t("shared.fields.email.label")}
          error={readMessage(errors.email?.message)}
          action={
            emailTaken ? (
              <Link
                to={RouteHelpers.login()}
                className="text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {t("register.email_taken.action")}
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
              placeholder={t("shared.fields.email.placeholder")}
              disabled={isPending}
            />
          )}
        </AuthField>
        <PasswordField
          id={REGISTER_FIELD_IDS.password}
          label={t("shared.fields.password.label")}
          hint={t("shared.fields.password.hint")}
          autoComplete="new-password"
          registration={passwordRegistration}
          error={readMessage(errors.password?.message)}
          disabled={isPending}
        />
        <OrganizationField
          id={REGISTER_FIELD_IDS.organization}
          checkboxId={REGISTER_FIELD_IDS.isIndependent}
          control={control}
          registration={organizationRegistration}
          error={readMessage(errors.organization?.message)}
          disabled={isPending}
          isIndependent={isIndependent}
          onIndependentChange={handleIndependentChange}
        />
        <CityField
          id={REGISTER_FIELD_IDS.city}
          otherId={REGISTER_FIELD_IDS.cityOther}
          control={control}
          otherRegistration={cityOtherRegistration}
          error={readMessage(errors.city?.message)}
          otherError={readMessage(errors.cityOther?.message)}
          disabled={isPending}
          showOther={city === "OTHER"}
          onCityChange={handleCityChange}
        />
        <AuthSubmitButton
          label={t("register.submit")}
          loadingLabel={t("register.submitting")}
          loading={isPending}
        />
      </form>
      <AuthNote text={t("register.note")} />
    </>
  );
};
