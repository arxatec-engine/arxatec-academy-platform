import { Button } from "arxatec-ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { COURSE_SETUP_TEXT } from "../../i18n/course_setup";

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  nextDisabled?: boolean;
  label?: string;
}

export const CourseStepActions = ({
  onBack,
  onNext,
  disabled,
  nextDisabled,
  label,
}: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <div className="-mx-(--admin-content-padding) flex flex-wrap items-center justify-between gap-3 border-t border-border px-(--admin-content-padding) pt-4">
      {onBack ? (
        <Button
          size="sm"
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t(COURSE_SETUP_TEXT.previous)}
        </Button>
      ) : (
        <span />
      )}
      <Button
        size="sm"
        type={onNext ? "button" : "submit"}
        disabled={disabled || nextDisabled}
        onClick={onNext}
      >
        {label ?? t(COURSE_SETUP_TEXT.next)}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
};
