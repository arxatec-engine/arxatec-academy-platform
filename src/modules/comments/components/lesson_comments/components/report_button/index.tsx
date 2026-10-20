import { Button } from "arxatec-ui";
import { Flag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useReportComment } from "@/modules/comments/hooks";
import { COMMENTS_TEXT } from "@/modules/comments/i18n";

interface Props {
  commentId: string;
}

export const ReportButton = ({ commentId }: Props) => {
  const { t } = useTranslation(NS.common);
  const [reported, setReported] = useState(false);
  const report = useReportComment();
  const reportOne = () => {
    void toast.promise(
      report.mutateAsync(commentId).then(() => setReported(true)),
      {
        loading: t(COMMENTS_TEXT.reporting),
        success: t(COMMENTS_TEXT.reported),
        error: t(COMMENTS_TEXT.reportFailed),
      },
    );
  };

  return reported ? null : (
    <Button
      size="sm"
      type="button"
      variant="ghost"
      className="h-8 px-2 text-muted-foreground"
      disabled={report.isPending}
      onClick={reportOne}
    >
      <Flag aria-hidden="true" className="size-4" />
      {t(COMMENTS_TEXT.report)}
    </Button>
  );
};
