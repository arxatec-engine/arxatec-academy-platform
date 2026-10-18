import { Button, Input, Label } from "arxatec-ui";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useCreateAdminResource } from "@/modules/admin/hooks/lessons";
import { ADMIN_TEXT } from "@/modules/admin/i18n";

interface Props {
  lessonId: string;
  onDirtyChange: (dirty: boolean) => void;
}

export const ResourceUploadForm = ({ lessonId, onDirtyChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const create = useCreateAdminResource(lessonId);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !title.trim() || create.isPending) return;
    void toast.promise(
      create.mutateAsync({ title: title.trim(), file }).then(() => {
        setTitle("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        onDirtyChange(false);
      }),
      {
        loading: t(ADMIN_TEXT.resourceUpload),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <form
      className="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-2"
      onSubmit={submit}
    >
      <div className="min-w-0">
        <Label htmlFor={`${id}-title`}>{t(ADMIN_TEXT.resourceTitle)}</Label>
        <Input
          size="sm"
          id={`${id}-title`}
          placeholder={t(ADMIN_TEXT.resourceTitle)}
          className="mt-1.5"
          value={title}
          required
          maxLength={160}
          disabled={create.isPending}
          onChange={(event) => {
            setTitle(event.target.value);
            onDirtyChange(Boolean(event.target.value) || Boolean(file));
          }}
        />
      </div>
      <div className="min-w-0">
        <Label htmlFor={`${id}-file`}>{t(ADMIN_TEXT.resource)}</Label>
        <Input
          size="sm"
          id={`${id}-file`}
          ref={fileRef}
          className="mt-1.5"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
          required
          disabled={create.isPending}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
            onDirtyChange(Boolean(title) || Boolean(selected));
          }}
        />
      </div>
      <Button
        size="sm"
        type="submit"
        className="justify-self-start sm:col-span-2"
        disabled={!title.trim() || !file || create.isPending}
      >
        {t(ADMIN_TEXT.resourceUpload)}
      </Button>
    </form>
  );
};
