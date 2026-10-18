import { Skeleton } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { UI_TEXT } from "@/components/shared/i18n";
import { cn } from "@/utilities/cn";

interface Props {
  fullScreen?: boolean;
  labelKey?: (typeof UI_TEXT.loading)[keyof typeof UI_TEXT.loading];
  className?: string;
}

export const LoadingScreen = ({
  fullScreen = false,
  labelKey = UI_TEXT.loading.default,
  className,
}: Props) => {
  const { t } = useTranslation(NS.common);

  return (
    <div
      role="status"
      aria-label={t(labelKey)}
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "w-full motion-reduce:[&_[data-slot=skeleton]]:animate-none",
        fullScreen &&
          "fixed inset-0 z-50 min-h-svh overflow-hidden bg-background px-4 py-10 sm:px-6",
        className,
      )}
    >
      <Skeleton
        aria-hidden="true"
        className={cn("h-40 w-full", fullScreen && "mx-auto max-w-3xl")}
      />
    </div>
  );
};
