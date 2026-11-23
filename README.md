# Sistema de Gestión Aeroportuaria (AeroGestión)

Aplicación web y API backend desarrollada con **Node.js**, **Express**, **EJS**, **Bootstrap 5** y **MySQL** (`mysql2`) bajo arquitectura **MVC**, con autenticación mediante **JWT** (en cookie `HttpOnly` o cabecera `Bearer`) y control de acceso basado en roles (**RBAC**).

## Características principales

- **Arquitectura MVC:** Separación entre rutas (`routes/`), controladores (`controllers/`), modelos (`models/`) y vistas (`views/`).
- **Control de acceso por roles (RBAC):**
  - `root`: Acceso total al sistema y gestión completa de usuarios (crear, editar rol/clave, eliminar cuentas no protegidas). Inicia sesión con `username: "root"` y la clave definida en `ROOT_KEY`.
  - `admind`: Gestión operativa de entidades aeroportuarias y consulta de usuarios en modo lectura.
  - `user`: Acceso operativo limitado (consulta de módulos y actualización del campo `estado_vuelo` en vuelos).
- **Reglas de integridad de negocio:**
  - Un vuelo solo puede programarse o asignarse a una pista con estado `'Operativa'`.
  - Contraseñas hasheadas con `bcryptjs` y consultas SQL parametrizadas con `mysql2`.
  - Soporte dual en rutas: redirección con alertas para formularios HTML y respuestas JSON para clientes API.

## Entidades del sistema

1. `usuarios`
2. `aerolineas`
3. `pistas`
4. `torres_control`
5. `aviones`
6. `tripulaciones`
7. `vuelos`
8. `asignaciones_vuelo`

## Requisitos previos

- **Node.js** (v18 o superior recomendado)
- **MySQL / MariaDB** (puede ser local, XAMPP u otro servidor MySQL)
- **Git**

## Instalación y puesta en marcha

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
cd TU_REPOSITORIO
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia `.env.example` a `.env` y completa tus datos locales:
```bash
cp .env.example .env
```
*(En Windows PowerShell puedes usar `Copy-Item .env.example .env`)*.

Edita `.env`:
```env
PORT=4001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=aeropuerto_db
JWT_SECRET=una_clave_jwt_larga_y_segura
ROOT_KEY=tu_clave_root_segura
```

### 4. Preparar la base de datos MySQL
Asegúrate de que el servicio MySQL esté encendido y crea la base de datos (si el proyecto no la crea automáticamente, créala antes de arrancar):
```sql
CREATE DATABASE IF NOT EXISTS aeropuerto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Iniciar el servidor
```bash
npm start
```
*(O `npm run dev` si tienes configurado `nodemon` en `package.json`).*

Una vez iniciado, abre en el navegador:
- Login: `http://localhost:4001/login`
- Panel principal: `http://localhost:4001/dashboard`

## Ejemplos de uso

### Uso desde la interfaz web
1. Entra a `http://localhost:4001/login`.
2. Inicia sesión con `usuario: root` y el valor de `ROOT_KEY` configurado en `.env`.
3. Ve a **Usuarios** (`/usuarios-panel`) para crear cuentas con rol `admind` o `user`.
4. Registra una **Aerolínea**, una **Pista** en estado `'Operativa'`, una **Torre de Control** y un **Avión**.
5. Entra a **Vuelos** (`/gestion/vuelos`) y programa un vuelo seleccionando la pista operativa.
6. Cierra sesión y prueba iniciar sesión con un usuario de rol `user` para verificar que solo puede actualizar el estado del vuelo y no crear/borrar registros ni entrar a `/usuarios-panel`.

### Ejemplos de consumo API (JSON)

#### 1. Iniciar sesión (obtiene token JWT)
```http
POST http://localhost:4001/usuarios/login
Content-Type: application/json

{
  "username": "root",
  "password": "tu_clave_root_segura"
}
```

#### 2. Crear una pista operativa
```http
POST http://localhost:4001/pistas/agregar
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT

{
  "codigo_pista": "09L/27R",
  "longitud_metros": 3200,
  "estado": "Operativa"
}
```

#### 3. Programar un vuelo (requiere `id_pista` de una pista `'Operativa'`)
```http
POST http://localhost:4001/vuelos/agregar
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT

{
  "codigo_vuelo": "3V-104",
  "origen": "CCS - Caracas",
  "destino": "VLN - Valencia",
  "hora_salida": "2026-12-01T08:30",
  "estado_vuelo": "Programado",
  "id_avion": 1,
  "id_pista": 1,
  "id_torre": 1
}
```

#### 4. Actualizar estado de un vuelo (permitido también para `user`)
```http
POST http://localhost:4001/vuelos/actualizar/1
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT_USER

{
  "estado_vuelo": "En Aire"
}
```
