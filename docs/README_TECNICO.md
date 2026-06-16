# README tecnico

Este documento explica como esta armado el codigo para poder retomarlo en el futuro sin tener que redescubrir la arquitectura.

## Vision general

La app es un monorepo simple:

```txt
gym/
  backend/
  frontend/
  database/
  docs/
```

El backend expone una API REST protegida con JWT. El frontend consume esa API desde un dashboard administrativo.

Flujo principal:

```txt
React -> fetch API -> Express route -> controller -> service -> Supabase
```

## Backend

### Carpetas

```txt
backend/src/
  app.ts
  server.ts
  config/
  controllers/
  middlewares/
  routes/
  schemas/
  services/
```

### `server.ts`

Punto de entrada del backend. Carga `dotenv/config`, importa `app` y levanta Express con `app.listen`.

### `app.ts`

Configura Express:

- CORS.
- JSON body parser.
- Ruta health/base `/`.
- Montaje de rutas:

```txt
/api/auth
/api/planes
/api/socios
/api/pagos
/api/reglas-mensuales
/api/administracion
```

`FRONTEND_URL` permite limitar CORS por entorno. Puede contener una URL o varias separadas por coma.

### `config/supabase.ts`

Crea el cliente de Supabase.

Variables usadas:

```env
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PUBLISHABLE_KEY
```

En produccion conviene usar `SUPABASE_SERVICE_ROLE_KEY` solo en el backend. Si no existe, el codigo usa `SUPABASE_PUBLISHABLE_KEY` como fallback.

### `routes`

Cada archivo define URLs y conecta con controllers. Las rutas privadas usan `authMiddleware`.

Endpoints actuales:

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/planes
GET    /api/planes/:id_plan
POST   /api/planes
PUT    /api/planes/:id_plan

GET    /api/socios
GET    /api/socios/:id_socio
POST   /api/socios
PUT    /api/socios/:id_socio
DELETE /api/socios/:id_socio
PATCH  /api/socios/:id_socio/plan
GET    /api/socios/:id_socio/plan-historial

GET    /api/pagos
GET    /api/pagos/:id_pago
GET    /api/pagos/socio/:id_socio
POST   /api/pagos

POST   /api/reglas-mensuales/pendientes
POST   /api/reglas-mensuales/atrasados

GET    /api/administracion/alertas
PATCH  /api/administracion/alertas/:id_alerta/resolver
GET    /api/administracion/eventos
GET    /api/administracion/socios/:id_socio/eventos
```

### `controllers`

Responsabilidad:

- Leer params/body.
- Validar con Zod.
- Llamar al service.
- Traducir errores a respuestas HTTP.

### `services`

Responsabilidad:

- Reglas de negocio.
- Consultas a Supabase.
- Hash de password.
- Generacion de JWT.
- Registro de eventos y alertas.

Servicios principales:

- `authService.ts`: registro, login, bcrypt, JWT.
- `planService.ts`: CRUD basico de planes.
- `socioService.ts`: socios, cambio/desactivacion, historial de planes.
- `pagoService.ts`: pagos y cambio automatico de `estado_pago` a `Pago`.
- `reglaMensualService.ts`: pasa socios activos a `Pendiente` o `Atrasado`.
- `administracionService.ts`: eventos, alertas y ejecuciones de reglas.

### `schemas`

Validaciones con Zod.

Estados permitidos:

```txt
estado_pago: Pago | Pendiente | Atrasado
estado_socio: Activo | Inactivo
metodo_pago: Efectivo | MercadoPago
```

## Frontend

### Carpetas

```txt
frontend/src/
  App.tsx
  App.css
  components/
  constants/
  features/
    auth/
    dashboard/
      components/
  services/
  types/
  utils/
