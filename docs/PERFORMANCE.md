# Rendimiento

El frontend separa el código por página mediante importaciones diferidas en `src/routes`. El árbol inicial conserva los guards y la infraestructura de aplicación; catálogo, auth, aprendizaje y administración descargan su pantalla cuando se visita su ruta.

React Query comparte lecturas recientes durante 30 segundos. Las claves de catálogo incluyen búsqueda, tema y nivel; las rutas de curso y lección incluyen sus slugs. Mis cursos, perfil, comentarios y administración tienen consultas propias. Las mutaciones invalidan los datos relacionados para que el progreso y la ficha reflejen los cambios confirmados por el API.

Las portadas locales de muestra se sirven como WebP y el componente `CourseCover` carga imágenes de forma diferida con dimensiones explícitas. Si el servicio devuelve una portada, esta tiene prioridad; una imagen local por tema/curso sirve como respaldo. El material de video se inserta en un iframe con carga diferida.

Evita añadir memoización o dependencias por intuición. Para un cambio de rendimiento, mide el build o el comportamiento de la pantalla en el dispositivo y la ruta afectados; no presentes el tamaño del bundle como una medición de velocidad de red o memoria.
