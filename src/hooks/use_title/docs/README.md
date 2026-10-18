# `useTitle`

Sigue el patrón de Admin Platform. Cada página importa `useTitle` desde `@/hooks`
y le pasa únicamente el nombre traducido de la página:

```tsx
useTitle(t(CATALOG_TEXT.title));
```

El hook aplica `document.title` en un `useEffect` y añade automáticamente
` - Arxatec Academy`: por ejemplo, `Catálogo de cursos - Arxatec Academy`.
Se ejecuta al montar y cuando cambia el título, incluido un cambio de idioma.
No restaura el título anterior al desmontar ni lo duplica en estado de React.
Los layouts no escriben títulos. Las páginas de detalle y edición tienen un título
traducido propio incluso mientras cargan sus datos; los flujos de verificación,
Google y recuperación actualizan el título al cambiar su estado visible.