```

### `App.tsx`

Coordina:

- Login/registro.
- Token en `localStorage`.
- Validacion de sesion con `/api/auth/me`.
- Logout.
- Render de `AuthView` o `DashboardView`.

### `features/auth/AuthView.tsx`

Componente visual del login/registro. No contiene llamadas HTTP directas; recibe handlers desde `App.tsx`.

### `features/dashboard/DashboardView.tsx`

Dueño del estado operativo:

- `planes`
- `socios`
- `pagos`
- tab activa (`socios`, `pagos`, `planes`)
- formularios
- mensajes de dashboard

Tambien carga los datos con:

```txt
GET /api/planes
GET /api/socios
GET /api/pagos
```

### Dashboard por tabs

La tab activa cambia toda la informacion principal:

- `Socios`: metricas de socios, formulario de nuevo socio, reglas mensuales y tabla de socios.
- `Pagos`: metricas de pagos/ingresos, formulario de registrar pago y tabla de pagos.
- `Planes`: metricas de planes/precios, cambio de plan y listado de planes.

### `services/api.ts`

Centraliza la URL base y `fetchApi`.

```ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
```

En produccion se debe configurar `VITE_API_BASE_URL` con la URL publica del backend terminada en `/api`.

### `types/gym.ts`

Contratos compartidos del frontend:

- `Usuario`
- `Plan`
- `Socio`
- `Pago`
- formularios
- tabs
- mensajes

### `constants/forms.ts`

Estados iniciales de formularios para no duplicar objetos vacios en componentes.

### `utils/formatters.ts`

Helpers de formato:

- moneda ARS
- fecha `es-AR`

## Base de datos

El proyecto espera tablas principales en Supabase:

```txt
usuario
plan
socio
pago
socio_plan_historial
```

Y tablas administrativas:

```txt
socio_evento
alerta
regla_ejecucion
```

Las tablas administrativas estan en:

```txt
database/administracion_base.sql
```

### SQL base sugerido

Usar esto como referencia si hay que recrear la base desde cero. Ajustar tipos/politicas segun el entorno.

```sql
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan (
  id_plan INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_plan TEXT NOT NULL,
  dias_semana INT NOT NULL,
  precio NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS socio (
  id_socio INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  estado_pago TEXT NOT NULL DEFAULT 'Pendiente',
  estado_socio TEXT NOT NULL DEFAULT 'Activo',
  id_plan INT NOT NULL REFERENCES plan(id_plan),
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_socio_estado_pago CHECK (estado_pago IN ('Pago', 'Pendiente', 'Atrasado')),
  CONSTRAINT chk_socio_estado_socio CHECK (estado_socio IN ('Activo', 'Inactivo'))
);

CREATE TABLE IF NOT EXISTS pago (
  id_pago INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_socio INT NOT NULL REFERENCES socio(id_socio),
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
  fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto_pagado NUMERIC(12, 2) NOT NULL,
  metodo_pago TEXT NOT NULL,
  comprobante TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pago_metodo CHECK (metodo_pago IN ('Efectivo', 'MercadoPago'))
);

CREATE TABLE IF NOT EXISTS socio_plan_historial (
  id_historial INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_socio INT NOT NULL REFERENCES socio(id_socio),
  id_plan INT NOT NULL REFERENCES plan(id_plan),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Despues ejecutar:

```sql
-- contenido de database/administracion_base.sql
```

## Variables de entorno

Backend:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
FRONTEND_URL=
PORT=3000
```

Frontend:

```env
VITE_API_BASE_URL=
```

## Decisiones tomadas

- La API mantiene el patron `route -> controller -> service -> database`.
- Los formularios del dashboard se separaron por contexto para que los botones de sidebar cambien la informacion visible.
- El frontend usa `localStorage` para el token por simplicidad.
- El backend puede usar `SUPABASE_SERVICE_ROLE_KEY` en produccion para evitar bloqueos de RLS.
- No se agrego router frontend porque la app todavia funciona como panel unico autenticado.

## Pendientes recomendados

- Agregar tests automatizados.
- Agregar `eslint.config.js`, porque ESLint 10 no usa `.eslintrc` por defecto.
- Agregar migraciones SQL versionadas para toda la base.
- Revisar roles/permisos si habra mas de un tipo de usuario.
- Reemplazar `any` en `authMiddleware` por un tipo extendido de `Request`.
- Definir politica de backups en Supabase.
