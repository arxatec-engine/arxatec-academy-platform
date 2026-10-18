# Verificación del recorrido Academy

Usa esta lista al revisar cambios que afecten al producto educativo. La existencia de un test o de una ruta no confirma disponibilidad del API remoto.

1. Abre el catálogo sin cuenta; busca por texto y cambia tema/nivel. Copia la URL y comprueba que al volver conserva el estado.
2. Abre una ficha y revisa temario, portada de fallback y acción de inicio. Con sesión, comprueba que se inscribe antes de ir a la lección.
3. Abre una muestra sin cuenta y una lección bloqueada; confirma que se conserva el destino tras crear cuenta o entrar.
4. Con una cuenta, marca la lección y revisa Mis cursos. Prueba también lista vacía y error API.
5. Comprueba comentarios como visitante, con cuenta sin correo verificado y con cuenta verificada. El backend determina el permiso final.
6. Edita Perfil, foto y contraseña según el proveedor de acceso; revisa la confirmación de baja solo en un entorno seguro.
7. Con rol ADMIN, abre las rutas administrativas involucradas. Comprueba que el backend rechaza la misma operación a una cuenta de estudiante.
8. Revisa estado de carga, error, vacío, idiomas es/en/pt, tema claro/oscuro, navegación por teclado y viewport móvil.

Los resultados de una entrega se registran en `docs/shipped/` tras verificar el cambio. No marques una revisión visual o una llamada a backend como realizada si solo se ejecutaron pruebas unitarias.
