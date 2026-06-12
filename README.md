# Gym App

Aplicacion web para administrar un gimnasio. El proyecto esta dividido en dos partes:

- `backend`: API REST con Express, TypeScript, Supabase, JWT y bcrypt.
- `frontend`: interfaz React con Vite para registro, login, validacion de sesion y logout.

## Estado actual

La app ya tiene implementado el flujo base de autenticacion:

1. Registro de usuario.
2. Hash de password antes de guardar en base de datos.
3. Login con usuario y password.
4. Generacion de token JWT.
5. Validacion de sesion con una ruta protegida.
6. Frontend conectado al backend para register, login, `/me` y logout.

Endpoints disponibles:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Como funciona el flujo de autenticacion

### Registro

El frontend envia:

```json
{
  "usuario": "admin",
  "nombre": "Administrador",
  "password": "123456"
}
```

El backend valida los datos con Zod, genera un hash con bcrypt y guarda en Supabase:

```txt
usuario
nombre
password_hash
```

La password original no se guarda en la base de datos.

Si el usuario ya existe, Supabase devuelve el codigo `23505` y el backend responde:

```json
{
  "message": "El usuario ya existe"
}
```

con estado HTTP `409 Conflict`.

### Login

El frontend envia:

```json
{
  "usuario": "admin",
  "password": "123456"
}
```

El backend busca el usuario en Supabase, compara la password enviada contra `password_hash` usando bcrypt y, si coincide, genera un JWT firmado con `JWT_SECRET`.

Respuesta esperada:

```json
{
  "token": "jwt...",
  "usuario": {
    "id_usuario": 1,
    "usuario": "admin",
    "nombre": "Administrador"
  }
}
```

### Sesion en frontend

El frontend guarda el token en `localStorage`.

Cuando la app carga, intenta validar ese token llamando a:

```txt
GET /api/auth/me
```

con el header:

```txt
Authorization: Bearer TOKEN
```

Si el token es valido, muestra la pantalla de sesion activa. Si el token no existe o es invalido, vuelve al formulario de login.

## Estructura de carpetas

```txt
gym/
  backend/
    src/
      app.ts
      server.ts
      config/
        supabase.ts
      controllers/
        authController.ts
      middlewares/
        authMiddleware.ts
      routes/
        authRoute.ts
      schemas/
        authSchemas.ts
      services/
        authService.ts
    package.json
    tsconfig.json

  frontend/
    src/
      App.tsx
      App.css
      index.css
      main.tsx
    package.json
    vite.config.ts
```

## Justificacion de carpetas

### `backend/src/server.ts`

Es el punto de entrada del backend. Su responsabilidad es cargar variables de entorno, importar `app` y levantar el servidor con `app.listen`.

Se mantiene separado de `app.ts` para que el objeto Express pueda configurarse sin mezclarlo con la ejecucion del servidor.

### `backend/src/app.ts`

Configura Express:

- CORS.
- JSON body parser.
- Ruta base `/`.
- Montaje de rutas por entidad.

Actualmente monta:

```ts
app.use("/api/auth", authRoute)
```

La decision fue no usar un `routes/index.ts` por ahora. En este proyecto, `app.ts` funciona como el lugar central donde se montan las rutas principales:

```txt
/api/auth
/api/clientes
/api/rutinas
/api/pagos
```

Esto es simple, explicito y facil de seguir mientras el proyecto esta creciendo.

### `backend/src/routes`

Cada archivo representa una entidad o modulo de negocio.

Actualmente:

```txt
authRoute.ts
```

Define las URLs de autenticacion:

```txt
/register
/login
/me
```

La ruta no contiene logica de negocio. Solo conecta endpoints con controllers y middlewares.

### `backend/src/controllers`

Los controllers reciben `req` y devuelven `res`.

Responsabilidades:

- Validar el body con schemas.
- Llamar al service correspondiente.
- Traducir errores a respuestas HTTP.

Ejemplo:

- datos invalidos -> `400`
- usuario duplicado -> `409`
- login incorrecto -> `401`

### `backend/src/services`

Los services contienen la logica de negocio.

En `authService.ts` se hace:

- hash de password con bcrypt.
- insert en Supabase.
- busqueda de usuario.
- comparacion de password.
- creacion de JWT.

Esto evita que el controller crezca demasiado y permite reutilizar logica.

