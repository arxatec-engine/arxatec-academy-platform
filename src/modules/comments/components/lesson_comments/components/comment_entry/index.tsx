import { Avatar, AvatarFallback, AvatarImage, Badge, cn } from "arxatec-ui";
import { UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { COMMENTS_TEXT } from "@/modules/comments/i18n";
import type { Comment } from "@/modules/comments/types";

interface Props {
  comment: Comment;
  compact?: boolean;
  children?: ReactNode;
}

export const CommentEntry = ({ comment, compact = false, children }: Props) => {
  const { t, i18n } = useTranslation(NS.common);
  const authorName = comment.author?.fullName ?? t(COMMENTS_TEXT.deletedAuthor);
  const initials = comment.author?.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase(i18n.resolvedLanguage);

  return (
    <div className={cn("flex min-w-0 items-start", compact ? "gap-2" : "gap-3")}>
      <Avatar
        aria-hidden="true"
        className={cn("shrink-0 border border-border", compact ? "size-8" : "size-10")}
      >
        <AvatarImage src={comment.author?.avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-sm font-medium text-muted-foreground">
          {initials || <UserRound className="size-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium [overflow-wrap:anywhere]">{authorName}</span>
          {comment.author?.isTeam && (
            <Badge variant="secondary" className="text-sm font-normal">
              {t(COMMENTS_TEXT.team)}
            </Badge>
          )}
          {!compact && comment.author?.affiliation && (
            <span className="text-muted-foreground [overflow-wrap:anywhere]">
              {comment.author.affiliation}
            </span>
          )}
          <time
            dateTime={comment.createdAt}
            className="text-muted-foreground whitespace-nowrap"
          >
            {new Date(comment.createdAt).toLocaleDateString(i18n.resolvedLanguage)}
          </time>
        </div>
        <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
          {comment.body}
        </p>
        {children}
      </div>
    </div>
  );
};
