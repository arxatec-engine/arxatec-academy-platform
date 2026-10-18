# Arquitectura del frontend

## Producto y estructura

Academy es una SPA de React 19 y TypeScript estricto. Presenta cursos gratuitos de legal tech, lecciones en video o artículo, progreso del estudiante, comentarios y gestión de cuenta. Los cursos pueden consultarse sin sesión; las rutas privadas requieren una cuenta y el backend vuelve a comprobar cada operación.

```text
src/
├── components/{guards,layout,shared}/
├── config/env/                 # lectura central de VITE_API_URL
├── constants/                  # errores y claves del navegador
├── hooks/                      # sesión, idioma, tema y título
├── interceptors/               # axiosInstance y axiosPublicInstance
├── locales/{es,en,pt}/         # common y auth
├── modules/
│   ├── auth/                   # registro, login, Google, recuperación y correo
│   ├── catalog/features/       # catálogo, ficha de curso y lección
│   ├── progress/               # Mis cursos, inscripción y finalización
│   ├── comments/               # hilos de lecciones
│   ├── profile/                # datos, avatar, contraseña y baja
│   ├── notifications/          # avisos y propuestas de temas
│   └── admin/                  # contenido, moderación, estudiantes y avisos
├── routes/                     # rutas centralizadas y carga diferida
├── services/auth_storage/      # persistencia de sesión y retorno
├── store/{user,theme}/         # estado mínimo del navegador
├── types/                      # contratos comunes de API
└── __tests__/                  # pruebas organizadas junto al módulo
```

Los directorios opcionales aparecen conforme el módulo los necesita. Una feature agrupa sus páginas, componentes, hooks, servicios, tipos, validación y documentación. Las páginas componen la pantalla; las lecturas y escrituras remotas pasan por hooks de React Query y servicios HTTP.

## Camino de datos

```text
ruta → guardia → página → componente → hook de React Query → servicio → interceptor de Axios → API
```

`src/types/services` define el sobre `Response<T>`. Los servicios comprueban que la respuesta incluya los datos requeridos y devuelven el contenido de `data`; los adaptadores de cada módulo convierten campos del API `snake_case` al formato que presenta la interfaz. La infraestructura normaliza fallos a `ApiError`, con estado, código y descripción. No hay peticiones a la API dentro de JSX ni de `useEffect`.

`axiosInstance` adjunta el token del usuario para operaciones autenticadas. `axiosPublicInstance` no adjunta credenciales y evita que una respuesta de acceso público cierre la sesión abierta. Ambas comparten el origen `ENV.API_URL`; los servicios eligen la instancia según el endpoint y el nivel de acceso.

React Query administra respuestas remotas. Sus valores predeterminados están en `src/utilities/query`: caché de 30 segundos, sin recarga por cambio de foco y hasta dos reintentos, salvo errores de cliente. Las claves se agrupan por módulo. Las mutaciones invalidan o actualizan las consultas relacionadas.

## Sesión, roles y rutas

`src/routes/routes.ts` es la fuente única de rutas y helpers. `lazyPage` carga páginas bajo demanda. `Auth` protege Mis cursos, Perfil y la revisión de correo; `Admin` añade la comprobación de rol `ADMIN` para las herramientas de personal. Son controles de navegación, no un límite de seguridad: el servicio valida sesión, permisos, propiedad de datos y reglas de negocio.

El inicio de sesión acepta correo y contraseña, con opción de recordar la sesión. El formulario de registro solicita nombre, correo y contraseña; el registro y Google crean una sesión. El acceso con contraseña y Google comparten la navegación de la cuenta. Los flujos de verificación de correo y recuperación usan enlaces con token; el correo sin verificar permite ver cursos, pero el backend exige verificación para comentar.

El token y la vista pública del usuario se guardan en `localStorage` cuando se recuerda la sesión y en `sessionStorage` cuando dura solo la pestaña. Axios lee el token al enviar cada solicitud. No se guardan contraseñas. `redirect_to` se valida y conserva en almacenamiento de sesión para volver a la página solicitada después de autenticarse. La expiración de sesión limpia los datos y ofrece una ruta de retorno.

