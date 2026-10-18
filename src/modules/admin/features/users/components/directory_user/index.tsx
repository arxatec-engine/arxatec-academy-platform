import { Avatar, AvatarFallback, Badge } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { DIRECTORY_TEXT } from "@/modules/admin/i18n";
import type { DirectoryUser as User } from "@/modules/admin/types/users";

interface Props {
  user: User;
}

export const DirectoryUser = ({ user }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <li className="min-w-0 rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 shrink-0 border border-border">
          <AvatarFallback>
            {user.full_name.trim().slice(0, 1).toLocaleUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="text-base font-normal [overflow-wrap:anywhere]">
            {user.full_name}
          </h2>
          <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {user.email}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary" className="font-normal">
          {t(DIRECTORY_TEXT.completed, { count: user.completed_courses })}
        </Badge>
        {user.email_verified_at && (
          <Badge variant="outline" className="font-normal">
            {t(DIRECTORY_TEXT.verified)}
          </Badge>
        )}
      </div>
    </li>
  );
};
