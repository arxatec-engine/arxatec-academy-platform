# Lessons and materials

Course details display the syllabus; lessons open at `/cursos/:course_slug/lecciones/:lesson_slug`. The lesson endpoint may return full content or `403 LESSON_LOCKED` with a syllabus list. The service converts these into a typed union, and the screen presents playback or a sign-in/registration invitation.

Content may include YouTube or Vimeo video, article HTML sanitized by the backend, a transcript, and resources. Iframes use provider-specific embed URLs, `loading="lazy"`, and an accessible title. Articles render already-sanitized API content; coordinate sanitization changes with the backend.

Previous/next navigation comes from the endpoint response. Signed-in users can mark lessons complete. On a completed course's last lesson, the next action opens the exam or existing certificate. `saveLessonPosition` is declared in services, but no hook or player interaction currently uses it; automatic playback-position saving is not a visible capability.

The ADMIN area edits courses and lessons, attaches resources, publishes, and reorders content. Validation and operations are documented in [Administration](../content_management/README.md) and READMEs under `src/modules/admin/features/`.
