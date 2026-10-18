import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
} from "arxatec-ui";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useRequestTopic } from "@/modules/notifications/hooks";
import { INTEREST_TEXT } from "@/modules/notifications/i18n";
import { useUserStore } from "@/store/user";

export const TopicRequestForm = () => {
  const { t } = useTranslation(NS.common);
  const user = useUserStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const request = useRequestTopic();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void toast.promise(
      request
        .mutateAsync({
          searchTerm: searchTerm.trim(),
          email: user ? undefined : email.trim(),
        })
        .then(() => setSearchTerm("")),
      {
        loading: t(INTEREST_TEXT.topicAction),
        success: t(INTEREST_TEXT.sent),
        error: t(INTEREST_TEXT.failed),
      },
    );
  };
  return (
    <Card className="gap-5 rounded-md py-6 shadow-none">
      <CardHeader className="px-6">
        <Lightbulb
          aria-hidden="true"
          className="mb-2 size-6 text-muted-foreground"
        />
        <h3 className="text-2xl font-semibold tracking-tight">
          {t(INTEREST_TEXT.topicTitle)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(INTEREST_TEXT.topicHint)}
        </p>
      </CardHeader>
      <CardContent className="px-6">
        <form onSubmit={submit}>
          <Label htmlFor="interest-topic" className="mt-4 block">
            {t(INTEREST_TEXT.topicLabel)}
          </Label>
          <Input
            size="sm"
            id="interest-topic"
            placeholder={t(INTEREST_TEXT.topicLabel)}
            className="mt-2"
            value={searchTerm}
            maxLength={120}
            required
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {!user && (
            <>
              <Label htmlFor="interest-topic-email" className="mt-4 block">
                {t(INTEREST_TEXT.email)}
              </Label>
              <Input
                size="sm"
                id="interest-topic-email"
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
            variant="outline"
            className="mt-5"
            disabled={request.isPending || !searchTerm.trim()}
          >
            {t(INTEREST_TEXT.topicAction)}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
