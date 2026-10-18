# Portadas de cursos

`CourseCover` usa `Image` de `arxatec-ui`. Prioriza `coverImageUrl` del backend; si falta o falla,
muestra una foto local de Pexels. Los cursos actuales tienen una portada por slug y los nuevos
usan la del tema. El mismo componente sirve al catálogo y a la ficha, con proporción 16:10,
dimensiones reservadas y carga diferida. Las imágenes son decorativas: el título está al lado.

Las seis fotos se descargaron el 2026-10-03, se recortaron a 960 × 600 y se sirven como WebP
desde `public/images/courses/`. Pesan aproximadamente 243 KiB en conjunto. El navegador no
depende de una petición a Pexels para mostrarlas.

| Archivo                          | Foto original                                                                                                                          | Autor               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `fundamentos_de_legal_tech.webp` | [Laptop Placed on Top of Stack of Books](https://www.pexels.com/photo/laptop-placed-on-top-of-stack-of-books-8472371/)                 | Cup of Couple       |
| `automatiza_tus_escritos.webp`   | [Open Books and a Laptop](https://www.pexels.com/photo/open-books-and-a-laptop-10060385/)                                              | Nataliya Vaitkevich |
| `ia_aplicada.webp`               | [Developer Working on Software Code](https://www.pexels.com/photo/crop-faceless-developer-working-on-software-code-on-laptop-5926382/) | Sora Shimazaki      |
| `ordena_tu_estudio.webp`         | [Modern Interior Design of a Business Office](https://www.pexels.com/photo/modern-interior-design-of-a-business-office-7534224/)       | Max Vakhtbovych     |
| `contratos_como_sistema.webp`    | [People Doing Paperwork at a Desk](https://www.pexels.com/photo/people-doing-paperwork-at-a-desk-8152735/)                             | Pavel Danilyuk      |
| `expedientes_sin_excel.webp`     | [Book and Binder on a Desk](https://www.pexels.com/photo/book-and-binder-on-a-desk-7876088/)                                           | Kaboompics          |

La [licencia de Pexels](https://www.pexels.com/license/) permite el uso y la modificación de
estas fotografías en la web. Estos créditos conservan su procedencia. El respaldo visual no
corrige la política de archivos del servicio: las subidas siguen necesitando una configuración
compatible con los orígenes finales.
