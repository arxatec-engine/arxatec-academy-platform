# Herramientas de administración de Academy

Las siguientes rutas ayudan al personal autorizado a mantener el contenido y atender a estudiantes. La guardia `Admin` comprueba el rol y la API vuelve a exigirlo en cada operación. Las herramientas están separadas del recorrido principal de aprendizaje.

| Área        | Ruta                                 | Funciones presentes                                                                                                          |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Cursos      | `/admin/cursos`, `/admin/cursos/:id` | Crear, editar, duplicar, ordenar, gestionar portada, publicar, retirar y archivar.                                           |
| Lecciones   | `/admin/lecciones/:id`               | Crear/ordenar desde el curso; editar contenido video/artículo, transcripción y recursos; publicar o borrar con confirmación. |
| Moderación  | `/admin/comentarios`                 | Consultar hilos, responder, ocultar/mostrar o borrar.                                                                        |
| Estudiantes | `/admin/usuarios`                    | Buscar, filtrar el directorio y exportar CSV.                                                                                |
| Avisos      | `/admin/avisos`                      | Revisar altas y temas, exportar, marcar un corte y borrar suscripciones.                                                     |

Algunas operaciones editoriales utilizan confirmación para cambios que afectan publicación o datos estudiantiles. Las actualizaciones de contenido refrescan las consultas de catálogo asociadas. Los listados privados deben conservar búsqueda/filtros según su contrato.

Para el comportamiento de cada feature, consulta los README locales bajo `src/modules/admin/features/`.
