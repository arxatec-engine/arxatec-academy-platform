import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "arxatec-ui";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { PROFILE_TEXT } from "@/modules/profile/i18n";
import type { ApiUser } from "@/types/auth";
import { DeleteAccountForm } from "../delete_account_form";
import { PasswordForm } from "../password_form";

interface Props {
  user: ApiUser;
}

export const ProfileAccountActions = ({ user }: Props) => {
  const { t } = useTranslation(NS.common);
  const [dialog, setDialog] = useState<"password" | "delete" | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const changeDialogOpen = (open: boolean) => {
    if (!open) setDialog(null);
  };
  const restoreTriggerFocus = (event: Event) => {
    event.preventDefault();
    triggerRef.current?.focus();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            size="sm"
            type="button"
            variant="destructive"
          >
            {t(PROFILE_TEXT.danger)}
            <ChevronDown aria-hidden="true" className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => {
            if (dialog) event.preventDefault();
          }}
        >
          {user.auth_provider === "PASSWORD" && (
            <DropdownMenuItem onSelect={() => setDialog("password")}>
              {t(PROFILE_TEXT.changePassword)}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDialog("delete")}
          >
            {t(PROFILE_TEXT.danger)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {user.auth_provider === "PASSWORD" && (
        <PasswordForm
          open={dialog === "password"}
          onOpenChange={changeDialogOpen}
          onCloseAutoFocus={restoreTriggerFocus}
        />
      )}
      <DeleteAccountForm
        user={user}
        open={dialog === "delete"}
        onOpenChange={changeDialogOpen}
        onCloseAutoFocus={restoreTriggerFocus}
      />
    </>
  );
};
