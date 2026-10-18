# Estilo de código

Las reglas detalladas y numeradas del frontend viven en [CODE_STYLING.md](../CODE_STYLING.md). Este documento recoge las decisiones de producto y arquitectura que deben acompañar esos estilos.

- Organiza el código en `modules/<dominio>/features/<feature>` y agrega solo las carpetas que usa la feature. Directorios en `snake_case`, componentes `PascalCase`, hooks `useCamelCase`.
- Centraliza paths y generación de URLs en `src/routes/routes.ts`. Mantén las páginas ligeras y los títulos con `useTitle`.
- Conserva el flujo de datos página/componente → hook → servicio → interceptor. Servicios HTTP sin React; consultas y escrituras con React Query. Ninguna petición desde `useEffect`.
- Importa controles y tokens del design system `arxatec-ui`. Respeta las familias de letra, tamaños y tema de Academy; no introduzcas controles o paletas paralelas sin una necesidad de producto.
- Usa `size="sm"` en todos los `Input`, `PasswordInput` y `SelectTrigger`. Los campos de texto, áreas de texto y selectores deben incluir un `placeholder` traducido.
- Reserva `LoaderSplash` para el fallback de rutas y el arranque previo a React. Las cargas de contenido y de sesión usan un único bloque simple de `Skeleton` de `arxatec-ui` por estado de carga.
- Todo texto visible vive en los recursos i18n y mantiene la misma clave en español, inglés y portugués. Usa las claves tipadas y los namespaces centralizados.
- Valida formularios y respuestas no confiables en sus límites. Conserva `snake_case` en los contratos del API y adapta a `camelCase` en el adaptador del módulo.
- La instancia HTTP autenticada y la pública tienen propósitos distintos. El servicio decide cuál usar según el contrato; nunca construyas una instancia Axios en una feature.
- El navegador contiene solo datos de sesión necesarios para enviar el token y preferencias de presentación. No guardes contraseñas ni escribas secretos en variables `VITE_`.
- Las features mantienen `docs/README.md` junto con el código. Si una decisión funcional cambia, actualiza su documentación en el mismo cambio.
- No uses `any`, `console.log` ni supresiones de tipos para ocultar errores. Usa pnpm y los scripts declarados en `package.json`.

Las pruebas correspondientes a este repositorio están en [Verificación](TESTING.md); las reglas generales del código están en [CODE_STYLING.md](../CODE_STYLING.md).
