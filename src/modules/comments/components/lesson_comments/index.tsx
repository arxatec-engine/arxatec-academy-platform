import {
  AsyncBoundary,
  Button,
  Card,
  CardContent,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Skeleton,
  StatusMessage,
  buttonVariants,
  cn,
} from "arxatec-ui";
import {
  ChevronDown,
  LogIn,
  MailCheck,
  MessageCircle,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import motion from "@/components/shared/collapsible_motion.module.css";
import { NS } from "@/locales/namespaces";
import { UI_TEXT } from "@/components/shared/i18n";
import { useComments } from "@/modules/comments/hooks";
import { COMMENTS_TEXT } from "@/modules/comments/i18n";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";
import { CommentComposer } from "./components/comment_composer";
import { CommentThread } from "./components/comment_thread";

interface Props {
  lessonId: string;
  grouped?: boolean;
}

export const LessonComments = ({ lessonId, grouped = false }: Props) => {
  const { t } = useTranslation(NS.common);
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const query = useComments(lessonId);
  const [open, setOpen] = useState(false);
  const returnTo = `${location.pathname}${location.search}`;
  const canWrite = Boolean(user?.email_verified_at);

  return (
    <section
      className={grouped ? undefined : "mt-6"}
      aria-labelledby="comments-title"
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden py-0 shadow-none",
          grouped ? "rounded-none border-0" : "rounded-md",
        )}
      >
        <Collapsible open={open} onOpenChange={setOpen}>
          <h2 id="comments-title">
            <CollapsibleTrigger
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "group h-auto w-full justify-between px-4 py-2 text-sm has-[>svg]:px-4",
                grouped ? "rounded-none" : "rounded-md",
              )}
            >
              <span className="flex items-center gap-3">
                <MessageCircle
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
                {t(COMMENTS_TEXT.title)}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
              />
            </CollapsibleTrigger>
          </h2>
          <CollapsibleContent
            className={motion.persistentContent}
            forceMount
            aria-hidden={!open}
            inert={!open}
          >
            <div className={motion.persistentGrid}>
              <div className={motion.persistentClip}>
                <CardContent className="border-t border-border px-4 py-2">
                  {canWrite ? (
                    <>
                      {!query.isError && (
                        <p className="text-sm text-muted-foreground">
                          {t(COMMENTS_TEXT.intro)}
                        </p>
                      )}
                      <CommentComposer lessonId={lessonId} />
                    </>
                  ) : (
                    <div className="space-y-2">
                      <StatusMessage
                        size="sm"
                        color="white"
                        classNameCard="bg-muted!"
                        icon={user ? MailCheck : LogIn}
                        title={t(user ? COMMENTS_TEXT.verifyEmail : UI_TEXT.signIn)}
                        description={t(
                          user ? COMMENTS_TEXT.verifyHint : COMMENTS_TEXT.signInHint,
                        )}
                      />
                      <Button asChild size="sm" className="w-full" variant="outline">
                        <Link
                          to={
                            user
                              ? RouteHelpers.checkEmail()
                              : RouteHelpers.login(returnTo)
                          }
                        >
                          {t(user ? COMMENTS_TEXT.verifyEmail : UI_TEXT.signIn)}
                        </Link>
                      </Button>
                    </div>
                  )}
                  <AsyncBoundary
                    isLoading={query.isPending}
                    isError={query.isError}
                    data={query.data}
                    LoadingComponent={
                      <Skeleton
                        role="status"
                        aria-label={t(COMMENTS_TEXT.loading)}
                        aria-busy="true"
                        className="mt-8 h-32 w-full motion-reduce:animate-none"
                      />
                    }
                    ErrorComponent={
                      <div className="mt-6" role="alert">
                        <StatusMessage
                          size="sm"
                          color="rose"
                          icon={TriangleAlert}
                          title={t(COMMENTS_TEXT.loadFailed)}
                          description={t(COMMENTS_TEXT.loadErrorHint)}
                        />
                      </div>
                    }
                    EmptyComponent={
                      canWrite ? (
                        <div className="mt-6" role="status">
                          <StatusMessage
                            size="sm"
                            color="white"
                            icon={MessageCircle}
                            title={t(UI_TEXT.emptyTitle)}
                            description={t(COMMENTS_TEXT.empty)}
                          />
                        </div>
                      ) : null
                    }
                  >
                    {(threads) => (
                      <ol className="-mx-4 mt-6 divide-y divide-border">
                        {threads.map((thread) => (
                          <CommentThread
                            key={thread.id}
                            thread={thread}
                            lessonId={lessonId}
                            canWrite={canWrite}
                            canReport={Boolean(user)}
                          />
                        ))}
                      </ol>
                    )}
                  </AsyncBoundary>
                </CardContent>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </section>
  );
};
