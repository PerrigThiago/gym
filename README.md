# Gym Admin

Sistema web para administrar socios, planes y pagos de un gimnasio.

El proyecto esta separado en una API REST con Express + TypeScript y un frontend con React + Vite. Usa Supabase como base de datos y JWT para proteger las rutas privadas.

## Funcionalidades

- Registro e inicio de sesion de administradores.
- Sesion persistente con token JWT.
- Dashboard operativo por secciones:
  - Socios: alta de socios, estados de pago y reglas mensuales.
  - Pagos: registro de pagos, monto, metodo y observaciones.
  - Planes: listado de planes y cambio de plan por socio.
- Historial de cambios de plan.
- Eventos administrativos y alertas para seguimiento.
- Interfaz responsive para desktop y mobile.

## Tecnologias

- Backend: Node.js, Express, TypeScript, Zod, JWT, bcrypt.
- Frontend: React, Vite, TypeScript, React Icons.
- Base de datos: Supabase/PostgreSQL.

## Estructura

```txt
gym/
  backend/              API REST
  frontend/             App React
  database/             SQL adicional para Supabase
  docs/                 Documentacion tecnica y deploy
```

## Requisitos

- Node.js 20 o superior.
- npm.
- Proyecto de Supabase creado.

## Configuracion local

1. Instalar dependencias:

```powershell
cd backend
npm install

cd ../frontend
npm install
```

2. Crear variables de entorno:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3. Completar `backend/.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=una_clave_larga_y_secreta
FRONTEND_URL=http://localhost:5173
PORT=3000
```

4. Completar `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. Crear las tablas necesarias en Supabase. Ver:

- [README tecnico](docs/README_TECNICO.md)
- `database/administracion_base.sql`

## Uso local

Backend:

```powershell
cd backend
npm run dev
```

Frontend:

```powershell
cd frontend
npm run dev
```

URLs locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- API base: `http://localhost:3000/api`

## Scripts utiles

Backend:

```powershell
npm run dev
npm run build
npm start
```

Frontend:

```powershell
npm run dev
npm run build
npm run preview
```

En Windows/PowerShell, si `npm run build` queda bloqueado por `npm.ps1`, usar:

```powershell
npm.cmd run build
```

## Documentacion

- [README tecnico](docs/README_TECNICO.md): arquitectura, carpetas, endpoints, modelos y decisiones.
- [Deploy](docs/DEPLOY.md): pasos para subir a GitHub y publicar backend/frontend.

## Estado del proyecto

El sistema esta preparado para subir a GitHub y deployar separando backend y frontend. Antes de usarlo en produccion, revisar politicas de seguridad de Supabase, variables de entorno, dominio del frontend y estrategia de backups.
