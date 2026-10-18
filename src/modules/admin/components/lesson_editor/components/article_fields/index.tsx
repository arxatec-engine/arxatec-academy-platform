import { Label, Textarea } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { LessonDraft } from "@/modules/admin/types/lessons";

interface Props {
  id: string;
  draft: LessonDraft;
  onChange: (draft: LessonDraft) => void;
}

export const ArticleFields = ({ id, draft, onChange }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <div>
      <Label htmlFor={`${id}-article-body`}>{t(ADMIN_TEXT.articleBody)}</Label>
      <Textarea
        id={`${id}-article-body`}
        placeholder={t(ADMIN_TEXT.articleBody)}
        rows={12}
        className="mt-1.5 font-sans text-sm"
        value={draft.articleBody}
        onChange={(event) =>
          onChange({ ...draft, articleBody: event.target.value })
        }
      />
    </div>
  );
};
