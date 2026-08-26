# Arquitectura — Arxatec Lawyer Platform (frontend)

> **Para qué sirve este documento.** Es la referencia de arquitectura del frontend de
> Arxatec, escrita para que una IA (o una persona) pueda **replicar estos patrones en un
> proyecto nuevo** sin que haya que explicarlos otra vez. No es un tutorial de React: es el
> conjunto de decisiones, convenciones e invariantes que hacen que este código sea
> consistente, y el porqué de cada una.
>
> Repo descrito: `arxatec-lawyer-platform`. Su gemelo backend está en
> [`README-SERVICE.md`](./README-SERVICE.md).

---

## 1. Qué es

SPA modular para el escritorio del abogado: casos, contactos, calendario, tareas,
documentos, finanzas, chat interno, herramientas de PDF/IA y un asistente jurídico.
Se despliega como **web**, como **PWA instalable** y como **app de escritorio (Electron)**
desde el mismo código fuente.

Habla con un único backend (`arxatec-lawyer-service`) por **REST + Socket.IO**. No hay SSR,
no hay BFF: el navegador llama directo a la API.

---

## 2. Stack

| Capa | Elección | Nota |
| --- | --- | --- |
| Framework | React 19 + TypeScript strict | |
| Bundler | Vite 7 + `@vitejs/plugin-react-swc` | SWC, no Babel |
| Routing | `react-router-dom` v6 (`createBrowserRouter`) | rutas como datos, no como JSX |
| Estado remoto | `@tanstack/react-query` v5 | **toda** llamada a API pasa por aquí |
| HTTP | `axios` (instancia única con interceptores) | nunca `fetch` suelto |
| Estado global | `zustand` | mínimo: usuario y workspace |
| Formularios | `react-hook-form` + `zod` (`@hookform/resolvers/zod`) | |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) + `clsx` + `tailwind-merge` | |
| UI | `arxatec-ui` (design system propio, sobre Radix) + `lucide-react` | |
| Notificaciones | `sonner` | |
| Tiempo real | `socket.io-client` (singleton) | |
| i18n | `i18next` + `react-i18next` (es/en/pt) | claves **tipadas** |
| Editor rico | TipTap 3 | compartido entre chat y tareas |
| Tests | Vitest + Testing Library; Playwright para E2E | |
| Escritorio | Electron + `electron-builder` + `electron-updater` | configs Vite separadas |
| PWA | `vite-plugin-pwa` (Workbox) | |

**Alias único:** `@` → `./src` (declarado en `vite.config.ts` y `tsconfig`).

---

## 3. Estructura de carpetas

```text
src/
├─ main.tsx                 # entry: <Core><RouterProvider/></Core>
├─ components/
│  ├─ guards/               # Auth, Guest — deciden si se entra a un árbol de rutas
│  ├─ layout/               # Core (providers) + un layout por sección (sidebar, case, chat…)
│  ├─ shared/               # componentes de dominio reutilizados entre módulos
│  └─ ui/                   # átomos propios que NO están en el design system
├─ config/
│  ├─ env/                  # única lectura de import.meta.env.*
│  └─ whats_new/            # datos de la app (changelog in-app)
├─ constants/               # local_storage, session_storage, códigos de plan…
├─ hooks/                   # hooks transversales (use_auth, use_workspace, use_media_query…)
├─ interceptors/            # axiosInstance + axiosPublicInstance (LA capa HTTP)
├─ locales/                 # i18n: namespaces, resources, es/ en/ pt/
├─ modules/<dominio>/       # el 90% del código: features de negocio
├─ pwa/                     # recuperación de errores de preload del service worker
├─ routes/                  # routes.ts (fuente única) + árboles por grupo + lazy.ts
├─ services/                # servicios transversales (socket, analytics, user, workspace)
├─ store/                   # zustand: user, workspace
├─ styles/                  # CSS global y tokens de tema
├─ types/                   # contratos de dominio compartidos + Response<T>
├─ utilities/               # helpers puros (cn, fechas, markdown, colores, query client…)
└─ __tests__/               # espejo de src/ + setup, mocks, fixtures, e2e, TODO
```

