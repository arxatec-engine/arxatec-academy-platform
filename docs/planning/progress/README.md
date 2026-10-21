# Student progress

`/mis-cursos` requires a session and reads `GET /me/courses`. It displays in-progress and completed courses, completed lesson counts, and the next available lesson.

From course details, accounts can enroll before starting. Within lessons, they can mark or unmark completion. Hooks call authenticated services and invalidate `PROGRESS_KEYS.all` to keep the course list synchronized.

The contract displays totals returned by the backend. The client does not determine enrollment, certificate eligibility, or consumption metrics. `saveLessonPosition` exists in services but is not currently consumed by a hook or player.

See `src/modules/progress/features/my_courses/docs/README.md` and related tests under `src/__tests__/modules/progress/`.
