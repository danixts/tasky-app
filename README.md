# Tasky

Aplicación de gestión de tareas tipo Kanban: tableros por usuario, columnas por estado (To Do, In Progress, Complete), arrastrar y soltar, autenticación JWT y estadísticas de tareas por estado.

## Stack

- **Backend:** Java 25, Spring Boot 4, Spring Data JPA, Spring Security (JWT), Flyway, PostgreSQL, Caffeine, OpenAPI/Swagger.
- **Frontend:** React 19, TypeScript, Vite, TanStack Query, TanStack Router, pnpm monorepo (Turbo), Recharts.
- **Despliegue:** Docker, docker-compose. En producción: entorno Dokploy en una VPS, dominio tasky.danyjs.com.

## Requisitos

- Java 25 (o 21+ si se ajusta `pom.xml`)
- Node 24+
- pnpm
- PostgreSQL 18+

## Configuración

### Variables de entorno (backend)

Definir o exportar antes de ejecutar el backend. Valores típicos para desarrollo local:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto HTTP del API | `9000` |
| `SPRING_PROFILES_ACTIVE` | Perfil Spring | `dev` |
| `DB_HOST` | Host y puerto de PostgreSQL | `localhost:5432` |
| `DB_NAME` | Nombre de la base de datos | `tasky` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASS` | Contraseña de PostgreSQL | `password` |
| `SQL_CREATE` | DDL de Hibernate (usar `validate` con Flyway) | `validate` |
| `JWT_TOKEN` | Secreto para firmar tokens JWT | valor seguro |
| `JWT_EXPIRATION` | Caducidad del token en ms | `86400000` |
| `APP_BASE_URL` | URL base del API (para CORS/documentación) | `http://localhost:9000` |

### Variables de entorno (frontend)

En desarrollo, en `tasky-frontend/apps/web` puede usarse un `.env` basado en `.env.example`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del API | `http://localhost:9000` |

## Ejecución local

### 1. Base de datos

Tener PostgreSQL en ejecución y crear la base de datos:

```bash
createdb tasky
```

O con Docker:

```bash
docker run -d --name tasky-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=tasky -p 5432:5432 postgres:15
```

### 2. Backend

Desde la raíz del repositorio:

```bash
cd tasky-backend
export DB_HOST=localhost:5432 DB_NAME=tasky DB_USERNAME=postgres DB_PASS=password
./mvnw spring-boot:run
```

El API quedará en `http://localhost:9000` (o el `PORT` configurado). Documentación Swagger: `http://localhost:9000/docs`.

### 3. Frontend

Desde la raíz del repositorio:

```bash
cd tasky-frontend
pnpm install
pnpm dev
```

Abrir la URL que indique Vite (por ejemplo `http://localhost:5173`). Asegurarse de que `VITE_API_URL` apunte al backend (p. ej. en `apps/web/.env`: `VITE_API_URL=http://localhost:9000`).

### Tests

- Backend: `cd tasky-backend && ./mvnw test`
- Frontend (monorepo): `cd tasky-frontend && pnpm test`
- Tests del paquete services: `cd tasky-frontend/packages/services && pnpm test`

## Despliegue con Docker

El `docker-compose.yml` define dos servicios: `tasky-backend` y `tasky-frontend`. La red `dokploy-network` es externa; debe existir una base PostgreSQL accesible en esa red (o exponer el backend a una URL de BD externa).

### Producción (Dokploy)

La aplicación se despliega en un entorno **Dokploy** sobre una VPS, con dominio **tasky.danyjs.com**. El DNS del dominio está configurado en **Cloudflare**. La base de datos PostgreSQL está configurada dentro del mismo entorno Dokploy y los servicios (backend y frontend) se levantan con el compose usando la red `dokploy-network` para comunicarse con la BD.

### Red externa

Si la red no existe:

```bash
docker network create dokploy-network
```

### Variables para el compose

- **Backend:** `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASS`, `JWT_TOKEN`, `JWT_EXPIRATION`, `PORT`, etc. Si PostgreSQL está en otro contenedor de la misma red, usar el nombre del servicio como host (p. ej. `DB_HOST=postgres:5432`).
- **Frontend (build):** `VITE_API_URL` con la URL pública del API para que el cliente envíe las peticiones al backend correcto.

### Levantar los servicios

```bash
export VITE_API_URL=https://api.ejemplo.com
docker compose up -d
```

- API: puerto `9000` (mapeado en el host).
- Web: puerto `8088` (mapeado en el host).

Ajustar `APP_BASE_URL` y CORS en el backend según el dominio donde se sirva el frontend. En el despliegue actual (Dokploy, tasky.danyjs.com), la BD y las variables de entorno están configuradas en el panel de Dokploy.
