import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
} from "arxatec-ui";
import { ArrowUpRight, Bell } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useSignUpForNotice } from "@/modules/notifications/hooks";
import { INTEREST_TEXT } from "@/modules/notifications/i18n";
import { useUserStore } from "@/store/user";

interface Props {
  courseSlug?: string;
}

export const NoticeSignupForm = ({ courseSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  const user = useUserStore((state) => state.user);
  const [email, setEmail] = useState("");
  const signup = useSignUpForNotice();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void toast.promise(
      signup.mutateAsync({
        email: user ? undefined : email.trim(),
        courseSlug,
      }),
      {
        loading: t(INTEREST_TEXT.noticeAction),
        success: t(INTEREST_TEXT.sent),
        error: t(INTEREST_TEXT.failed),
      },
    );
  };
  return (
    <Card className="gap-5 rounded-md py-6 shadow-none">
      <CardHeader className="px-6">
        <Bell
          aria-hidden="true"
          className="mb-2 size-6 text-muted-foreground"
        />
        <h3 className="text-2xl font-semibold tracking-tight">
          {t(INTEREST_TEXT.noticeTitle)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(INTEREST_TEXT.noticeHint)}
        </p>
      </CardHeader>
      <CardContent className="px-6">
        <form onSubmit={submit}>
          {!user && (
            <>
              <Label htmlFor="interest-notice-email" className="mt-4 block">
                {t(INTEREST_TEXT.email)}
              </Label>
              <Input
                size="sm"
                id="interest-notice-email"
                placeholder={t(INTEREST_TEXT.email)}
                type="email"
                className="mt-2"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </>
          )}
          <Button
            size="sm"
            type="submit"
            className="mt-5"
            disabled={signup.isPending}
          >
            {t(INTEREST_TEXT.noticeAction)}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
