import { Button, Label, Textarea } from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useCreateComment, useReplyToComment } from "@/modules/comments/hooks";
import { COMMENTS_TEXT } from "@/modules/comments/i18n";

interface Props {
  lessonId: string;
  replyTo?: string;
  onPosted?: () => void;
}

export const CommentComposer = ({ lessonId, replyTo, onPosted }: Props) => {
  const { t } = useTranslation(NS.common);
  const [body, setBody] = useState("");
  const create = useCreateComment(lessonId);
  const reply = useReplyToComment(lessonId);
  const isPending = create.isPending || reply.isPending;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    const task = replyTo
      ? reply.mutateAsync({ commentId: replyTo, body: trimmed })
      : create.mutateAsync({ lessonId, body: trimmed });
    void toast.promise(
      task.then(() => {
        setBody("");
        onPosted?.();
      }),
      {
        loading: t(COMMENTS_TEXT.posting),
        success: t(COMMENTS_TEXT.posted),
        error: t(COMMENTS_TEXT.failed),
      },
    );
  };

  return (
    <form className="mt-6" onSubmit={submit}>
      <Label
        htmlFor={`comment-${replyTo ?? lessonId}`}
        className="mb-2 block text-sm font-medium"
      >
        {t(replyTo ? COMMENTS_TEXT.reply : COMMENTS_TEXT.write)}
      </Label>
      <Textarea
        id={`comment-${replyTo ?? lessonId}`}
        placeholder={t(replyTo ? COMMENTS_TEXT.reply : COMMENTS_TEXT.write)}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={2000}
        rows={replyTo ? 3 : 4}
        required
        className="text-sm"
      />
      <Button
        size="sm"
        type="submit"
        className="mt-3"
        disabled={isPending || !body.trim()}
      >
        {t(COMMENTS_TEXT.publish)}
      </Button>
    </form>
  );
};
