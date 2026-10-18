import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "arxatec-ui";
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { useLogout } from "@/modules/auth/hooks/use_logout";
import { PROFILE_TEXT } from "@/modules/profile/i18n";
import { PROGRESS_TEXT } from "@/modules/progress/i18n";
import { RouteHelpers } from "@/routes/routes";
import type { ApiUser } from "@/types/auth";

interface Props {
  user: ApiUser;
  adminMode?: boolean;
}

export const AccountMenu = ({ user, adminMode = false }: Props) => {
  const { t } = useTranslation(NS.common);
  const { logout, isPending } = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          className="gap-2 px-2"
          aria-label={t(UI_TEXT.account)}
        >
          <Avatar className="size-7 border-border border">
            <AvatarImage src={user.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-sm font-medium">
              {user.full_name.trim().slice(0, 1).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate sm:block">
            {user.full_name}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-md p-2">
        <div>
          <p className="truncate leading-4">{user.full_name}</p>
          <p className="mt-1 truncate text-sm font-normal text-muted-foreground">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        {!adminMode && (
          <DropdownMenuItem asChild>
            <Link to={RouteHelpers.myCourses()}>
              <GraduationCap />
              {t(PROGRESS_TEXT.myCourses)}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to={RouteHelpers.profile()}>
            <UserRound />
            {t(PROFILE_TEXT.title)}
          </Link>
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link
              to={adminMode ? RouteHelpers.home() : RouteHelpers.adminCourses()}
            >
              {adminMode ? <GraduationCap /> : <ShieldCheck />}
              {t(adminMode ? UI_TEXT.userMode : UI_TEXT.adminMode)}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-sm"
          disabled={isPending}
          onSelect={logout}
        >
          <LogOut aria-hidden="true" />
          {t(UI_TEXT.signOut)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
