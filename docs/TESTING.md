# Verificación

Los scripts disponibles están definidos en `package.json`. Desde la raíz del proyecto:

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
```

`typecheck` ejecuta `tsc -b --noEmit`; `build` ejecuta `tsc -b && vite build`. Las pruebas usan Vitest, Testing Library y jsdom. Los tests de interfaz no sustituyen la comprobación manual de navegación, estilos y comportamiento en navegador real.

## Cobertura presente

`src/__tests__/` sigue los módulos y responsabilidades de la aplicación. El código actual incluye pruebas para:

- guards de invitado, sesión y rol; sesión, token, retorno después de auth, logout e interceptores.
- esquemas, servicios y pantallas de registro, login, OAuth Google, recuperación/restablecimiento de contraseña y verificación de correo.
- árbol y enrutamiento, selector de idiomas y paridad de claves de traducción.
- catálogo y búsqueda, contratos de servicios, vistas y estados de lección.
- consultas/mutaciones de progreso, comentarios, solicitudes de interés, perfil y herramientas de administración.

El listado real de suites se consulta con `rg --files src/__tests__`. La existencia de pruebas unitarias no confirma la conexión a un backend real, el flujo OAuth desplegado ni la presentación en todos los navegadores.

## Recorrido manual

Al modificar una pantalla o flujo de cuenta, recorre las rutas involucradas con la API local configurada en `.env`. Revisa catálogo, ficha, una muestra pública, una lección bloqueada, registro/login y su retorno, Mis cursos y Perfil según el cambio. Comprueba los estados de carga, error y vacío, los tres idiomas, temas claro/oscuro, teclado y una ventana móvil. Para cambios de contenido administrativo, entra con un usuario de rol `ADMIN` y verifica que una cuenta de estudiante no pueda usar esas rutas.

Los cambios de auth requieren además revisar sesión recordada y de pestaña, recarga, salida, correo no verificado, correo verificado, error de red y retorno desde un enlace protegido. Los cambios de API requieren confirmar el sobre y la autorización también en el backend.

## Splash de carga

`routes/lazy.test.tsx` comprueba que el splash existe antes de descargar JavaScript
y permanece mediante `RouteFallback` mientras se resuelve una página diferida. Las pruebas de
`loading_screen` verifican que las cargas de contenido y de sesión usan `Skeleton`, sin isotipo,
y conservan un único anuncio accesible traducido.
En desarrollo, abre `/?preview=splash` para revisar el isotipo de 2 rem, su brillo
diagonal, los temas claro/oscuro y la ausencia de texto visible, igual que Admin.

## Ajustes en el perfil

Las pruebas del árbol real verifican que la cabecera no ofrece ajustes, con ni sin sesión;
que Mi cuenta abre el perfil con los datos personales y los selectores de idioma y tema;
que los ajustes se aplican y persisten en el navegador; y que una visita sin sesión a
`/perfil` redirige al acceso. La ruta independiente de ajustes ya no existe. La paridad
de claves cubre español, inglés y portugués.
