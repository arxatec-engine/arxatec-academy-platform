# Acceso por correo — `/ingresar/correo`

La página compone `AuthBackButton`, `Header` y `LoginForm` directamente dentro de `AuthLayout`,
siguiendo las páginas de Lawyer. El encabezado, descripciones, etiquetas, placeholders,
acciones y pie usan sus mismos textos en ES/EN/PT. El botón superior, solicitado para Academy,
enlaza a las opciones de acceso en `/ingresar`.

El formulario comparte la estructura de Lawyer: campos separados con `gap-4`, contraseña y
recuperación en un bloque `grid gap-2`, enlace de recuperación debajo a la derecha, botón
principal `size="sm"` de ancho completo y pie `mt-4` dentro del formulario. No muestra una
casilla adicional de sesión. Mantiene `rememberMe: true`, el valor predeterminado del contrato.

Los campos reutilizan `Input` y `Label` de `arxatec-ui`. `AuthField` conserva el espaciado de
`FormInput` de Lawyer y enlaza etiquetas, errores y `aria-describedby`. `PasswordField` usa el
control accesible compartido: mostrar u ocultar no cambia el valor, el foco ni el registro RHF.

`useLogin` llama al servicio de `POST /auth/login`. El formulario traduce los errores de campo,
conserva las credenciales al fallar y ofrece Google si el backend responde `ACCOUNT_USES_GOOGLE`.
Tras el éxito se guarda la sesión y se consume el destino de retorno interno, o se abre el catálogo.
Los errores de credenciales y demás fallos de la solicitud muestran un toast. Si la cuenta usa
Google, el formulario conserva el botón para entrar con ese proveedor. Las claves de validación
por campo se traducen con `useAuthMessage`.

Las pruebas cubren validación y foco, envío con Enter, payload y sesión recordada, destino de
retorno, errores de credenciales y Google, red, teclado, visibilidad de contraseña e idiomas.
La persistencia con `rememberMe: false` sigue cubierta en las pruebas del hook y del servicio.
