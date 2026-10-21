# Catalog and courses

The catalog at `/` lets visitors discover published courses without authentication. `GET /courses` accepts search, topic, and level; options and facets come from the service. Search state remains in URL parameters, and the React Query key includes every filter.

The entire course card opens `/cursos/:slug`. Course details display description, topic, level, duration, and syllabus. A signed-in user starts through an API enrollment before opening the first lesson. Visitors can open the first lesson; that route supports samples and presents a locked state when the backend denies content.

Public notification and suggestion forms appear as secondary actions in the catalog and on course details without lessons. Forms are separate from search results.

The current catalog offers free courses and has no purchase flow. Completed courses show an Exam section after the syllabus, with a clickable exam or certificate card.

See `src/modules/catalog/features/course_catalog/docs/README.md` and `course_detail/docs/README.md` for more detail.
