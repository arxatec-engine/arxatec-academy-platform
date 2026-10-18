import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";

import { resendVerificationEmail } from "../../services";
import { useCountdown } from "../use_countdown";

export interface ResendVerificationEmailOptions {
  onSent?: () => void;
  onFailed?: (error: unknown) => void;
  initialCooldownSeconds?: number;
}

export interface ResendVerificationEmail {
  resend: () => void;
  isPending: boolean;
  isBlocked: boolean;
  seconds: number;
}

const cooldownSeconds = (error: unknown): number | null => {
  if (!isApiError(error)) return null;
  if (error.code !== API_ERROR_CODES.RESEND_COOLDOWN) return null;
  return error.retryAfterSeconds;
};

export const useResendVerificationEmail = ({
  onSent,
  onFailed,
  initialCooldownSeconds,
}: ResendVerificationEmailOptions = {}): ResendVerificationEmail => {
  const { seconds, isRunning, start } = useCountdown();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    if (initialCooldownSeconds === undefined || initialCooldownSeconds <= 0)
      return;
    hasStarted.current = true;
    start(initialCooldownSeconds);
  }, [initialCooldownSeconds, start]);

  const mutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (result) => {
      if (result.retryAfterSeconds !== null) start(result.retryAfterSeconds);
      onSent?.();
    },
    onError: (error: unknown) => {
      const pending = cooldownSeconds(error);
      if (pending !== null) start(pending);
      onFailed?.(error);
    },
  });

  const { isPending, mutate } = mutation;
  const isBlocked = isPending || isRunning;

  const resend = useCallback(() => {
    if (isBlocked) return;
    mutate();
  }, [isBlocked, mutate]);

  return { resend, isPending, isBlocked, seconds };
};