| Ruta                                                         | Acceso                             | Función                                                                      |
| ------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| `/`                                                          | Público                            | Catálogo con búsqueda y filtros de tema y nivel.                             |
| `/cursos/:slug`                                              | Público                            | Descripción y temario de un curso.                                           |
| `/cursos/:course_slug/lecciones/:lesson_slug`                | Público con contenido condicionado | Muestra una lección accesible o el estado bloqueado con el temario.          |
| `/ingresar`                                                  | Invitado                           | Opciones de acceso, incluido Google.                                         |
| `/ingresar/correo`, `/crear-cuenta`                          | Invitado                           | Login por correo y alta de estudiante.                                       |
| `/recuperar-contrasena`, `/restablecer-contrasena`           | Invitado/enlace                    | Recuperación y cambio de contraseña.                                         |
| `/verificar-correo`, `/revisa-tu-correo`                     | Enlace/sesión                      | Confirmación y estado del correo.                                            |
| `/oauth/callback`                                            | Flujo Google                       | Intercambio del código de un solo uso.                                       |
| `/mis-cursos`, `/perfil`                                     | Sesión                             | Aprendizaje y cuenta personal.                                               |
| `/cursos/:slug/examen`                                      | Sesión                             | Examen final de 15 preguntas para obtener el certificado.                    |
| `/admin/cursos`, `/admin/cursos/:id`, `/admin/lecciones/:id` | Rol ADMIN                          | Crear y mantener cursos y lecciones.                                         |
| `/admin/comentarios`, `/admin/usuarios`, `/admin/avisos`     | Rol ADMIN                          | Moderar comentarios, consultar estudiantes y gestionar solicitudes de aviso. |
| `/sesion-vencida` y `*`                                      | Público                            | Sesión cerrada y ruta no encontrada.                                         |

`ROUTES` y `RouteHelpers` son la referencia final si una ruta cambia. Los títulos de las páginas se traducen y se actualizan con `useTitle`, que añade ` - Arxatec Academy`.

## Experiencia de aprendizaje

El catálogo obtiene cursos publicados de `GET /courses`; búsqueda, tema y nivel se conservan en la URL y forman parte de la clave de consulta. La ficha pública presenta temario. El inicio de curso inscribe a un usuario autenticado; una persona visitante puede abrir una muestra y se le ofrece crear cuenta o entrar para continuar. `GET /courses/:course_slug/lessons/:lesson_slug` puede responder con `403 LESSON_LOCKED`; el servicio lo convierte a un estado de contenido bloqueado que conserva el contexto del curso.

Las lecciones componen video de YouTube/Vimeo, artículo HTML saneado por el backend, transcripción y recursos. Los hilos de comentarios se pueden leer públicamente; el backend limita publicación y respuesta a cuentas con correo verificado. La página Mis cursos muestra cursos en progreso y completados. Una marca de lección invalida su consulta para reflejar el cambio al volver al listado.

Completar las lecciones habilita el examen final. El certificado requiere aprobar 15 preguntas,
con 12 aciertos como mínimo inicial; administración configura las preguntas, opciones, respuesta
correcta y activación dentro del editor de cada curso. El navegador solo envía versión y
respuestas elegidas: el servicio corrige, guarda el intento y emite el certificado al aprobar.

Perfil permite editar datos personales, foto y contraseña en cuentas de contraseña, revisar un resumen y pedir la baja de cuenta. Las respuestas del servidor actualizan el usuario de sesión; la baja vacía la sesión y la caché. El backend decide las validaciones definitivas.

## Internacionalización y presentación

`i18next` ofrece español, inglés y portugués. Español es el idioma predeterminado y la preferencia se conserva en el navegador. Los recursos están divididos en los namespaces `common` y `auth`; TypeScript toma sus claves de los recursos en español y la prueba de recursos comprueba paridad entre idiomas.

La interfaz utiliza Tailwind CSS 4 y `arxatec-ui`. Tema claro, oscuro o del sistema e idioma se controlan desde Mi cuenta → Mi perfil (`/perfil`), con sesión iniciada. La cabecera no incluye estos controles. Las preferencias se conservan en este navegador. `src/index.css` importa el tema del paquete y define estilos de lectura para artículos. `vite.config.ts` adapta las familias tipográficas del CSS del paquete a la tipografía sans de Academy.

## Configuración y límites

`src/config/env` es el único punto que lee variables `import.meta.env`; `VITE_API_URL` es pública y apunta al prefijo `/api/v1`. Vite y los scripts disponibles están descritos en `package.json`. Para el arranque, las pruebas y el build consulta [Entorno](ENV.md) y [Verificación](TESTING.md).
