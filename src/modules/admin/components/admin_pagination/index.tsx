import { Button } from "arxatec-ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { MODERATION_TEXT } from "@/modules/admin/i18n";

interface Props {
  page: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export const AdminPagination = ({ page, hasNext, onPageChange }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
      <Button
        size="sm"
        type="button"
        variant="outline"
        className="gap-1 font-normal"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t(MODERATION_TEXT.previous)}
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {t(MODERATION_TEXT.page, { count: page })}
      </span>
      <Button
        size="sm"
        type="button"
        variant="outline"
        className="gap-1 font-normal"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        {t(MODERATION_TEXT.next)}
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
};
