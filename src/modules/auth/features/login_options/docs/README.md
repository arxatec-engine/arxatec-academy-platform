# Opciones de acceso

Ruta pública `/ingresar`, bajo `Guest` y `AuthLayout`. La página compone `LoginOptions`, con
el título traducido mediante `useTitle`. Sigue la disposición de `login_options` de Lawyer:
el contenedor del layout, logo `w-24`, panel con `mt-4` sin sombra, encabezado alineado a la
izquierda, título `text-base`, bloques separados por `gap-6`, correo
como primera acción principal y proveedores debajo con botones outline de tamaño `sm`.
Los textos propios y de Google coinciden con Lawyer en ES/EN/PT. Microsoft y Apple muestran
«Próximamente disponible» al pulsarlos; la marca y las rutas corresponden a Academy.

- Google inicia el flujo OAuth existente mediante `startGoogleAuthorize`.
- Correo electrónico abre `/ingresar/correo`; desde allí se puede iniciar sesión o crear una cuenta.
- Microsoft y Apple muestran el aviso «Próximamente disponible» al pulsarlos. No llaman a endpoints.
- El formulario por correo ofrece el enlace a `/crear-cuenta`, que pide nombre, correo y contraseña.

`PolicyConsent` muestra una casilla marcada por defecto y el texto de aceptación de privacidad
y términos de Academy, enlazados a las páginas públicas `/privacidad` y `/terminos` en otra pestaña. Al desmarcarla se deshabilitan
los cuatro botones, igual que en Lawyer. Al aceptarla otra vez se habilitan; Microsoft y Apple
solo muestran el aviso de próxima disponibilidad.
Los enlaces legales siguen disponibles y abren otra pestaña. El texto está traducido en ES/EN/PT.
El consentimiento permanece en estado local mientras se muestra la selección.

`AuthLayout` ejecuta `useAuthReturnPath` para conservar un `redirect_to` interno válido durante
la navegación y el acceso de Google. Los destinos externos se descartan.

Las pruebas de la página verifican opciones, disponibilidad, navegación, inicio de Google,
destinos de retorno, bloqueo y reactivación por consentimiento, enlaces legales y traducciones
a español, inglés y portugués. El árbol real recorre opciones, correo y registro simplificado.
