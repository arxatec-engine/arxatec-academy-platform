# Despliegue

El frontend se compila como archivos estáticos en `dist/`. La API y sus secretos se configuran y despliegan por separado en `arxatec-academy-service`. El navegador recibe únicamente la dirección pública de la API.

## Compilar con Infisical

Instala Infisical CLI y configura el acceso al proyecto de `.infisical.json`. En un equipo de
desarrollo se usa `infisical login`; el entorno de despliegue debe proporcionar su propia
autenticación de CLI. Agrega `VITE_API_URL` en la raíz `/` del entorno `prod` antes de compilar.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build:prod
pnpm preview
```

`pnpm build` es un alias de `build:prod`; `pnpm build:dev` usa las variables de `dev` para
una compilación de desarrollo. Ambos ejecutan TypeScript y Vite. `pnpm preview` carga `prod`
y sirve la carpeta compilada para revisar el artefacto local. `VITE_API_URL` queda dentro de
los archivos del cliente: cambiarla en Infisical exige volver a compilar.

Para comprobar el código sin acceder a Infisical, usa `pnpm build:local` y
`pnpm preview:local`, con el entorno del proceso o un `.env` local.

## Hosting

Publica el contenido de `dist/` en un hosting HTTPS para SPA. El servidor estático debe devolver `index.html` para rutas de la aplicación como `/mis-cursos` y `/cursos/:slug`, y conservar respuestas 404 para archivos de recursos que no existen. Configura CORS en el servicio para los orígenes web autorizados y limita sus métodos según el contrato de API.

Los archivos con hash se pueden cachear durante su vida versionada; `index.html` debe poder actualizarse para que el navegador descubra una compilación nueva. El dominio final, el proxy inverso, certificados, monitoreo y credenciales pertenecen a la infraestructura de despliegue, no a los documentos del cliente.

Tras publicar, valida el origen configurado, carga directa de rutas públicas y privadas, acceso sin y con cuenta, cierre de sesión, restablecimiento de contraseña, callback OAuth y temas/idiomas. No uses datos de producción para pruebas destructivas.
