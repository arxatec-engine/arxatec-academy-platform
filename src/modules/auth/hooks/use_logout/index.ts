import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

import { logout } from "../../services/logout";
import { forgetReturnPath } from "../../utils/redirect_to";

export interface LogoutState {
  logout: () => void;
  isPending: boolean;
  error: unknown;
}

export const useLogout = (): LogoutState => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearUser = useUserStore((state) => state.clearUser);

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearUser();
      forgetReturnPath();
      queryClient.clear();
      void navigate(RouteHelpers.login(), { replace: true });
    },
  });

  return {
    logout: () => {
      mutation.mutate();
    },
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
