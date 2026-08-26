# `src/services/auth_storage` — el único módulo que toca el almacenamiento de la sesión

Existe porque tres consumidores necesitan lo mismo y ninguno debe escribir una clave a mano: el
interceptor lo lee en cada petición, el store de usuario lo escribe al iniciar sesión, y las
pantallas de retorno leen el destino guardado.

Las claves vienen todas de `src/constants/local_storage` — un string suelto contra `localStorage`
es un bug esperando (`harness/03_reglas_frontend.md` §7).

## Dos almacenamientos, no uno

El contrato (`harness/04_contrato_api_auth.md` §3) reparte el token según `remember_me`:

| `remember_me` | Dónde | Qué implica |
| --- | --- | --- |
| `true` (marcado por defecto en la pantalla 05) | `localStorage` | sobrevive a cerrar el navegador; 30 días de inactividad tolerada |
| `false` | `sessionStorage` | al cerrar la pestaña, fuera; 12 h de inactividad |

Por eso la lectura recorre los dos (`index.ts:69` vía `readFirst`) y el borrado limpia los dos
(`index.ts:90`). Escribir en uno y borrar solo del otro deja un token huérfano que resucita la
sesión en la siguiente recarga.

`writeAuthSession` (`index.ts:76`) limpia antes de escribir: sin eso, iniciar sesión sin
"mantener la sesión abierta" tras haberla iniciado con ella deja el token viejo en `localStorage` y
`readFirst` devolvería el equivocado.

## Por qué el usuario guardado se valida

`isApiUser` (`index.ts:35`) comprueba campo por campo antes de devolver nada. El contenido de
`localStorage` es entrada de usuario: lo edita quien quiera desde la consola del navegador, y
sobrevive a cambios del contrato. Confiar en un `JSON.parse` sería meter un objeto de forma
desconocida en el store y romper la primera pantalla que lea `user.full_name`. Cuando no cuadra, se
devuelve `null` y la app se comporta como si no hubiera sesión, que es el estado seguro.

Los valores de `role`, `city` y `auth_provider` se validan contra las listas de
`src/types/auth/index.ts`, que son la copia literal del contrato §2.

## El destino de retorno vive en `sessionStorage` y se valida al entrar y al salir

`writeRedirectTo` (`index.ts:100`) y `readRedirectTo` (`index.ts:95`) pasan el valor por
`sanitizeRedirectPath` (`src/utilities/redirect/index.ts:22`) en los dos sentidos. Validar solo al
escribir no basta: el valor puede haberse escrito antes de un despliegue o haberlo puesto alguien a
mano. Va en `sessionStorage` porque es un dato de un viaje concreto (contrato §7, punto 2): si
sobreviviera al cierre del navegador, el usuario acabaría aterrizando semanas después en una
lección que ya no recuerda haber pedido.

`consumeRedirectTo` (`index.ts:112`) lee y borra: el destino se usa **una vez**.
