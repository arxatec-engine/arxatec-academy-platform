export const LEGAL_TEXT = {
  updatedAt: "legal.updated_at",
  contact: "legal.contact",
  generalPolicy: "legal.general_policy",
  documents: {
    terms: {
      title: "legal.terms.title",
      description: "legal.terms.description",
      sections: [
        { title: "legal.terms.access.title", body: "legal.terms.access.body" },
        { title: "legal.terms.account.title", body: "legal.terms.account.body" },
        { title: "legal.terms.content.title", body: "legal.terms.content.body" },
        { title: "legal.terms.community.title", body: "legal.terms.community.body" },
        { title: "legal.terms.learning.title", body: "legal.terms.learning.body" },
        { title: "legal.terms.changes.title", body: "legal.terms.changes.body" },
      ],
    },
    privacy: {
      title: "legal.privacy.title",
      description: "legal.privacy.description",
      sections: [
        { title: "legal.privacy.data.title", body: "legal.privacy.data.body" },
        { title: "legal.privacy.purpose.title", body: "legal.privacy.purpose.body" },
        { title: "legal.privacy.public.title", body: "legal.privacy.public.body" },
        { title: "legal.privacy.providers.title", body: "legal.privacy.providers.body" },
        { title: "legal.privacy.storage.title", body: "legal.privacy.storage.body" },
        { title: "legal.privacy.rights.title", body: "legal.privacy.rights.body" },
      ],
    },
  },
} as const;

export type LegalDocumentKind = keyof typeof LEGAL_TEXT.documents;
