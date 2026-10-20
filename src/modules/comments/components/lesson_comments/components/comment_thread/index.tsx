import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "arxatec-ui";
import { ChevronDown, Reply } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import motion from "@/components/shared/collapsible_motion.module.css";
import { NS } from "@/locales/namespaces";
import { COMMENTS_TEXT } from "@/modules/comments/i18n";
import type { CommentThread as CommentThreadData } from "@/modules/comments/types";
import { CommentComposer } from "../comment_composer";
import { CommentEntry } from "../comment_entry";
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
  const replyFormId = useId();
  const [replyOpen, setReplyOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);

  return (
    <li className="min-w-0 px-4 py-3 first:pt-0 last:pb-0">
      <CommentEntry comment={thread}>
        {(canWrite || canReport) && (
          <div className="-ml-2 mt-1 flex flex-wrap gap-1">
            {canWrite && (
              <Button
                size="sm"
                type="button"
                variant="ghost"
                className="h-8 px-2"
                aria-expanded={replyOpen}
                aria-controls={replyFormId}
                onClick={() => setReplyOpen((previous) => !previous)}
              >
                <Reply aria-hidden="true" className="size-4" />
                {t(COMMENTS_TEXT.reply)}
              </Button>
            )}
            {canReport && <ReportButton commentId={thread.id} />}
          </div>
        )}
        {replyOpen && canWrite && (
          <div id={replyFormId}>
            <CommentComposer
              lessonId={lessonId}
              replyTo={thread.id}
              onPosted={() => {
                setReplyOpen(false);
                setRepliesOpen(true);
              }}
            />
          </div>
        )}
        {thread.replies.length > 0 && (
          <Collapsible open={repliesOpen} onOpenChange={setRepliesOpen}>
            <CollapsibleTrigger asChild>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                className="group -ml-2 mt-1 h-auto max-w-full justify-start gap-1.5 px-2 py-1.5 text-sm text-primary whitespace-normal"
              >
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
                />
                {t(
                  repliesOpen ? COMMENTS_TEXT.hideReplies : COMMENTS_TEXT.showReplies,
                  { count: thread.replies.length },
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent
              className={motion.persistentContent}
              forceMount
              aria-hidden={!repliesOpen}
              inert={!repliesOpen}
            >
              <div className={motion.persistentGrid}>
                <div className={motion.persistentClip}>
                  <ol className="divide-y divide-border pt-3">
                    {thread.replies.map((entry) => (
                      <li
                        key={entry.id}
                        className="min-w-0 py-2 first:pt-0 last:pb-0"
                      >
                        <CommentEntry comment={entry} compact>
                          {canReport && (
                            <div className="-ml-2 mt-1">
                              <ReportButton commentId={entry.id} />
                            </div>
                          )}
                        </CommentEntry>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CommentEntry>
    </li>
  );
};
