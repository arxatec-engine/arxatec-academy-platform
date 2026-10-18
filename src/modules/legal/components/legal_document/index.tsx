import { useTranslation } from "react-i18next";
import { PageHeading } from "@/components/shared/page_heading";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { LEGAL } from "@/modules/legal/constants";
import { LEGAL_TEXT, type LegalDocumentKind } from "@/modules/legal/i18n";

interface Props {
  kind: LegalDocumentKind;
}

const linkClassName =
  "rounded-sm text-foreground underline underline-offset-4 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

export const LegalDocument = ({ kind }: Props) => {
  const { t, i18n } = useTranslation(NS.common);
  const document = LEGAL_TEXT.documents[kind];
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(LEGAL.updatedAt));

  useTitle(t(document.title));

  return (
    <article className="max-w-2xl font-normal">
      <PageHeading
        title={t(document.title)}
        description={t(document.description)}
      />
      <p className="mb-8 text-sm text-muted-foreground">
        <time dateTime={LEGAL.updatedAt}>
          {t(LEGAL_TEXT.updatedAt, { date })}
        </time>
      </p>
      <div className="space-y-6">
        {document.sections.map((section) => (
          <section key={section.title} aria-labelledby={section.title}>
            <h2 id={section.title} className="mb-2 text-base font-normal">
              {t(section.title)}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(section.body)}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-8 space-y-3 text-sm text-muted-foreground">
        <p>
          {t(LEGAL_TEXT.contact)}{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className={linkClassName}>
            {LEGAL.contactEmail}
          </a>
        </p>
        <a
          href={LEGAL.generalPolicies[kind]}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClassName} inline-block text-sm`}
        >
          {t(LEGAL_TEXT.generalPolicy)}
        </a>
      </div>
    </article>
  );
};
