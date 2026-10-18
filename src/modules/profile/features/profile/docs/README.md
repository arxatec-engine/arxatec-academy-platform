# Perfil

Ruta privada `/perfil`. La página compone `PageShell` y `ProfileContent`. La tarjeta principal guarda datos (`PATCH /me/profile`) y foto (`PUT /me/avatar`) con un único formulario. Los demás bloques ofrecen contraseña (`PATCH /me/password` solo para cuentas PASSWORD), resumen (`GET /me/summary`) y baja (`DELETE /me`). Los controles visuales son de `arxatec-ui`.

El formulario muestra el selector de imagen, el nombre completo editable y el correo de solo
lectura. Su único botón «Guardar cambios» aparece fuera de la tarjeta, en la fila inferior de
acciones, en el extremo derecho y asociado al formulario mediante el atributo `form`.
Envía únicamente `{ full_name }`, recortado, a `PATCH /me/profile`; no solicita organización,
condición de independiente ni ciudad.

El botón «Guardar cambios» aparece solo al modificar el nombre (sin contar espacios al inicio
o al final) o confirmar una foto nueva. Al restaurar los datos originales o guardar correctamente,
se oculta. Durante el envío permanece deshabilitado; si falla, conserva los cambios pendientes.
El diálogo de contraseña muestra su botón de guardado al escribir en alguno de sus campos y lo
oculta si ambos se vacían.

`services/` transporta los contratos del backend; `hooks/` actualiza `useUserStore` con el usuario completo devuelto tras cambios de perfil o foto. La baja exige escribir una palabra localizada y, para cuentas con contraseña, introducirla; el backend vuelve a validar credenciales, borra datos y responde 204. Tras éxito se limpia sesión y caché de React Query. Los formularios muestran feedback con `toast.promise`.

La foto, los datos personales y los ajustes de idioma y tema comparten una única `Card` de
`ProfileContent`. `ProfileForm` reúne el selector y los campos; `PersonalizationSettings` se
muestra a continuación dentro del mismo `CardContent`, sin otra tarjeta anidada. El resumen
aparece debajo. La fila de acciones se alinea a la derecha: el botón rojo «Eliminar cuenta»
abre un `DropdownMenu` de `arxatec-ui` y «Guardar cambios» aparece a su derecha cuando hay
cambios pendientes. `ProfileAccountActions` reúne las opciones «Cambiar contraseña» (solo para
cuentas PASSWORD) y «Eliminar cuenta». Cada opción cierra el menú y abre su `Dialog` de
`arxatec-ui`; los diálogos permanecen montados fuera del menú y al cerrar devuelven el foco al
botón que lo abre. Se conservan los campos y la
confirmación de baja; cerrar descarta lo escrito y el éxito cierra el diálogo. Si falla la
petición, permanece abierto con los datos introducidos. Durante el envío se bloquean el cierre
y el botón de envío. Los campos de contraseña reutilizan el adaptador accesible de `components/shared/`.
Todos los inputs usan `size="sm"` y un placeholder traducido; la confirmación de baja muestra
la palabra que se debe escribir en el idioma seleccionado.
`PageShell` mantiene la navegación y el ancho comunes.

Todos los títulos del perfil usan `text-base` como tamaño máximo. `AvatarForm` utiliza
`AvatarInput` de `arxatec-ui` con un solo botón «Seleccionar foto», vista previa, recorte y
validación del límite de 2 MB. La selección y el recorte preparan el archivo localmente.
Al pulsar «Guardar cambios», `useSaveProfile` ejecuta `saveProfile`: primero guarda el nombre
y, si se eligió una imagen, sube el archivo. El usuario en memoria se actualiza al completar
el guardado. Los controles permanecen bloqueados durante ambas peticiones; tras el éxito se
limpia la selección y se reinicia la vista previa. Un fallo conserva el nombre y la imagen
seleccionada para reintentar con el mismo botón.

La página declara su título traducido mediante `useTitle` de `@/hooks`; el hook añade
` - Arxatec Academy` y lo actualiza también al cambiar de idioma.

`PersonalizationSettings` vive en `features/profile/components/` y reúne los selectores
de idioma y tema dentro del perfil, entre los datos personales y la contraseña. El menú
Mi cuenta abre `/perfil`; no existe una página independiente para estos ajustes.
Los ajustes forman grupos compactos que se distribuyen en dos columnas desde `md`, sin separador
entre idioma y tema. Los títulos y las opciones usan `text-sm`. Ambos selectores reutilizan
`RadioGroup`, `RadioGroupItem`, `Button` y `Label` de `arxatec-ui`. Cada opción conserva el aspecto
de botón `outline` de tamaño `sm`, con el radio dentro y toda la superficie seleccionable.
Mantienen una sola opción activa por grupo, etiquetas asociadas y navegación con
las flechas del teclado. Las opciones pasan de línea cuando hace falta. Los idiomas muestran
sus nombres completos; los temas muestran las etiquetas Tema claro, Tema oscuro
y Tema del sistema. La opción seleccionada expone `aria-checked`.
Los cambios se aplican inmediatamente y se conservan en este navegador: idioma mediante
i18next y tema mediante `useDarkMode`/`useThemeStore`, incluido el favicon. No se sincronizan
con el backend. La cabecera no incluye controles de idioma o tema, con ni sin sesión.
