import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label,
  Textarea,
} from "arxatec-ui";
import { Ellipsis, Eye, EyeOff, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useModerationAction } from "@/modules/admin/hooks/moderation";
import { ADMIN_TEXT, MODERATION_TEXT } from "@/modules/admin/i18n";
import type { ModerationComment } from "@/modules/admin/types/moderation";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  comment: ModerationComment;
}

export const ModerationRow = ({ comment }: Props) => {
  const { t } = useTranslation(NS.common);
  const [body, setBody] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const actionsTriggerRef = useRef<HTMLButtonElement>(null);
  const action = useModerationAction();
  const isHidden = comment.status === "HIDDEN";
  const run = (command: "reply" | "hide" | "show" | "delete") => {
    void toast.promise(
      action
        .mutateAsync({ id: comment.id, action: command, body: body.trim() })
        .then(() => {
          if (command === "reply") setBody("");
          if (command === "delete") setDeleteOpen(false);
        }),
      {
        loading: t(ADMIN_TEXT.save),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <li className="min-w-0 rounded-md border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {comment.author?.full_name ?? t(MODERATION_TEXT.deletedAuthor)} ·{" "}
            {comment.course.title}
          </span>
          <Badge variant="secondary" className="shrink-0 font-normal">
            {t(MODERATION_TEXT.reports, { count: comment.report_count })}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={actionsTriggerRef}
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              aria-label={t(MODERATION_TEXT.actions)}
              disabled={action.isPending}
            >
              <Ellipsis aria-hidden="true" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(event) => {
              if (deleteOpen) event.preventDefault();
            }}
          >
            <DropdownMenuItem
              disabled={action.isPending}
              onSelect={() => run(isHidden ? "show" : "hide")}
            >
              {isHidden ? (
                <Eye aria-hidden="true" className="size-4" />
              ) : (
                <EyeOff aria-hidden="true" className="size-4" />
              )}
              {t(isHidden ? MODERATION_TEXT.show : MODERATION_TEXT.hide)}
            </DropdownMenuItem>
            {comment.status !== "DELETED" && (
              <DropdownMenuItem
                variant="destructive"
                disabled={action.isPending}
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                {t(MODERATION_TEXT.delete)}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
        {comment.body}
      </p>
      <Button
        asChild
        variant="link"
        size="sm"
        className="mt-2 h-auto max-w-full justify-start px-0 text-sm font-normal whitespace-normal [overflow-wrap:anywhere]"
      >
        <Link
          to={RouteHelpers.lesson(comment.course.slug, comment.lesson.slug)}
        >
          {comment.lesson.title}
        </Link>
      </Button>
      {comment.status !== "DELETED" && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              actionsTriggerRef.current?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-normal">
                {t(MODERATION_TEXT.delete)}
              </DialogTitle>
              <DialogDescription>
                {t(MODERATION_TEXT.deleteConfirm)}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button size="sm" type="button" variant="outline">
                  {t(ADMIN_TEXT.cancel)}
                </Button>
              </DialogClose>
              <Button
                size="sm"
                type="button"
                variant="destructive"
                disabled={action.isPending}
                onClick={() => run("delete")}
              >
                {t(MODERATION_TEXT.delete)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {!comment.is_reply && comment.status === "VISIBLE" && (
        <form
          className="-mx-4 mt-4 flex flex-col gap-2 border-t border-border px-4 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (body.trim()) run("reply");
          }}
        >
          <Label htmlFor={`moderation-reply-${comment.id}`}>
            {t(MODERATION_TEXT.reply)}
          </Label>
          <Textarea
            className="text-sm"
            id={`moderation-reply-${comment.id}`}
            placeholder={t(MODERATION_TEXT.reply)}
            value={body}
            maxLength={2000}
            rows={2}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            className="self-start"
            disabled={!body.trim() || action.isPending}
          >
            {t(MODERATION_TEXT.reply)}
          </Button>
        </form>
      )}
    </li>
  );
};
