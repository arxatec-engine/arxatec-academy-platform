# Despliegue

El frontend se compila como archivos estáticos en `dist/`. La API y sus secretos se configuran y despliegan por separado en `arxatec-academy-service`. El navegador recibe únicamente la dirección pública de la API.

## Compilar y revisar localmente

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm preview
```

`pnpm build` ejecuta TypeScript y Vite. `pnpm preview` sirve la carpeta compilada para revisar el artefacto local. Configura `VITE_API_URL` antes de compilar: su valor queda dentro de los archivos del cliente.

## Hosting

Publica el contenido de `dist/` en un hosting HTTPS para SPA. El servidor estático debe devolver `index.html` para rutas de la aplicación como `/mis-cursos` y `/cursos/:slug`, y conservar respuestas 404 para archivos de recursos que no existen. Configura CORS en el servicio para los orígenes web autorizados y limita sus métodos según el contrato de API.

Los archivos con hash se pueden cachear durante su vida versionada; `index.html` debe poder actualizarse para que el navegador descubra una compilación nueva. El dominio final, el proxy inverso, certificados, monitoreo y credenciales pertenecen a la infraestructura de despliegue, no a los documentos del cliente.

Tras publicar, valida el origen configurado, carga directa de rutas públicas y privadas, acceso sin y con cuenta, cierre de sesión, restablecimiento de contraseña, callback OAuth y temas/idiomas. No uses datos de producción para pruebas destructivas.
