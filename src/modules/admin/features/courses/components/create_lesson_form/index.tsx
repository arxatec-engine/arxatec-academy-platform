import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useCreateAdminLesson } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminLessonView } from "@/modules/admin/types/lessons";
import type { LessonType } from "@/modules/catalog/types";

interface Props {
  courseId: string;
  onCreated: (view: AdminLessonView) => void;
  onDirtyChange: (dirty: boolean) => void;
}

export const CreateLessonForm = ({
  courseId,
  onCreated,
  onDirtyChange,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const create = useCreateAdminLesson(courseId);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("VIDEO");
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (create.isPending) return;
    void toast.promise(
      create.mutateAsync({ title: title.trim(), type }).then((view) => {
        setTitle("");
        setType("VIDEO");
        onDirtyChange(false);
        onCreated(view);
      }),
      {
        loading: t(ADMIN_TEXT.lessonCreate),
        success: t(ADMIN_TEXT.created),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <form
      className="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
      onSubmit={submit}
    >
      <div className="min-w-0">
        <Label htmlFor="new-lesson-title">{t(ADMIN_TEXT.lessonTitle)}</Label>
        <Input
          size="sm"
          id="new-lesson-title"
          placeholder={t(ADMIN_TEXT.lessonTitle)}
          className="mt-1.5"
          value={title}
          required
          maxLength={160}
          disabled={create.isPending}
          onChange={(event) => {
            setTitle(event.target.value);
            onDirtyChange(Boolean(event.target.value) || type !== "VIDEO");
          }}
        />
      </div>
      <div>
        <Label htmlFor="new-lesson-type">{t(ADMIN_TEXT.lessonType)}</Label>
        <Select
          value={type}
          disabled={create.isPending}
          onValueChange={(value: LessonType) => {
            setType(value);
            onDirtyChange(Boolean(title) || value !== "VIDEO");
          }}
        >
          <SelectTrigger
            size="sm"
            id="new-lesson-type"
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
      <Button
        size="sm"
        type="submit"
        disabled={create.isPending || !title.trim()}
      >
        {t(ADMIN_TEXT.lessonCreate)}
      </Button>
    </form>
  );
};
