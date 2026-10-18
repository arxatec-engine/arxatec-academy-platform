import { useTranslation } from "react-i18next";
import { NoticeSignupForm } from "@/components/shared/notice_signup_form";
import { NS } from "@/locales/namespaces";
import { INTEREST_TEXT } from "@/modules/notifications/i18n";
import { InterestDialog } from "../interest_dialog";
import { TopicRequestForm } from "../topic_request_form";

export const InterestPanel = () => {
  const { t } = useTranslation(NS.common);
  return (
    <section
      className="mt-2 flex flex-col gap-5 bg-card p-8 rounded-md border border-border sm:flex-row sm:items-center sm:justify-between"
      aria-labelledby="interest-title"
    >
      <h2 id="interest-title" className="text-xl tracking-tight">
        {t(INTEREST_TEXT.title)}
      </h2>
      <div className="flex flex-wrap gap-3">
        <InterestDialog
          title={t(INTEREST_TEXT.topicTitle)}
          description={t(INTEREST_TEXT.topicHint)}
        >
          <TopicRequestForm />
        </InterestDialog>
        <InterestDialog
          title={t(INTEREST_TEXT.noticeTitle)}
          description={t(INTEREST_TEXT.noticeHint)}
          actionLabel={t(INTEREST_TEXT.noticeAction)}
        >
          <NoticeSignupForm />
        </InterestDialog>
      </div>
    </section>
  );
};