### Convención de nombres (estricta)

- **Carpetas y archivos: `snake_case`.** `view_cases/`, `use_auth/`, `case_team/`.
- **Un directorio por unidad, con `index.ts(x)` dentro.** Se importa la carpeta, no el archivo.
- **Componentes React: `PascalCase`** dentro del archivo; **hooks: `useCamelCase`**.
- **Las páginas se exportan por defecto** (`export default`) desde `<feature>/pages/index.tsx`
  — es lo que exige el helper de carga diferida.
- Todo lo demás se exporta **con nombre**, nunca por defecto.

---

## 4. Anatomía de un módulo

El código de negocio vive en `src/modules/<dominio>/features/<feature>/`. Un dominio agrupa
features; una feature es **una pantalla o un flujo completo**.

```text
src/modules/cases/                      # dominio
├─ components/                          # compartido entre features del dominio
│  └─ judicial_tracking/{components,constants,forms,i18n}
├─ hooks/                               # hooks del dominio (use_case_params…)
├─ utils/
└─ features/
   ├─ view_cases/                       # feature = pantalla
   │  ├─ components/                    # UI propia de la feature
   │  ├─ hooks/                         # useQuery/useMutation de la feature
   │  ├─ pages/index.tsx                # export default — la página
   │  ├─ schemas/                       # zod
   │  ├─ services/index.ts              # llamadas HTTP
   │  ├─ types/                         # request/response de la feature
   │  ├─ i18n/                          # claves de la feature (o en locales/<lang>/<ns>.json)
   │  ├─ utils/
   │  └─ docs/                          # el porqué
   ├─ create_case/
   ├─ update_case/
   └─ view_case/
```

**Regla de colocación (la misma que en el backend):**

1. Se usa en **una** feature → vive en esa feature.
2. Se usa en **varias features del mismo dominio** → sube a `modules/<dominio>/{components,hooks,utils}`.
3. **Cruza dominios** → sube a `src/components/shared`, `src/hooks`, `src/utilities` o `src/types`,
   y solo si es genuinamente transversal.

Nunca importes desde el interior de otra feature (`modules/x/features/y/services`). Si hace
falta, se sube al nivel del dominio primero.

Los módulos grandes añaden carpetas especializadas (el ejemplo canónico es `chat/`):

| Carpeta | Qué contiene |
| --- | --- |
| `keys/` | **factory de query keys** del módulo (ver §6) |
| `realtime/` | nombres de eventos de socket + tipos de payload |
| `adapters/` | traducción API → UI (ver §9) |
| `policy/` | reglas de permisos puras, sin React |
| `types/` | `Api*` (lo que manda el backend) y `*UI` (lo que consume la UI) |

---

## 5. La capa HTTP

**Hay exactamente dos instancias de axios y nadie crea una tercera.**

```ts
// src/interceptors/index.ts
export const axiosInstance = axios.create({ baseURL: API_URL });        // autenticada
export const axiosPublicInstance = axios.create({ baseURL: API_URL });  // sin token
```

Lo que hacen los interceptores, y por qué importa:

1. **Request:** inyecta `Authorization: Bearer <token>` leyendo `localStorage` **en cada
   petición** (no al arrancar: así un login/logout no obliga a recargar).
2. **Response 401:** borra token, usuario y estado de workspace, y redirige a login —
   **una sola vez** y solo si había token. Es el único sitio del código que cierra sesión.
3. **Response error:** normaliza cualquier fallo a un `ApiError` (`Error` + `status` +
   `plan_limit_code`) leyendo `response.data.description`. Incluye el caso raro pero real de
   un error devuelto como `Blob` (descargas): se parsea el texto antes de rendirse.

