import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { NS } from "@/locales/namespaces";
import { CHECK_EMAIL_STATE_KEY } from "@/modules/auth/constants";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { RouteHelpers } from "@/routes/routes";

import { useRegister } from "../use_register";
import {
  REGISTER_FORM_DEFAULTS,
  registerSchema,
  toRegisterRequest,
  type RegisterFormInput,
  type RegisterFormValues,
} from "../../schemas";
import type { RegisterRequest } from "../../types";
import { REGISTER_EMAIL_TAKEN_KEY, resolveRegisterError } from "../../utils";

export const useRegisterForm = () => {
  const { t } = useTranslation(NS.auth);
  const navigate = useNavigate();
  const mutation = useRegister();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: REGISTER_FORM_DEFAULTS,
  });

  const submitRequest = (request: RegisterRequest): void => {
    mutation.mutate(request, {
      onSuccess: (result) => {
        void navigate(RouteHelpers.checkEmail(), {
          replace: true,
          state: { [CHECK_EMAIL_STATE_KEY]: result.verification_email_sent },
        });
      },
      onError: (error) => {
        const result = resolveRegisterError(error);

        result.fieldErrors.forEach((fieldError, index) => {
          setError(
            fieldError.field,
            { message: fieldError.key },
            { shouldFocus: index === 0 },
          );
        });

        if (!result.notify) return;

        toast.error(authErrorMessage(error, t));
      },
    });
  };

  return {
    errors,
    register,
    emailTaken: errors.email?.message === REGISTER_EMAIL_TAKEN_KEY,
    isPending: mutation.isPending,
    submit: handleSubmit((values) => submitRequest(toRegisterRequest(values))),
  };
};
