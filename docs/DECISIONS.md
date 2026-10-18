# Decisiones del frontend

Este documento registra decisiones observables en la implementación actual. Las decisiones que cambien un contrato deben revisarse también en `arxatec-academy-service`.

| Decisión vigente                                  | Motivo y consecuencia                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| React 19, TypeScript estricto y Vite              | SPA web con verificación de tipos en el build.                                                                                        |
| `pnpm`                                            | Gestor fijado en `packageManager`; `pnpm-lock.yaml` es el lockfile del proyecto.                                                      |
| Rutas centralizadas y carga diferida por pantalla | Paths en español y carga del código al abrir cada ruta.                                                                               |
| Dos instancias Axios                              | Una adjunta el bearer token; la pública no envía sesión ni cierra sesión por errores públicos.                                        |
| React Query para datos remotos                    | Comparte caché y limita reconsultas; el estado de UI no duplica el resultado del servidor.                                            |
| Token almacenado según “recordarme”               | `localStorage` mantiene una sesión recordada; `sessionStorage` limita la otra a la pestaña. No se guardan credenciales de contraseña. |
| Tres idiomas desde los recursos del frontend      | Español, inglés y portugués mantienen árboles de claves equivalentes.                                                                 |
| Tema y lenguaje son preferencias del navegador    | El tema puede seguir al sistema; no se sincroniza con preferencias de cuenta en el servidor.                                          |
| Academia y administración comparten una SPA       | Las herramientas bajo `/admin` requieren rol `ADMIN`; cursos y aprendizaje se mantienen en la navegación principal.                   |
| `arxatec-ui` y tipografía sans                    | Los controles, el logo Academy y los tokens mantienen el sistema visual común.                                                        |
| Catálogo y muestras públicos                      | La persona puede descubrir cursos antes de registrarse; el API resuelve qué lección está bloqueada.                                   |
| Certificados públicos por URL                     | El servidor emite y verifica; `/certificados/:id` usa Axios público y enlaza al PDF con QR del backend.                                   |

Cambiar contrato de API, acceso de cuentas o persistencia requiere revisar también `arxatec-academy-service` y el harness, no solo esta tabla.