**El sobre de respuesta del backend es fijo** y está tipado en `src/types/services`:

```ts
interface Response<T = void> {
  status: number; message: string; description: string;
  timestamp: string; path: string;
  data?: T; meta?: { code?: string };
}
```

Por eso **los servicios devuelven `data.data`**, nunca la respuesta de axios:

```ts
// modules/<d>/features/<f>/services/index.ts
import { axiosInstance } from "@/interceptors";
import type { Response, Case } from "@/types";

export async function getCases(workspaceId: string): Promise<Case[]> {
  const { data } = await axiosInstance.get<Response<Case[]>>(`/${workspaceId}/cases/manage`);
  return data.data ?? [];
}

export async function archiveCase(workspaceId: string, caseId: string): Promise<void> {
  await axiosInstance.patch(`/${workspaceId}/cases/manage/archive/${caseId}`);
}
```

Reglas duras:

- Un servicio **no** conoce React: ni hooks, ni estado, ni toasts. Solo `axiosInstance` in,
  dominio out.
- **Todas las rutas del área privada empiezan por `/${workspaceId}/`** — el backend valida
  pertenencia al workspace en cada endpoint.
- Nada de `fetch` directo, nada de clientes HTTP alternativos, nada de saltarse el interceptor.

---

## 6. React Query: la única forma de hablar con el servidor

**Prohibido llamar a la API dentro de un `useEffect`.** Lecturas con `useQuery`, escrituras
con `useMutation`. Sin excepciones.

### Defaults del cliente (`src/utilities/query`)

Se apartan de los de fábrica en tres puntos, cada uno por un problema real medido:

| Opción | Valor | Por qué |
| --- | --- | --- |
| `staleTime` | `30_000` | con `0`, navegar entre pantallas que comparten `queryKey` disparaba una petición por montaje |
| `refetchOnWindowFocus` | `false` | con ~183 queries, volver a la pestaña recargaba todo lo montado a la vez |
| `retry` | 2 intentos, **nunca en 4xx** | un 404/403/límite-de-plan no se arregla reintentando, y tras un 401 el interceptor ya borró el token |

Donde se necesita frescura continua se pone `refetchInterval` **explícito** (notificaciones,
presencia, resúmenes en generación). Cualquier hook puede sobreescribir los defaults.

### Query keys: factory por módulo

En módulos con muchas queries, las keys **no se escriben a mano**; viven en `keys/index.ts`:

```ts
// modules/chat/keys/index.ts
export const chatKeys = {
  channels: (workspaceId: string) => ["chat-channels", workspaceId] as const,
  messages: (workspaceId: string, channelId: string) =>
    ["chat-messages", workspaceId, channelId] as const,
  thread: (workspaceId: string, messageId: string) =>
    ["chat-thread", workspaceId, messageId] as const,
};
```

Ventaja: invalidar desde un handler de socket o desde otra feature deja de ser adivinar
strings. **Toda key lleva el `workspaceId`**: al cambiar de workspace, la caché no se mezcla.

### Patrón de hook de mutación

```ts
export function useArchiveCase() {
  const queryClient = useQueryClient();
  const { workspaceId } = useCaseParams();

  return useMutation({
    mutationFn: (caseId: string) => {
      if (!workspaceId) return Promise.reject(new Error("Sin workspace"));
      return archiveCase(workspaceId, caseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });
}
```

El componente decide el feedback (`toast.success` / `toast.error`), el hook decide la
invalidación. No al revés.

---

## 7. Estado global: lo mínimo

`zustand` con dos stores, ambos triviales a propósito:

```ts
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  deleteUser: () => set({ user: null }),
}));
```

**Lo que NO va en zustand:** nada que venga del servidor. Eso es React Query. El store es
solo el espejo en memoria del usuario y el workspace activo, que también viven en
`localStorage` para sobrevivir a un refresco.

