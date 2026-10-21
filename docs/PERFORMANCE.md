# Performance

The frontend splits code by page using lazy imports in `src/routes`. The initial tree retains guards and application infrastructure; catalog, authentication, learning, and administration screens load when their routes are visited.

React Query shares recent reads for 30 seconds. Catalog keys include search, topic, and level; course and lesson routes include their slugs. My courses, profile, comments, and administration have their own queries. Mutations invalidate related data so progress and course details reflect changes confirmed by the API.

Local sample covers are served as WebP. `CourseCover` loads images lazily with explicit dimensions. A service-provided cover takes priority; a local topic/course image is the fallback. Video material is embedded in a lazy-loaded iframe.

Do not add memoization or dependencies based on intuition. For performance changes, measure the build or screen behavior on the affected device and route. Bundle size is not a measurement of network speed or memory usage.
