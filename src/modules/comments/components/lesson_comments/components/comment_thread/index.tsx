import { Badge, Button, Card, CardContent } from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { COMMENTS_TEXT } from "@/modules/comments/i18n";
import type { CommentThread as CommentThreadData } from "@/modules/comments/types";
import { CommentComposer } from "../comment_composer";
import { ReportButton } from "../report_button";

interface Props {
  thread: CommentThreadData;
  lessonId: string;
  canWrite: boolean;
  canReport: boolean;
}

export const CommentThread = ({
  thread,
  lessonId,
  canWrite,
  canReport,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <li>
      <Card className="rounded-md py-5 shadow-none">
        <CardContent className="px-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {thread.author?.fullName ?? t(COMMENTS_TEXT.deletedAuthor)}
            </span>
            {thread.author?.isTeam && (
              <Badge variant="secondary" className="ml-2 font-normal">
                {t(COMMENTS_TEXT.team)}
              </Badge>
            )}
            {thread.author?.affiliation && (
              <span> · {thread.author.affiliation}</span>
            )}
            <span>
              {" "}
              ·{" "}
              <time dateTime={thread.createdAt}>
                {new Date(thread.createdAt).toLocaleDateString()}
              </time>
            </span>
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
            {thread.body}
          </p>
          <div className="mt-3 flex gap-4 text-sm">
            {canWrite && (
              <Button
                size="sm"
                type="button"
                variant="link"
                onClick={() => setReplyOpen(!replyOpen)}
              >
                {t(COMMENTS_TEXT.reply)}
              </Button>
            )}
            {canReport && <ReportButton commentId={thread.id} />}
          </div>
          {replyOpen && canWrite && (
            <CommentComposer
              lessonId={lessonId}
              replyTo={thread.id}
              onPosted={() => setReplyOpen(false)}
            />
          )}
          {thread.replies.length > 0 && (
            <ol className="mt-5 space-y-4 border-l border-border pl-5">
              {thread.replies.map((entry) => (
                <li key={entry.id}>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {entry.author?.fullName ?? t(COMMENTS_TEXT.deletedAuthor)}
                    </span>
                    <span>
                      {" "}
                      ·{" "}
                      <time dateTime={entry.createdAt}>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </time>
                    </span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {entry.body}
                  </p>
                  {canReport && <ReportButton commentId={entry.id} />}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </li>
  );
};