**Las claves de `localStorage` están centralizadas** en `src/constants/local_storage`
(`TOKEN_AUTH`, `USER_AUTH`, `WORKSPACE_AUTH`, `ONBOARDING_COMPLETED`, `THEME_MODE`,
`LANGUAGE`…). Escribir un string a mano contra `localStorage` es un bug esperando.

---

## 8. Routing

### `src/routes/routes.ts` es la fuente única

Un objeto `ROUTES` agrupado en `Auth` / `Lawyer` / `Public` / `Error`, más
`ROUTE_PARAM_NAMES` con los nombres de parámetro, más `RouteHelpers`.

```ts
export const ROUTE_PARAM_NAMES = { workspaceId: "workspace_id", caseId: "case_id", /* … */ } as const;

export const ROUTES = {
  Auth: { Login: "/ingresar", Register: "/registrarse", OAuthCallback: "/oauth/callback" },
  Lawyer: {
    ViewCases: "/:workspace_id/casos",
    ViewCase: `/:workspace_id/casos/:${ROUTE_PARAM_NAMES.caseId}`,
    // …
  },
} as const;

export const RouteHelpers = {
  viewCases: (workspaceId: string) =>
    generatePath(ROUTES.Lawyer.ViewCases, { workspace_id: workspaceId }),
};
```

**Invariantes:**

1. **Nunca escribas un path a mano.** Usa `RouteHelpers`: envuelve `generatePath` y **exige**
   el `workspace_id`, así que olvidarlo es un error de tipos en compilación en vez de un 404
   en producción. Esta regla existe porque un `.md` de este repo llegó a documentar 21 rutas
   de las que solo una existía: `navigate("/cases")` compila, pasa el lint, pasa los tests y
   en runtime cae en el catch-all de error. **Ningún gate lo detecta.**
2. **Los paths están en el idioma del producto** (español: `/casos`, `/contactos`,
   `/calendario`). Única excepción: `/oauth/callback`, que lo fija el proveedor.
3. **Casi todo cuelga de `/:workspace_id/`.** Excepciones deliberadas: onboarding y billing.
4. **Orden estático antes que dinámico, y romperlo rompe la app en silencio:**
   `tareas/todas` tiene que ganar a `tareas/:space_id`.

### Árbol de rutas y carga diferida

```
main.tsx → <Core>            providers globales (§10)
  └ RouterProvider
     └ AnalyticsProvider     errorElement + HydrateFallback
        ├ authRoutes         <Guest>  → login, registro, recuperación
        ├ appRoutes          <Auth>   → guard + onboarding + layout sidebar → lawyerRoutes
        ├ errorRoutes
        └ publicRoutes       enlaces compartidos, perfiles públicos
```

Todas las páginas y los layouts de sección se cargan con `lazy`:

```ts
// src/routes/lazy.ts
export const lazyPage =
  (loader: () => Promise<{ default: ComponentType }>) => async () => ({
    Component: (await loader()).default,
  });

// uso
{ path: ROUTES.Lawyer.ViewCases, lazy: lazyPage(() => import("@/modules/cases/features/view_cases/pages")) }
```

Solo quedan **eager**: los guards, el provider de analítica, la página de error y `Core`.

### Guards

`<Auth>` concentra toda la lógica de acceso, en este orden:

1. sin token → limpia storage y `<Navigate to={Login} />`;
2. cargando perfil o workspace → splash;
3. workspace inexistente → página de error específica;
4. falta onboarding/demo → redirige al paso pendiente;
5. la URL no lleva workspace → **reescribe el path** insertando el workspace activo;
6. todo OK → `<Outlet />`.

Es el patrón clave del multi-tenant en cliente: **la URL siempre acaba llevando el
workspace**, y el guard es el único sitio que lo garantiza.

---

## 9. Adaptadores API → UI

