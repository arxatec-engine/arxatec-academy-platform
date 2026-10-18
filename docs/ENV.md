# Entorno

El frontend solo lee `VITE_API_URL`, desde `src/config/env/index.ts`. Es configuración pública que se incorpora al bundle; apunta a la URL base de la API, incluido el prefijo `/api/v1`.

```env
VITE_API_URL=http://localhost:3001/api/v1
```

Ese es el valor de `.env.example` y el fallback local del código. La API local de Academy debe estar disponible en esa dirección. Para otra instalación, crea `.env` a partir de `.env.example` y cambia el origen y prefijo según el backend. Reinicia Vite después de editarlo.

Desde la raíz del frontend:

```sh
pnpm install
pnpm dev
```

El nombre de variable no cambia entre desarrollo y build; Vite expone valores `VITE_*` al cliente. No pongas contraseñas, tokens de OAuth, claves de almacenamiento ni credenciales de servicio en esta variable ni en el bundle.

No hay otra variable `VITE_*` definida por el contrato actual. Consulta [`src/config/env`](../src/config/env/index.ts), [Despliegue](DEPLOYMENT.md) y `.env.example` al cambiar configuración.
