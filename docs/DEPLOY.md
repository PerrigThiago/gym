# Guia de deploy

Esta guia cubre el camino recomendado para subir el proyecto a GitHub y deployar backend + frontend.

## 1. Antes de subir a GitHub

Desde la raiz del proyecto:

```powershell
git status
```

Verificar que no se suban:

```txt
backend/.env
frontend/.env
node_modules/
dist/
*.log
```

El repo ya incluye `.gitignore` raiz y `.env.example` para backend/frontend.

## 2. Verificar builds locales

Backend:

```powershell
cd backend
npm.cmd install
npm.cmd run build
```

Frontend:

```powershell
cd ../frontend
npm.cmd install
npm.cmd run build
```

Nota Windows: usar `npm.cmd` evita el bloqueo de PowerShell con `npm.ps1`.

## 3. Crear repositorio en GitHub

1. Crear un repo vacio en GitHub.
2. En la raiz local:

```powershell
git init
git add .
git commit -m "Initial gym admin app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si el repo ya existe localmente, solo usar:

```powershell
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## 4. Preparar Supabase

1. Crear un proyecto en Supabase.
2. Crear tablas principales usando el SQL sugerido en `docs/README_TECNICO.md`.
3. Ejecutar `database/administracion_base.sql`.
4. Crear algunos planes iniciales:

```sql
INSERT INTO plan (nombre_plan, dias_semana, precio)
VALUES
  ('Plan 2 dias', 2, 15000),
  ('Plan 3 dias', 3, 20000),
  ('Plan libre', 6, 28000);
```

5. Copiar variables desde Supabase:

```txt
Project URL -> SUPABASE_URL
anon/public key -> SUPABASE_PUBLISHABLE_KEY
service_role key -> SUPABASE_SERVICE_ROLE_KEY
```

Importante: `SUPABASE_SERVICE_ROLE_KEY` solo va en el backend. Nunca ponerla en Vercel/frontend.

## 5. Deploy del backend

Opcion recomendada simple: Render.

1. Crear un nuevo Web Service.
2. Conectar el repo de GitHub.
3. Configurar:

```txt
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

4. Variables de entorno:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=una_clave_larga_y_secreta
FRONTEND_URL=https://tu-frontend.vercel.app
PORT=3000
```

Render suele inyectar `PORT`. Si lo hace, no pasa nada: el backend usa `process.env.PORT || 3000`.

5. Probar:

```txt
https://tu-backend.onrender.com/
```

Debe responder:

```txt
API funcionando
```

## 6. Deploy del frontend

Opcion recomendada simple: Vercel.

1. Importar el repo desde GitHub.
2. Configurar:

```txt
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

3. Variable de entorno:

```env
VITE_API_BASE_URL=https://tu-backend.onrender.com/api
```

4. Deployar.

5. Volver a Render y actualizar:

```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

Si usas preview deployments de Vercel, puedes poner varias URLs separadas por coma:

```env
FRONTEND_URL=https://tu-frontend.vercel.app,https://preview-url.vercel.app
```

## 7. Prueba final en produccion

1. Abrir la URL de Vercel.
2. Crear un usuario administrador.
3. Iniciar sesion.
4. Verificar que carguen planes.
5. Crear un socio.
6. Registrar un pago.
7. Cambiar el plan del socio.
8. Aplicar regla mensual de pendientes/atrasados.

## 8. Problemas comunes

### El frontend no conecta con backend

Revisar `VITE_API_BASE_URL` en Vercel. Debe terminar en `/api`.

Ejemplo correcto:

```txt
https://tu-backend.onrender.com/api
```

### Error de CORS

Revisar `FRONTEND_URL` en Render. Debe ser la URL publica exacta del frontend.

### Error de Supabase o tablas vacias

Revisar:

- `SUPABASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY`.
- Que las tablas existan.
- Que haya planes creados antes de crear socios.

### Login falla despues de deploy

Revisar:

- `JWT_SECRET` configurado en Render.
- Que el usuario exista en la tabla `usuario`.
- Que el backend haya sido redeployado despues de cambiar variables.

### Render tarda en responder

En plan gratis, Render puede dormir el servicio. La primera request puede tardar.

## 9. Checklist de produccion

- [ ] `.env` no esta subido a GitHub.
- [ ] Backend deployado y responde `/`.
- [ ] Frontend deployado.
- [ ] `VITE_API_BASE_URL` apunta al backend real con `/api`.
- [ ] `FRONTEND_URL` apunta al frontend real.
- [ ] `JWT_SECRET` es largo y no es el de ejemplo.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` esta solo en backend.
- [ ] Tablas creadas en Supabase.
- [ ] Planes iniciales cargados.
- [ ] Flujo login -> socio -> pago probado.
