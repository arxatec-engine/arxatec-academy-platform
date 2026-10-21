# Academy administration tools

The following routes help authorized staff maintain content and support students. The `Admin` guard checks the role, and the API requires it again for every operation. Tools are separate from the primary learning flow.

| Area          | Route                                | Current features                                                                                                           |
| ------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Courses       | `/admin/cursos`, `/admin/cursos/:id` | Create, edit, duplicate, reorder, manage covers and exams, publish, unpublish, and archive.                                |
| Lessons       | `/admin/lecciones/:id`               | Create/reorder from a course; edit video/article content, transcripts, and resources; publish or delete with confirmation. |
| Moderation    | `/admin/comentarios`                 | Inspect threads, reply, hide/restore, or delete.                                                                           |
| Students      | `/admin/usuarios`                    | Search, filter the directory, and export CSV.                                                                              |
| Notifications | `/admin/avisos`                      | Review signups and topics, export, mark a cutoff, and delete subscriptions.                                                |

Some editorial operations require confirmation when they affect publication or student data. Content updates refresh associated catalog queries. Private lists must retain search/filters according to their contracts.

See local READMEs under `src/modules/admin/features/` for each feature's behavior.
