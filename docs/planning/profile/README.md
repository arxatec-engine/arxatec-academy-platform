# Perfil y cuenta

`/perfil` requiere sesión. Presenta datos personales y resumen de cursos completados y permite actualizar nombre, organización/independencia y ciudad. El usuario puede subir o retirar su avatar. Una cuenta con contraseña puede cambiarla; una cuenta Google no muestra ese formulario como una cuenta de contraseña.

El flujo de baja de cuenta solicita la confirmación de interfaz y puede pedir contraseña cuando corresponde. La mutación usa `DELETE /me`; luego limpia usuario y caché remota. La API valida la petición y aplica los efectos de datos y archivos.

Las mutaciones de perfil y avatar actualizan el usuario de la sesión con la respuesta del backend. Servicios, tipos y detalle de validación se explican en `src/modules/profile/features/profile/docs/README.md`.
