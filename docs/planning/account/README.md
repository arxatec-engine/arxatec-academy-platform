# Cuenta y acceso

El módulo `src/modules/auth` cubre opciones de acceso (`/ingresar`), login por correo (`/ingresar/correo`), registro (`/crear-cuenta`), intercambio OAuth de Google, verificación/reenvío de correo, olvido y restablecimiento de contraseña, consulta de usuario y logout. Sus pantallas son públicas o de invitado salvo los estados que consumen un token o requieren sesión.

## Registro y sesión

El formulario por correo solicita nombre completo, correo y contraseña. El schema normaliza el correo y adapta `fullName` a `full_name` para el servicio. El registro devuelve una sesión y conduce a la pantalla para revisar el correo. Google entra por `/auth/google`, vuelve con un código de un solo uso y el cliente lo canjea en `/auth/google/exchange`.

El correo sin verificar no bloquea el acceso a cursos; la API requiere correo verificado para crear o responder comentarios. El formulario de login permite recordar sesión: token/usuario se guardan en almacenamiento local o de pestaña, respectivamente. Ninguna contraseña se persiste.

`redirect_to` conserva una ruta interna solicitada durante login, alta y OAuth. `sanitizeRedirectPath` limita el destino a una ruta relativa segura. Al vencer la sesión, Axios limpia su información y redirige una vez al estado de sesión vencida.

## Reglas para cambios

Usa la instancia Axios pública para acceso, alta, OAuth exchange y acciones de token sin credenciales; la instancia autenticada se usa para `/auth/me`, logout y reenvío autenticado. Los formularios validan con Zod, convierten mensajes de API a claves de i18n y conservan los datos cuando un envío falla. Backend sigue siendo responsable de validar credenciales, tokens, tasas e identidad.

Las rutas y los tipos de sesión están definidos en `src/routes/routes.ts` y `src/types/auth`. La arquitectura compartida se detalla en [`src/modules/auth/docs/README.md`](../../../src/modules/auth/docs/README.md); el contrato de auth se mantiene con el servicio.
