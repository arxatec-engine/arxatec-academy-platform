# Registro por correo — `/crear-cuenta`

La página compone `AuthBackButton`, `Header` y `RegisterForm` directamente, siguiendo la
estructura de Lawyer. El título de pestaña usa `useTitle`; encabezado, descripción, etiquetas
de correo y contraseña, placeholders, botones y pie comparten sus textos en ES/EN/PT.

Academy conserva los tres campos solicitados: nombre completo, correo y contraseña. No recoge
organización ni ciudad. El botón superior vuelve a `login_options`; el enlace del pie lleva al
formulario de acceso por correo. Los campos usan `gap-4`, botón principal `size="sm"` y pie
`mt-4` dentro del formulario, como Lawyer, sin la nota ni el hint adicionales anteriores.

Los controles vienen de `arxatec-ui`. `AuthField` reproduce el espaciado de `FormInput` y
conserva las asociaciones accesibles de etiquetas y errores. La contraseña comparte el control
accesible con inicio de sesión y perfil, incluido su placeholder y el botón de visibilidad.

`registerSchema` recorta el nombre y normaliza el correo. `toRegisterRequest` adapta `fullName`
a `full_name`. El servicio envía `POST /auth/register` con la instancia pública. `useRegister`
guarda la sesión recordada. `useRegisterForm` concentra validación, errores y navegación a
`/revisa-tu-correo`; el formulario solo presenta los campos. La respuesta indica si el primer
correo salió mediante `verification_email_sent`.

Los errores se muestran junto a cada campo; un correo existente ofrece acceso por correo.
Otros errores muestran un toast con el mensaje del fallo y conservan los datos. Las llamadas a `register`
siguen el orden visual para enfocar el primer error. Las pruebas cubren esos comportamientos,
el payload de tres campos, el teclado, la visibilidad de contraseña y los idiomas.
