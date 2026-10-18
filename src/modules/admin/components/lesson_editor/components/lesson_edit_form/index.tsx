import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "arxatec-ui";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useUpdateAdminLesson } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type {
  AdminLesson,
  LessonDraft,
  UpdateAdminLesson,
} from "@/modules/admin/types/lessons";
import type { LessonType } from "@/modules/catalog/types";
import { ArticleFields } from "../article_fields";
import { VideoFields } from "../video_fields";

interface Props {
  lesson: AdminLesson;
  autoFocus?: boolean;
  onDirtyChange: (dirty: boolean) => void;
}

const initialDraft = (lesson: AdminLesson): LessonDraft => ({
  title: lesson.title,
  description: lesson.description,
  type: lesson.type,
  isFreeSample: lesson.is_free_sample,
  videoProvider: lesson.video?.provider ?? "YOUTUBE",
  videoId: lesson.video?.external_id ?? "",
  durationSeconds: String(lesson.duration_seconds ?? ""),
  articleBody: lesson.article_body ?? "",
  transcript: lesson.transcript ?? "",
  confirmTypeChange: false,
});

export const LessonEditForm = ({ lesson, autoFocus, onDirtyChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const update = useUpdateAdminLesson(lesson.id);
  const id = useId();
  const [draft, setDraft] = useState(() => initialDraft(lesson));
  const change = (next: LessonDraft) => {
    setDraft(next);
    onDirtyChange(
      JSON.stringify(next) !== JSON.stringify(initialDraft(lesson)),
    );
  };
  const needsConfirmation =
    draft.type !== lesson.type &&
    Boolean(lesson.video?.external_id || lesson.article_body);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (update.isPending) return;
    const input: UpdateAdminLesson = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      type: draft.type,
      is_free_sample: draft.isFreeSample,
      transcript: draft.transcript.trim() || null,
      ...(draft.type === "VIDEO"
        ? {
            video_provider: draft.videoProvider,
            video_external_id: draft.videoId.trim() || null,
            ...(draft.videoProvider === "YOUTUBE" &&
            Number(draft.durationSeconds) > 0
              ? { duration_seconds: Number(draft.durationSeconds) }
              : {}),
          }
        : { article_body: draft.articleBody }),
      ...(needsConfirmation
        ? { confirm_type_change: draft.confirmTypeChange }
        : {}),
    };
    void toast.promise(
      update.mutateAsync(input).then((saved) => {
        setDraft(initialDraft(saved.lesson));
        onDirtyChange(false);
      }),
      {
        loading: t(ADMIN_TEXT.save),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <fieldset disabled={update.isPending} className="min-w-0 space-y-4">
        <div>
          <Label htmlFor={`${id}-title`}>{t(ADMIN_TEXT.lessonTitle)}</Label>
          <Input
            size="sm"
            id={`${id}-title`}
            placeholder={t(ADMIN_TEXT.lessonTitle)}
            className="mt-1.5"
            value={draft.title}
            autoFocus={autoFocus}
            required
            maxLength={160}
            onChange={(event) =>
              change({ ...draft, title: event.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor={`${id}-description`}>
            {t(ADMIN_TEXT.description)}
          </Label>
          <Textarea
            id={`${id}-description`}
            placeholder={t(ADMIN_TEXT.description)}
            className="mt-1.5 text-sm"
            value={draft.description}
            onChange={(event) =>
              change({ ...draft, description: event.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor={`${id}-type`}>{t(ADMIN_TEXT.lessonType)}</Label>
          <Select
            value={draft.type}
            onValueChange={(value: LessonType) =>
              change({ ...draft, type: value, confirmTypeChange: false })
            }
          >
            <SelectTrigger
              size="sm"
              id={`${id}-type`}
              className="mt-1.5 w-full min-w-0"
            >
              <SelectValue placeholder={t(ADMIN_TEXT.lessonType)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIDEO">{t(ADMIN_TEXT.video)}</SelectItem>
              <SelectItem value="ARTICLE">{t(ADMIN_TEXT.article)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-free-sample`}
            checked={draft.isFreeSample}
            onCheckedChange={(value) =>
              change({ ...draft, isFreeSample: value === true })
            }
          />
          <Label htmlFor={`${id}-free-sample`}>
            {t(ADMIN_TEXT.freeSample)}
          </Label>
        </div>
        {draft.type === "VIDEO" ? (
          <VideoFields id={id} draft={draft} onChange={change} />
        ) : (
          <ArticleFields id={id} draft={draft} onChange={change} />
        )}
        <div>
          <Label htmlFor={`${id}-transcript`}>{t(ADMIN_TEXT.transcript)}</Label>
          <Textarea
            id={`${id}-transcript`}
            placeholder={t(ADMIN_TEXT.transcript)}
            rows={5}
            className="mt-1.5 text-sm"
            value={draft.transcript}
            onChange={(event) =>
              change({ ...draft, transcript: event.target.value })
            }
          />
        </div>
        {needsConfirmation && (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-type-confirm`}
              checked={draft.confirmTypeChange}
              onCheckedChange={(value) =>
                change({ ...draft, confirmTypeChange: value === true })
              }
            />
            <Label htmlFor={`${id}-type-confirm`}>
              {t(ADMIN_TEXT.confirmTypeChange)}
            </Label>
          </div>
        )}
        <Button
          size="sm"
          type="submit"
          disabled={
            update.isPending ||
            !draft.title.trim() ||
            (needsConfirmation && !draft.confirmTypeChange)
          }
        >
          {t(ADMIN_TEXT.save)}
        </Button>
      </fieldset>
    </form>
  );
};
