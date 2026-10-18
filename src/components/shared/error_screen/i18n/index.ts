export const errorScreen = {
  copy: {
    not_found: {
      action: "errors.not_found.action",
      description: "errors.not_found.description",
      title: "errors.not_found.title",
    },
    unexpected: {
      action: "errors.unexpected.action",
      description: "errors.unexpected.description",
      title: "errors.unexpected.title",
    },
  },
} as const;

export type ErrorScreenKind = keyof typeof errorScreen.copy;