El backend habla `snake_case` y devuelve estructuras planas; la UI quiere `camelCase` y
estructuras cómodas. La traducción vive en **un solo sitio por módulo**: `adapters/`.

```ts
// modules/chat/adapters/index.ts
export function toMemberUI(member: ApiChatMember): ChatMemberUI {
  return {
    id: member.user_id,
    name: `${member.first_name} ${member.last_name}`.trim(),
    profileImage: member.profile_image,
    role: member.role,
  };
}
```

Con dos familias de tipos declaradas aparte: `Api*` (el contrato del backend, tal cual) y
`*UI` (lo que consumen los componentes). Cuando el backend cambia un campo, **solo se toca
el adaptador**; ningún componente se entera.

Complemento: `policy/` para permisos, funciones puras sin React:

```ts
export function canManageChannelMembers(
  channel: ChatChannelUI, authUserId: string | undefined, role: WorkspaceRole | undefined,
): boolean { /* … */ }
```

Así el mismo criterio se usa en el menú, en el botón y en el test, y se puede testear sin
montar nada.

---

## 10. Providers globales (`components/layout/core`)

Un solo componente monta todo lo que la app necesita siempre:

```tsx
<I18nextProvider i18n={i18n}>
  <QueryClientProvider client={queryClient}>   {/* creado con useState(() => …) */}
    <CoreThemeBootstrap>{children}</CoreThemeBootstrap>
    <Toaster visibleToasts={1} />
    <OfflineBanner />
    <MigratePlanDialog />
    <PwaReloadPrompt />
    <DesktopUpdatePrompt />
  </QueryClientProvider>
</I18nextProvider>
```

`CoreThemeBootstrap` aplica las preferencias visuales del usuario mediante hooks que escriben
atributos/variables CSS en `<html>`: `useDarkmode`, `useFont`, `useFontSize`, `useRadius`,
`useThemeColor`. El patrón es siempre el mismo: **una variable CSS o un `data-*` en la raíz**,
y el CSS reacciona; nada de recalcular estilos en JS.

> Gotcha real: si el CSS del design system se carga **después** que el tuyo, los overrides
> necesitan más especificidad (`html:root[data-theme-color="…"]`) o no aplican.

---

## 11. i18n

Tres idiomas (`es`, `en`, `pt`), **`es` es la fuente de la verdad**.

```text
src/locales/
├─ i18n.ts          # init: LanguageDetector → localStorage → navigator → htmlTag
├─ namespaces.ts    # NS: la constante de namespaces
├─ resources.ts     # importa los JSON y arma `resources` (de aquí sale el TIPO)
└─ es/ en/ pt/      # un JSON por namespace
```

Dos reglas que sí o sí se replican:

1. **Namespaces por constante, nunca por string:**

   ```ts
   import { NS } from "@/locales";
   const { t } = useTranslation(NS.cases);   // no useTranslation("cases")
   ```

   Un typo deja de compilar, hay autocompletado, y renombrar es un solo cambio.

2. **Las claves están tipadas desde los JSON.** `src/types/i18next.d.ts` declara
   `CustomTypeOptions` con la forma de `resources`, así que `t("list.title")` autocompleta y
   una clave inexistente es error de TypeScript. Corolario: **no existen claves dinámicas**
   (`t(variable)` no compila) — se resuelve con un mapa explícito de variante → clave.

Convención de organización: **un namespace por módulo grande**, y dentro del JSON una
sección `shared` (átomos del módulo) más una sección por feature.

Extras: `<html lang>` se sincroniza con el idioma activo; las variantes regionales
(`es-MX`) resuelven al idioma base; sin Suspense, porque los recursos van empaquetados.

---

## 12. Tiempo real

Un **singleton** de Socket.IO, y el token se re-evalúa en cada (re)conexión:

```ts
export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  auth: (cb) => cb({ token: localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_AUTH) ?? undefined }),
});
```

Los nombres de evento y sus payloads se declaran por módulo en `realtime/events.ts`, en dos
grupos: los que **emite el servidor** y los que **emite el cliente**.

