import type { CourseTopic } from "@/modules/catalog/types";

export const COURSE_COVERS: Readonly<Record<string, string>> = {
  "automatiza-tus-escritos": "/images/courses/automatiza_tus_escritos.webp",
  "contratos-como-sistema": "/images/courses/contratos_como_sistema.webp",
  "expedientes-sin-excel": "/images/courses/expedientes_sin_excel.webp",
  "fundamentos-de-legal-tech": "/images/courses/fundamentos_de_legal_tech.webp",
  "ia-aplicada-a-la-practica-legal": "/images/courses/ia_aplicada.webp",
  "ordena-tu-estudio-en-arxatec": "/images/courses/ordena_tu_estudio.webp",
};

export const TOPIC_COVERS: Readonly<Record<CourseTopic, string>> = {
  APPLIED_AI: "/images/courses/ia_aplicada.webp",
  ARXATEC_PRODUCT: "/images/courses/ordena_tu_estudio.webp",
  FIRST_STEPS: "/images/courses/fundamentos_de_legal_tech.webp",
  LEGAL_ENGINEERING: "/images/courses/contratos_como_sistema.webp",
};
