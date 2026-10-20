# Entorno

El frontend solo lee `VITE_API_URL`, desde `src/config/env/index.ts`. Es configuración pública que se incorpora al bundle; apunta a la URL base de la API, incluido el prefijo `/api/v1`.

```env
VITE_API_URL=http://localhost:3001/api/v1
```

Ese es el fallback local del código. La API local de Academy debe
estar disponible en esa dirección.

## Infisical

Los scripts leen el `workspaceId` de `.infisical.json`, igual que Admin, y lo pasan como
`--projectId` al CLI. El proyecto del frontend es independiente del servicio. Configura
`VITE_API_URL` en la raíz `/` de los entornos `dev` y `prod`, con la URL de API correspondiente.
Es la única variable de aplicación que necesita este proyecto de Infisical.

Desde la raíz del frontend:

```sh
pnpm install
infisical login
pnpm dev
```

| Comando                                                      | Configuración                                                          |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `pnpm dev`                                                   | Infisical `dev`, después Vite                                          |
| `pnpm build:dev`                                             | Infisical `dev`, después TypeScript y Vite                             |
| `pnpm build:prod` / `pnpm build`                             | Infisical `prod`, después TypeScript y Vite                            |
| `pnpm preview`                                               | Infisical `prod`, sirve el `dist` ya compilado                         |
| `pnpm dev:local` / `pnpm build:local` / `pnpm preview:local` | Sin consultar Infisical; entorno del proceso y archivos `.env` de Vite |

Infisical inyecta variables antes de ejecutar Vite. Las variables del proceso tienen prioridad
sobre los archivos `.env`; estos siguen sirviendo como configuración local para las ausentes.
Para trabajar con archivos locales, crea un `.env` con `VITE_API_URL` y usa los scripts `:local`.
Reinicia Vite al cambiar las variables. `preview` no vuelve a compilar ni cambia una URL ya
incluida en el bundle: para eso ejecuta el build del entorno correspondiente.

El nombre de variable no cambia entre desarrollo y build; Vite expone valores `VITE_*` al cliente. No pongas contraseñas, tokens de OAuth, claves de almacenamiento ni credenciales de servicio en esta variable ni en el bundle.

No hay otra variable `VITE_*` definida por el contrato actual. Consulta [`src/config/env`](../src/config/env/index.ts) y [Despliegue](DEPLOYMENT.md) al cambiar configuración.