```ts
export const CHAT_EVENTS = { NEW_MESSAGE: "CHAT_NEW_MESSAGE", TYPING: "CHAT_TYPING" } as const;
export const CHAT_CLIENT_EVENTS = { JOIN_CHANNEL: "join_chat_channel" } as const;
```

**El patrón de consumo:** un hook se suscribe al montar, se desuscribe al desmontar, y ante
un evento **no muta la caché a mano salvo que el payload traiga la entidad completa** —
invalida la query key correspondiente y deja que React Query recargue. Es más lento en
teoría y muchísimo menos frágil en la práctica.

> Gotcha de verificación: con la pestaña oculta el navegador no ejecuta `requestAnimationFrame`
> ni transiciones CSS. Medir animaciones o "esperar a que se pinte" en una pestaña en segundo
> plano da resultados falsos.

---

## 13. Formularios

`react-hook-form` + `zod` mediante `zodResolver`. El schema vive en `<feature>/schemas/` y
**el tipo del formulario se deriva del schema**, nunca se escribe dos veces:

```ts
export const createCaseSchema = z.object({
  title: z.string().min(1, "cases.create.errors.title_required"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});
export type CreateCaseForm = z.infer<typeof createCaseSchema>;
```

Los mensajes de error se guardan como **claves de i18n**, no como texto: el componente las
pasa por `t()` al pintarlas. Así un schema sirve para los tres idiomas.

---

## 14. Rendimiento: code splitting

El arranque llegó a cargar **un único chunk de ~11 MB**. Hoy son ~3 MB (~911 KB gzip) y cada
feature se descarga bajo demanda. Cuatro reglas que lo sostienen:

1. **Toda ruta y todo layout de sección van por `lazyPage(() => import("…"))`** con string
   literal (Vite necesita el literal para crear el chunk).
2. **Ningún barril en el grafo eager.** Importar `@/modules` o `@/components/layout` (barriles
   que reexportan todo) arrastra la app entera a un chunk. El router y `main.tsx` importan
   **por subruta directa**.
3. **Vigila las fugas de dependencias pesadas por los barriles.** Caso real: `@/utilities`
   reexportaba `./tiptap`, `./image` y `./documents`, y como `@/utilities` se importa en todos
   lados por `cn`, filtraba TipTap y compañía al chunk compartido. Solución: sacarlos del
   barril e `import()` dinámico dentro de la función que los usa.
4. **`manualChunks` para el core de React** (`react`, `react-dom`, `react-router`, `scheduler`)
   → chunk estable y cacheable entre deploys.

---

## 15. PWA y el bug de la pantalla en blanco

Configuración: `vite-plugin-pwa` con `registerType: "autoUpdate"`, `injectRegister: false`
(el registro lo hace `useRegisterSW` en `PwaReloadPrompt`, para no registrar dos veces) y
`skipWaiting: true` **declarado a mano** — con `injectRegister: false` el plugin no lo deriva
solo, y sin él el SW nuevo se quedaría esperando.

`runtimeCaching`: JS/CSS propios con hash → `CacheFirst` (inmutables); imágenes estáticas
propias → `CacheFirst`. **Nunca se cachea la API ni el socket.**

### Los dos guardarraíles que hay que copiar

1. **`cacheWillUpdate` que rechaza HTML donde se espera JS.** Un `/assets/*.js` que un deploy
   borró **no** da 404 si el servidor tiene fallback SPA: devuelve `index.html` con 200 y
   `text/html`. Sin el guard, Workbox guarda ese HTML bajo la URL del script y el fallo
   **sobrevive a cada recarga**.

   ```ts
   cacheWillUpdate: async ({ response }) =>
     /javascript|text\/css/.test(response.headers.get("content-type") ?? "") ? response : null,
   ```

