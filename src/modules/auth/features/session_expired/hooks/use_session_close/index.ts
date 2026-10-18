import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { forgetReturnPath } from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { closeExpiredSession } from "../../services";
import {
  SESSION_CLOSE_TARGETS,
  type SessionCloseOutcome,
  type SessionCloseTarget,
} from "../../types";

const DESTINATIONS: Record<SessionCloseTarget, () => string> = {
  [SESSION_CLOSE_TARGETS.login]: RouteHelpers.login,
  [SESSION_CLOSE_TARGETS.catalog]: RouteHelpers.home,
};

export interface SessionCloseState {
  close: (target: SessionCloseTarget) => void;
  pendingTarget: SessionCloseTarget | null;
  error: unknown;
}

export const useSessionClose = (): SessionCloseState => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearUser = useUserStore((state) => state.clearUser);

  const mutation = useMutation({
    mutationFn: async (
      target: SessionCloseTarget,
    ): Promise<SessionCloseOutcome> => {
      const result = await closeExpiredSession();
      return { ...result, target };
    },
    onSettled: () => {
      clearUser();
      queryClient.clear();
    },
    onSuccess: (outcome) => {
      if (outcome.target === SESSION_CLOSE_TARGETS.catalog) forgetReturnPath();
      void navigate(DESTINATIONS[outcome.target](), { replace: true });
    },
  });

  const close = (target: SessionCloseTarget): void => {
    mutation.mutate(target);
  };

  return {
    close,
    pendingTarget: mutation.isPending ? mutation.variables : null,
    error: mutation.error,
  };
};
