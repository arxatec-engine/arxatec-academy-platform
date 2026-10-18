import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import {
  forgetReturnPath,
  readReturnPath,
} from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";
import { selectUser, useUserStore } from "@/store/user";

export const Guest = () => {
  const user = useUserStore(selectUser);
  const [hadSessionOnMount] = useState(() => user !== null);
  const target = hadSessionOnMount
    ? (readReturnPath() ?? RouteHelpers.home())
    : null;

  useEffect(() => {
    if (target === null) return;
    forgetReturnPath();
  }, [target]);

  if (target === null) return <Outlet />;

  return <Navigate to={target} replace />;
};