2. **Regla de servidor: `/assets/` nunca cae al fallback de la SPA.** Si el archivo no existe,
   404. Comprobación de diez segundos:

   ```bash
   curl -sI https://tu-dominio/assets/no-existe.js | head -3   # debe ser 404
   ```

El síntoma de no tener ninguna de las dos es *"Failed to load module script: expected a
JavaScript-or-Wasm module script but the server responded with a MIME type of text/html"* —
pantalla en blanco tras cada deploy, solo para quien ya había visitado la web, y **imposible
de reproducir en local porque en `dev` el SW está desactivado**.

Además, `installPreloadErrorRecovery()` corre antes del render y captura los fallos de
preload de chunks para forzar una recarga limpia en vez de dejar la app muerta.

---

## 16. Escritorio (Electron)

Mismo código, tres configs de Vite: `vite.config.ts` (web), `vite.config.desktop.ts`
(renderer de escritorio) y `vite.config.electron.ts` (proceso `main` y `preload`). El código
de Electron vive en `electron/` (`main.ts`, `preload.ts`, `updater.ts`, `constants.ts`) y se
tipa aparte con `tsconfig.desktop.json`.

El renderer detecta el entorno y activa lo específico (panel lateral, prompt de
actualización). Regla: **el código de negocio no sabe que existe Electron**; lo saben un hook
y un par de componentes.

---

## 17. Testing

```text
src/__tests__/
├─ setup.ts                       # setup global de Vitest (mocks del design system, polyfills)
├─ utils/render_with_providers.tsx
├─ mocks/{fixtures.ts,interceptors.ts}
├─ e2e/                           # Playwright (*.e2e.spec.ts)
├─ TODO/                          # backlog de testing en .md (Vitest no lo recoge)
└─ <espejo de src/…>              # los tests reales
```

- **Los tests espejan `src/`**, y hay un script (`pnpm test:mirror`) que lo verifica.
- **`renderWithProviders`** envuelve en `QueryClientProvider` + `MemoryRouter` y **resetea los
  stores de zustand**, para que ningún test herede estado del anterior.
- **Fixtures tipadas con `overrides`**: `makeUser({ onboarding_completed: false })`.
- **La capa HTTP se mockea por su path exacto** (`vi.mock("@/interceptors", …)`), declarado en
  el propio archivo de test porque Vitest hoistea los `vi.mock`.
- Solo `*.test.*` / `*.spec.*` son suites: `setup.ts`, `utils/**` y `mocks/**` están excluidos
  explícitamente del glob, o se recogerían como tests vacíos.
- **Cobertura por lista de inclusión, no global**: se miden las áreas que sí tienen tests
  (umbrales 80% statements/branches/lines, 75% functions) y se van ampliando. Los árboles de
  rutas y los barriles de solo-tipos quedan fuera: son territorio de E2E.

---

## 18. Comandos

```bash
pnpm dev                 # Vite dev server (sin service worker)
pnpm build               # tsc -b && vite build
pnpm lint                # ESLint
pnpm test:unit           # Vitest
pnpm test:unit:coverage
pnpm test:mirror         # guardrail espejo tests ↔ código
pnpm test:e2e            # Playwright
pnpm format:check

pnpm desktop:dev         # Electron en desarrollo
pnpm desktop:dist        # empaquetado con electron-builder
```

Variables de entorno: **solo prefijo `VITE_`**, leídas **exclusivamente** desde
`src/config/env`. Hoy son dos: `VITE_API_URL` y `VITE_SOCKET_URL`. Se sustituyen en tiempo de
build, así que cambiarlas exige reconstruir, y **nunca se pone un secreto ahí** (el bundle es
público).

---

## 19. Receta: feature nueva de cero

