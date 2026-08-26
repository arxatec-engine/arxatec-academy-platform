import type { DEFAULT_NS } from "@/locales/namespaces";
import type { Resources } from "@/locales/resources";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS;
    resources: Resources;
    returnNull: false;
  }
}
