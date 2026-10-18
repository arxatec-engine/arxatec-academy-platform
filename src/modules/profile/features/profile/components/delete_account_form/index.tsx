import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UI_TEXT } from "@/components/shared/i18n";
import { PasswordInput } from "@/components/shared/password_input";
import { NS } from "@/locales/namespaces";
import { useDeleteAccount } from "@/modules/profile/hooks";
import { PROFILE_TEXT } from "@/modules/profile/i18n";
import { RouteHelpers } from "@/routes/routes";
import type { ApiUser } from "@/types/auth";

interface Props {
  user: ApiUser;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: React.ComponentProps<typeof DialogContent>["onCloseAutoFocus"];
}

export const DeleteAccountForm = ({
  user,
  open: controlledOpen,
  onOpenChange,
  onCloseAutoFocus,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (nextOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const remove = useDeleteAccount();
  const changeOpen = (nextOpen: boolean) => {
    if (remove.isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmation("");
      setPassword("");
    }
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (remove.isPending || confirmation !== t(PROFILE_TEXT.confirmWord)) return;
    void toast.promise(
      remove
        .mutateAsync(user.auth_provider === "PASSWORD" ? password : null)
        .then(() => {
          setOpen(false);
          setConfirmation("");
          setPassword("");
          return navigate(RouteHelpers.home(), { replace: true });
        }),
      {
        loading: t(PROFILE_TEXT.deleteAccount),
        success: t(PROFILE_TEXT.deleteAccount),
        error: t(PROFILE_TEXT.deleteFailed),
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button size="sm" type="button" variant="destructive">
            {t(PROFILE_TEXT.danger)}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-base">
            {t(PROFILE_TEXT.danger)}
          </DialogTitle>
          <DialogDescription>{t(PROFILE_TEXT.deleteHint)}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          {user.auth_provider === "PASSWORD" && (
            <div className="space-y-2">
              <Label htmlFor="delete-password">
                {t(PROFILE_TEXT.currentPassword)}
              </Label>
              <PasswordInput
                size="sm"
                id="delete-password"
                placeholder={t(PROFILE_TEXT.currentPassword)}
                autoComplete="current-password"
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          )}
          <div>
            <Label htmlFor="delete-confirm">
              {t(PROFILE_TEXT.deleteConfirm)}
            </Label>
            <Input
              size="sm"
              id="delete-confirm"
              placeholder={t(PROFILE_TEXT.confirmWord)}
              className="mt-2"
              value={confirmation}
              required
              autoComplete="off"
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={remove.isPending}
              >
                {t(UI_TEXT.close)}
              </Button>
            </DialogClose>
            <Button
              size="sm"
              type="submit"
              variant="destructive"
              aria-busy={remove.isPending}
              disabled={
                remove.isPending ||
                confirmation !== t(PROFILE_TEXT.confirmWord)
              }
            >
              {t(PROFILE_TEXT.deleteAccount)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
