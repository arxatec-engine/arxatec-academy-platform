# Contraseña compartida

Autenticación y perfil usan un único `Input` y un único `Button` de `arxatec-ui`. El botón tiene
nombre traducido, `aria-pressed`, foco visible y el mismo estado `disabled` que el campo.
El `ref`, los atributos de formulario y el valor se pasan al `Input`; mostrar u ocultar no
remonta el control ni borra lo escrito.

El tamaño predeterminado es `sm`, como el resto de campos. Se puede sobrescribir con la
propiedad `size`; no se fija la altura mediante clases. El botón de visibilidad se centra
dentro del campo y mantiene un área de 28 px, sin alterar el tamaño del input.

`arxatec-ui@0.1.68` añade un ojo sin nombre accesible cuando recibe exactamente
`type="password"`. El adaptador usa `type="Password"` para que la librería renderice su rama
de input simple, mientras el navegador conserva un campo de contraseña real. `type` es un
atributo enumerado y sus palabras clave no distinguen mayúsculas; la propiedad DOM devuelve
`password`, conforme al [estándar HTML](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#keywords-and-enumerated-attributes).

Esto mantiene el tipo bajo control de React. Asignarlo mediante un ref no basta: React puede
restaurar los atributos del input después de un evento de cambio y dejarlo como texto.
Las pruebas verifican la propiedad DOM, el enmascarado después de escribir, el valor al alternar,
el tabulado y el estado deshabilitado. Las pruebas de login y registro cubren su uso con
React Hook Form. Si la librería incorpora un botón accesible configurable, revisar este adaptador.
