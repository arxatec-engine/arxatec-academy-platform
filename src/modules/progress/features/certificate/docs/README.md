# Certificado público

Ruta `/certificados/:id`, fuera del guard `Auth`. Consulta `GET /certificates/:id` con
`axiosPublicInstance`: cualquiera con la URL puede verificarlo sin iniciar sesión ni enviar
credenciales. Si el certificado existe, sin sesión muestra únicamente su tarjeta: no monta la cabecera,
el pie ni el campo de enlace público y sus botones. Los bordes horizontales ocupan todo el
ancho y los verticales todo el alto de la pantalla, con el contenido centrado en `max-w-3xl`.
Solo el contenido usa `bg-card`; el resto de la pantalla usa `bg-background`.
Con sesión conserva la cabecera, el pie y los controles.
Muestra nombre y curso registrados al emitirlo, fecha, identificador y QR.
No fabrica certificados en el navegador ni deduce su validez del progreso local.

El botón «Descargar PDF» abre `/certificates/:id/pdf?language=es|en|pt`, según el idioma visible,
y devuelve un archivo adjunto desde el servidor con el diseño de la tarjeta: logo Academy,
fuente ArxatecSans, textos a la izquierda, badge de verificación y QR a la derecha.
El PDF también centra el contenido con fondo de tarjeta y prolonga los bordes en forma de `#`
sobre el fondo blanco de la página.
«Copiar enlace» copia la URL canónica del backend; si el navegador no permite copiar,
el campo de solo lectura sigue ofreciendo la URL. El QR de la página y el del PDF abren esa URL.

La consulta diferencia carga y error recuperable. Un certificado inexistente o con identificador
inválido (404/422) muestra la página 404 completa, igual que una URL desconocida, con la acción
para volver al inicio. Nunca presenta un error como certificado verificado.
No conserva la consulta al desmontar ni la considera fresca entre
visitas. Con sesión usa `PageShell` (`max-w-3xl`), controles de `arxatec-ui` y títulos de hasta
`text-2xl`. Los textos y el PDF admiten español, inglés y portugués.

Mis cursos conserva `certificateId` en ambas listas y muestra «Ver certificado» cuando existe.
Completar la última lección ofrece «Dar examen» si no existe certificado. Aprobar el examen
de 15 preguntas (12 aciertos por defecto) emite el certificado y permite abrir esta página.
Cambiar el nombre o el curso después no reescribe el documento emitido; eliminar la cuenta
borra sus certificados y la página deja de verificarlos.

Las pruebas del router real cubren acceso anónimo, PDF, QR, copia del enlace, ausencia, reintento
por fallo de conexión y acceso desde Mis cursos.
