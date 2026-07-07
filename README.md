# Gestor de Proyectos

Sistema de gestión de proyectos tipo Kanban desarrollado con Next.js y MongoDB Atlas.
Práctica evaluada No. 4 — SC-609 Base de Datos NoSQL, Universidad Fidélitas.

## Requisitos

- Node.js 20+
- Cuenta en MongoDB Atlas con un cluster y usuarios creados.

## Configuración

1. Crear un archivo `.env.local` en la raíz con las siguientes variables:

   ```env
   MONGODB_URI="mongodb+srv://pm_app:<pass>@<cluster>/?retryWrites=true&w=majority"
   MONGODB_DB="project_management"
   MONGODB_ADMIN_URI="mongodb+srv://pm_admin:<pass>@<cluster>/?retryWrites=true&w=majority"
   AUTH_SECRET="<openssl rand -base64 32>"
   ```

3. Instalar dependencias y crear la base de datos:

   ```bash
   npm install
   mongosh "$MONGODB_ADMIN_URI" --file scripts/create-database.js
   ```

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).
