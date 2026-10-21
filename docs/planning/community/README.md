# Comments and moderation

Lesson comment threads are publicly readable. Posting comments or replies requires a session and verified email, which the service checks again. Discussion bodies are text, not user-supplied HTML.

Each thread is read through `GET /lessons/:id/comments`. Creating, replying, and reporting use authenticated endpoints. Hooks refresh the thread after creation/reply; a successful report disables that action locally.

`/admin/comentarios`, available to `ADMIN`, provides moderation lists, counts, and actions to reply, hide, restore, or delete. The backend remains authoritative for state, roles, and restrictions.

Review `src/modules/comments/docs/README.md`, `src/modules/admin/features/moderation/docs/README.md`, and the service when changing policies, copy, or retention.
