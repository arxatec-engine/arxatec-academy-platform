# Interés en cursos

El catálogo público ofrece dos acciones: proponer un tema (`POST /notifications/topics`) y
recibir avisos generales (`POST /notifications/signups`). Cada formulario se abre en un
`Dialog` de `arxatec-ui` mediante `InterestDialog`; su título y descripción son accesibles,
el cierre está traducido y Escape devuelve el foco a la acción que lo abrió.

El backend acepta sesión opcional: con sesión toma el correo de la cuenta; sin ella, ambos
formularios solicitan correo. Los servicios hacen solo transporte, los hooks envuelven
mutaciones y los formularios usan `arxatec-ui` y `toast.promise`. El backend aplica rate limits
e idempotencia de altas. Las pruebas de `InterestPanel` cubren apertura, foco, cierre sin envío
y la omisión del correo cuando ya hay una cuenta.

`NoticeSignupForm` vive en `src/components/shared/` porque también lo consume la ficha de curso sin lecciones. Su `courseSlug` opcional distingue el aviso del curso del aviso general.