### `backend/src/schemas`

Contiene validaciones con Zod.

Actualmente:

- `loginSchema`
- `registerSchema`

La validacion se separa del controller para mantener reglas claras y reutilizables.

### `backend/src/config`

Contiene integraciones externas o configuracion tecnica.

Actualmente:

```txt
supabase.ts
```

Centraliza la creacion del cliente de Supabase. Esto evita repetir configuracion en cada service.

### `backend/src/middlewares`

Contiene funciones que se ejecutan antes de llegar al controller.

Actualmente:

```txt
authMiddleware.ts
```

Valida el header `Authorization`, verifica el JWT y permite proteger rutas privadas.

### `frontend/src/App.tsx`

Por ahora concentra el flujo de autenticacion del frontend:

- cambio entre login y registro.
- envio de formularios.
- guardado de token.
- validacion de sesion.
- logout.

Esta decision es practica para esta etapa porque el frontend todavia es chico. Mas adelante conviene separar en componentes y services.

### `frontend/src/App.css` e `index.css`

`index.css` contiene estilos globales basicos.

`App.css` contiene los estilos especificos de la pantalla de autenticacion.

## Justificacion de tecnologias

### TypeScript

Se usa en backend y frontend para detectar errores antes de ejecutar la app. Ayuda especialmente con:

- tipos de datos del login y registro.
- payloads de usuario.
- respuestas de servicios.
- imports entre archivos.

### Express

Express permite crear una API REST simple y directa. Es adecuado para aprender arquitectura backend porque deja claro el flujo:

```txt
route -> middleware -> controller -> service -> database
```

### Supabase

Supabase se usa como base de datos PostgreSQL administrada. Permite trabajar con SQL real sin tener que configurar una base local desde cero.

Tambien facilita pruebas rapidas desde el SQL Editor.

### bcrypt

bcrypt se usa para hashear passwords.

La app nunca guarda la password original. Solo guarda `password_hash`, que luego se compara en login con `bcrypt.compare`.

### JSON Web Token

JWT permite generar un token firmado despues del login. El frontend puede enviar ese token en cada request privada.

Esto permite proteger rutas como:

```txt
GET /api/auth/me
```

y despues rutas futuras como:

```txt
GET /api/clientes
POST /api/rutinas
```

### Zod

Zod valida los datos que llegan al backend antes de ejecutar logica de negocio.

Esto evita que el service reciba datos incompletos o con formato incorrecto.

### React

React se usa para construir la interfaz del login y registro con estado local:

- usuario.
- nombre.
- password.
- token.
- usuario actual.
- mensajes de error.

### Vite

Vite se usa para desarrollo frontend porque levanta rapido, tiene hot reload y una configuracion inicial simple para React + TypeScript.

### React Icons

React Icons se usa para iconos visuales en la interfaz sin tener que crear SVG manualmente.

## Variables de entorno del backend

Crear `backend/.env` con:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
JWT_SECRET=tu_clave_secreta_larga
PORT=3000
```

No se debe subir este archivo con valores reales a un repositorio publico.

## Tabla esperada en Supabase

La tabla actual esperada es:

```sql
CREATE TABLE usuario (
  id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

El campo `password_hash` debe ser `TEXT` para no truncar hashes de bcrypt.

## Como correr el proyecto

### Backend

```powershell
cd backend
npm install
npm run dev
```

El backend corre en:

```txt
http://localhost:3000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite normalmente corre en:

```txt
http://localhost:5173
```

## Pruebas manuales recomendadas

### Registrar usuario

```txt
POST http://localhost:3000/api/auth/register
```

```json
{
  "usuario": "admin",
  "nombre": "Administrador",
  "password": "123456"
}
```

### Login

```txt
POST http://localhost:3000/api/auth/login
```

```json
{
  "usuario": "admin",
  "password": "123456"
}
```

### Ruta protegida

```txt
GET http://localhost:3000/api/auth/me
Authorization: Bearer TOKEN
```

## Limitaciones actuales

- El frontend tiene la URL del backend hardcodeada en `App.tsx`.
- El token se guarda en `localStorage`.
- El usuario decodificado se guarda en `req` usando `(req as any)`.
- Todavia no hay roles ni permisos.
- Todavia no hay entidades reales del gimnasio, como clientes, planes, rutinas o pagos.
- No hay tests automatizados.
