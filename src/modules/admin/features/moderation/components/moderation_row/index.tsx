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
  DialogTrigger,
  Label,
  Textarea,
} from "arxatec-ui";
import { useState } from "react";
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
  const action = useModerationAction();
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
      <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
        <span className="min-w-0 [overflow-wrap:anywhere]">
          {comment.author?.full_name ?? t(MODERATION_TEXT.deletedAuthor)} ·{" "}
          {comment.course.title}
        </span>
        <Badge variant="secondary" className="font-normal">
          {t(MODERATION_TEXT.reports, { count: comment.report_count })}
        </Badge>
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
      <div className="mt-3 flex flex-wrap gap-2">
        {comment.status === "HIDDEN" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={action.isPending}
            onClick={() => run("show")}
          >
            {t(MODERATION_TEXT.show)}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={action.isPending}
            onClick={() => run("hide")}
          >
            {t(MODERATION_TEXT.hide)}
          </Button>
        )}
        {comment.status !== "DELETED" && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="destructive">
                {t(MODERATION_TEXT.delete)}
              </Button>
            </DialogTrigger>
            <DialogContent>
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
      </div>
      {!comment.is_reply && comment.status === "VISIBLE" && (
        <form
          className="mt-4 flex flex-col gap-2 border-t border-border pt-3"
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
