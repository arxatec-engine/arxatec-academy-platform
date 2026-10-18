import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Logo,
} from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page_shell";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { useTitle } from "@/hooks";
import { ApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { ROUTE_PARAM_NAMES } from "@/routes/routes";
import { useUserStore } from "@/store/user";
import { cn } from "@/utilities/cn";
import { useCertificate } from "../hooks/use_certificate";
import { CERTIFICATE_TEXT } from "../i18n";
import { certificatePdfUrl } from "../services";

const CertificatePage = () => {
  const { t, i18n } = useTranslation(NS.common);
  const params = useParams();
  const id = params[ROUTE_PARAM_NAMES.id] ?? "";
  const query = useCertificate(id);
  const user = useUserStore((state) => state.user);
  useTitle(t(CERTIFICATE_TEXT.title));
  const certificate = query.data;
  const missing =
    query.error instanceof ApiError && [404, 422].includes(query.error.status);
  if (missing) throw new Response(null, { status: 404 });
  const copyLink = async () => {
    if (!certificate) return;
    try {
      await navigator.clipboard.writeText(certificate.verification_url);
      toast.success(t(CERTIFICATE_TEXT.copied));
    } catch {
      toast.error(t(CERTIFICATE_TEXT.copyFailed));
    }
  };

  const content = (
    <>
      {query.isPending && <LoadingScreen />}
      {query.isError && (
        <div role="alert" className="space-y-3">
          <h1 className="text-2xl">{t(CERTIFICATE_TEXT.loadFailed)}</h1>
          <Button
            size="sm"
            type="button"
            onClick={() => void query.refetch()}
          >
            {t(CERTIFICATE_TEXT.retry)}
          </Button>
        </div>
      )}
      {certificate && !query.isError && (
        <div
          className={
            user
              ? "space-y-3"
              : "relative flex w-full flex-1 flex-col justify-center"
          }
        >
          <Card
            data-certificate-preview={certificate.id}
            className={cn(
              "rounded-md py-6 shadow-none",
              !user && "w-full rounded-none border-x-0 bg-background py-0",
            )}
          >
            <CardContent
              className={cn(
                "space-y-6 px-4 sm:px-6",
                !user && "mx-auto w-full max-w-3xl bg-card py-6",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Logo variant="academy" className="h-auto w-36" />
                <Badge variant="secondary">
                  {t(CERTIFICATE_TEXT.verified)}
                </Badge>
              </div>
              <h1 className="text-2xl">{t(CERTIFICATE_TEXT.title)}</h1>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t(CERTIFICATE_TEXT.awardedTo)}
                </p>
                <p className="break-words text-2xl font-medium">
                  {certificate.recipient_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(CERTIFICATE_TEXT.completedCourse)}
                </p>
                <h2 className="break-words text-base font-medium">
                  {certificate.course_title}
                </h2>
              </div>
              <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 sm:flex-row">
                <dl className="min-w-0 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">
                      {t(CERTIFICATE_TEXT.completionDate)}
                    </dt>
                    <dd className="mt-1">
                      <time dateTime={certificate.completed_at}>
                        {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                          dateStyle: "long",
                          timeZone: "America/Lima",
                        }).format(new Date(certificate.completed_at))}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {t(CERTIFICATE_TEXT.identifier)}
                    </dt>
                    <dd className="mt-1 break-all font-mono">
                      {certificate.id}
                    </dd>
                  </div>
                </dl>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <a href={certificate.verification_url}>
                    <img
                      src={certificate.qr_code_data_url}
                      alt={t(CERTIFICATE_TEXT.qrAlt)}
                      width={128}
                      height={128}
                      className="rounded-md border border-border bg-white"
                    />
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {t(CERTIFICATE_TEXT.qrHint)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {!user && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-3xl -translate-x-1/2 border-x border-border"
            />
          )}
          {user && (
            <>
              <div className="space-y-1">
                <Label htmlFor="certificate-public-url">
                  {t(CERTIFICATE_TEXT.publicUrl)}
                </Label>
                <Input
                  id="certificate-public-url"
                  size="sm"
                  value={certificate.verification_url}
                  readOnly
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => void copyLink()}
                >
                  {t(CERTIFICATE_TEXT.copyLink)}
                </Button>
                <Button size="sm" asChild>
                  <a
                    href={certificatePdfUrl(
                      certificate.id,
                      i18n.resolvedLanguage,
                    )}
                  >
                    {t(CERTIFICATE_TEXT.download)}
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );

  return user ? (
    <PageShell>{content}</PageShell>
  ) : (
    <main className="flex min-h-svh w-full min-w-0 flex-col bg-background text-sm">
      {content}
    </main>
  );
};

export default CertificatePage;
