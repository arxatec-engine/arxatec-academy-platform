# `src/__tests__` — utillaje

Los tests **espejan `src/`**. `vite.config.ts` deja fuera del glob de suites `setup.ts`, `utils/` y
`mocks/`, que son utillaje y no tests.

## `utils/render_with_providers.tsx`

`renderWithProviders(ui, options)` envuelve en `I18nextProvider` + `QueryClientProvider` +
`MemoryRouter` y **resetea los stores de zustand antes de cada render**, para que ningún test
herede el estado del anterior. `options` acepta `route`, `queryClient`, `user` y `themeMode`:
`user` y `themeMode` se aplican **después** del reset, que es la única forma de arrancar un test
con sesión abierta o con un tema fijo.

El `QueryClient` de los tests es propio y va con `retry: false` (`render_with_providers.tsx:22`):
con los dos reintentos de producción, cualquier test de error tarda segundos y a veces expira.

`createWrapper(options)` expone el mismo árbol de providers para `renderHook`.

## `mocks/`

- `fixtures/`: `buildApiUser(overrides?)` y `buildApiSession(overrides?)`, tipadas contra el
  contrato. Los `overrides` van al final del literal para que siempre ganen.
- `interceptors/`: `interceptorsModuleMock` con las dos instancias de axios en `vi.fn()`, más
  `resetInterceptorsMock()`.

La capa HTTP se mockea **por su path exacto y desde el propio archivo de test**, porque Vitest
hoistea los `vi.mock`:

```ts
vi.mock("@/interceptors", async () => {
  const module = await import("../../mocks/interceptors");
  return module.interceptorsModuleMock;
});
```

El mock reexporta el `ApiError` **real** (importado de `@/interceptors/api_error`, que es otro
módulo y no está mockeado): si fuera un doble, `isClientError` y las ramas por `code` dejarían de
probar nada.

## Dos trampas del entorno

1. **`arxatec-ui` va en `server.deps.inline`** (`vite.config.ts:20`). Sin eso Vitest externaliza el
   paquete, Node intenta cargar el `ReactCrop.css` que arrastra el barril y la suite entera cae con
   `TypeError: Unknown file extension ".css"`. No es opcional: cualquier test que toque un
   componente de la librería lo necesita.
2. **El idioma se fija en `setup.ts`**. El detector de i18next mira `navigator.language`, que en
   jsdom es inglés: sin `await i18n.changeLanguage(DEFAULT_LANGUAGE)` en el `beforeEach`, un test
   que busque "Iniciar sesión" pasa o falla según la máquina.

El `afterEach` también quita la clase `dark` de `<html>` y vacía los dos almacenamientos: el tema
se aplica sobre el documento real y jsdom lo comparte entre tests del mismo archivo.
