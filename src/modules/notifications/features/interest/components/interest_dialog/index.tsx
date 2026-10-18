import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "arxatec-ui";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  children: ReactNode;
}

export const InterestDialog = ({
  title,
  description,
  actionLabel,
  children,
}: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {actionLabel ?? title}
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] gap-0 overflow-y-auto rounded-md border-0 p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 size-8"
            aria-label={t(UI_TEXT.close)}
            title={t(UI_TEXT.close)}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
