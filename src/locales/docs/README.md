# `src/locales` — i18n

Tres idiomas (`es`, `en`, `pt`) y **`es` es la fuente de la verdad**: los textos de `es/auth.json`
son los literales de `harness/05_diseno_y_ux.md` §4, copiados tal cual. `en` y `pt` los traducen
con el mismo tono; **no se "mejora" el español**.

## Piezas

| Archivo | Qué es |
| --- | --- |
| `namespaces.ts` | `NS` (`common`, `auth`), `NAMESPACES` y `DEFAULT_NS`. Se usa `useTranslation(NS.auth)`, nunca `useTranslation("auth")`. |
| `resources.ts` | `LANGUAGES`, `DEFAULT_LANGUAGE`, `toLanguage()` y el objeto `resources` que carga los seis JSON. |
| `i18n.ts` | Única inicialización de i18next. Exporta `i18n`, que consume `<Core>` en el `I18nextProvider`. |
| `<lang>/auth.json` | Las 7 pantallas de auth más `shared`, `errors` y `validation`. |
| `<lang>/common.json` | Chrome de la app: tema, idioma, estados, catálogo y pantallas de error. |

## Claves tipadas

`src/types/i18next.d.ts` declara `CustomTypeOptions` con `resources: Resources`, donde `Resources`
sale de los JSON de `es` (`resources.ts:41`). Consecuencia comprobada: `t("login.titulo_inexistente")`
**no compila** (TS2345). Corolario: **no existen claves dinámicas**. Cuando hay que elegir clave
según una variante (ciudad, modo de tema, tipo de error), se escribe un mapa explícito de literales
—ver `src/components/shared/theme_selector/index.tsx:17` y `src/components/shared/error_screen/index.tsx:15`—
y nunca `t(\`prefijo.${variable}\`)`.

## Detección de idioma

Orden `localStorage → navigator → htmlTag` (`i18n.ts:26`), con la clave
`LOCAL_STORAGE_KEYS.LANGUAGE`. `convertDetectedLanguage` normaliza a la base del código
(`i18n.ts:29`): sin eso el detector cachea `es-ES` o `pt-BR` en `localStorage`, que es lo que se
observó en el navegador antes de añadirlo. Guardar la forma corta deja el valor cacheado igual al
que devuelve `i18n.resolvedLanguage`, que es lo que compara el selector de idioma.

`<html lang>` se sincroniza en `i18n.ts:33` con el evento `languageChanged` y una vez al arrancar;
por eso el `lang="es"` de `index.html` es solo el valor inicial, no la verdad.

## Los mensajes de error de la API

`auth.errors.*` cubre los 12 `meta.code` del contrato (`harness/04_contrato_api_auth.md` §5) más
`network` (fallo sin respuesta, `ApiError.status === 0`) y `unknown`. `auth.validation.*` son los
mensajes de los schemas Zod: el schema guarda **la clave**, y el componente la pasa por `t()`.

Ojo con `meta.fields`: el backend manda ahí **claves de i18n** ya montadas
(`"email": "auth.errors.email_invalid"`). No se pueden pasar a `t()` tal cual porque las claves
son tipadas; la feature que las pinte necesita un mapa explícito de clave-del-backend → clave-tipada.