1. **Carpeta:** `src/modules/<dominio>/features/<feature>/{components,pages,schemas,services,types,hooks}`.
2. **Tipos:** el contrato de request/response en `types/` (respetando el `snake_case` del backend).
3. **Schemas:** validación con `zod` en `schemas/`; el tipo del form sale de `z.infer`.
4. **Servicios:** funciones con `axiosInstance` que devuelven `data.data`. Sin React dentro.
5. **Hooks:** `useQuery` / `useMutation` envolviendo los servicios; invalidaciones en `onSuccess`.
6. **UI:** componentes en `components/`, reutilizando `arxatec-ui`; estados de carga, error y vacío.
7. **Página:** `pages/index.tsx` con `export default`.
8. **Ruta:** dar de alta el path en `ROUTES` + su helper en `RouteHelpers`, y registrarla en el
   árbol correspondiente con `lazyPage`.
9. **i18n:** claves en los **tres** JSON (`es`/`en`/`pt`) y namespace vía `NS.x`.
10. **Feedback:** `sonner` para éxito/error.
11. **Tests:** unitarios de servicios y componentes; E2E si el flujo es crítico.
12. **Gates:** `pnpm lint && pnpm build && pnpm test:unit`.

---

## 20. Do / Don't

**Do**

- `axiosInstance` + React Query para toda interacción con la API.
- `RouteHelpers` para cualquier navegación.
- `NS.x` para namespaces y claves de i18n tipadas en los tres idiomas.
- Tipos y schemas **cerca de la feature** que los usa.
- Factory de query keys en módulos con muchas queries.
- Adaptadores `Api* → *UI` en un único punto por módulo.
- Constantes centralizadas para `localStorage` / `sessionStorage`.

**Don't**

- `fetch` directo, instancia de axios propia o saltarse el interceptor.
- Llamar a la API desde `useEffect`.
- `any`, `@ts-ignore` o casts para callar al compilador.
- Escribir un path de ruta a mano.
- Importar barriles pesados en el grafo eager (rompe el code splitting en silencio).
- Meter datos del servidor en zustand.
- Importar desde el interior de otra feature.
- Loguear secretos o datos sensibles.

---

## 21. La regla que gobierna la documentación

**Nunca asumas que la documentación está actualizada — incluido este archivo.** Un `.md`
describe el código del momento en que alguien lo escribió; el código siguió. Antes de apoyar
una decisión en algo documentado (una ruta, un `archivo:línea`, un número, un "ya está hecho"),
**compruébalo contra el código**. Si falla, corregirlo es parte del trabajo en curso, no un
ticket para después.

No es paranoia: la sección de rutas de este repo llegó a listar 21 rutas de las que solo una
existía, y ningún gate lo detectaba.

**Corolario para agentes: la salida de una sesión anterior es evidencia, no verdad.** Cítala,
reverifícala, y anota el resultado de la reverificación.

Por eso el repo separa dos cosas que suelen mezclarse:

| Tipo | Dónde | Qué se hace con ello |
| --- | --- | --- |
| **Documentación viva** (`docs/ARCHITECTURE.md`, `ENV.md`, `TESTING.md`, `I18N.md`, `PWA.md`…) | `docs/` | **se reescribe** cuando el sistema cambia |
| **Registro de sesión** (auditorías, hallazgos, decisiones) | `docs/registro/<YYYY-MM-DD>/<TEMA>.md` | **se acumula**, nunca se reescribe |

Cuatro reglas del registro:

1. Documento nuevo = **carpeta nueva** con la fecha de creación, leída del sistema con
   `date +%F` — nunca de memoria (dos días de desfase acabaron arrastrados a 47 archivos).
2. Cambio sobre un registro existente = fila nueva en su *Registro de cambios*, **en su
   carpeta**. No se abre carpeta nueva para actualizar algo que ya existe.
3. **Cabecera obligatoria** con fecha, commit verificado y método. Sin commit, un registro es
   una opinión. Si el hallazgo toca el contrato con el backend, se declaran **los dos** commits.
4. Añadir un registro incluye **añadir su fila al índice** en la misma sesión.
