# Sistema CRUD Instituciones y Estudiantes

Este proyecto implementa un sistema CRUD completo para gestionar instituciones y estudiantes usando Express.js y MySQL, con carga de imágenes.

## Requisitos

- Node.js
- MySQL

## Instalación

1. Clona o descarga el proyecto.
2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura la base de datos PostgreSQL:
   - Instala PostgreSQL localmente o usa un servicio como ElephantSQL.
   - Crea una base de datos llamada `crud_instituciones`.
   - Actualiza `DATABASE_URL` en `.env` con tu conexión (ej: `postgresql://user:pass@localhost:5432/crud_instituciones`).
   - Las tablas se crean automáticamente al iniciar el servidor.

4. Ejecuta el servidor:
   ```
   npm run dev
   ```

5. Abre `index.html` en tu navegador para usar la interfaz web.

## Endpoints API

### Instituciones

- `GET /api/instituciones` - Obtener todas las instituciones
- `POST /api/instituciones` - Crear una institución (body: { nombre })
- `PUT /api/instituciones/:id` - Actualizar una institución
- `DELETE /api/instituciones/:id` - Eliminar una institución

### Estudiantes

- `GET /api/estudiantes` - Obtener todos los estudiantes con su institución
- `POST /api/estudiantes` - Crear un estudiante (form-data: nombre, id_institucion, foto)
- `PUT /api/estudiantes/:id` - Actualizar un estudiante
- `DELETE /api/estudiantes/:id` - Eliminar un estudiante

## Despliegue

### 🚂 Railway (Recomendado - Fácil y Gratuito)
Railway ofrece PostgreSQL integrado y despliegue automático desde GitHub.

1. **Sube tu código a GitHub:**
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tuusuario/tu-repo.git
   git push -u origin main
   ```

2. **Conecta a Railway:**
   - Ve a [railway.app](https://railway.app) y crea cuenta
   - Click "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repo

3. **Configura PostgreSQL:**
   - Railway crea automáticamente una DB PostgreSQL
   - Ve a "Variables" en tu proyecto y copia la `DATABASE_URL`
   - Railway la configura automáticamente, no necesitas cambiar nada

4. **Despliegue:**
   - Railway detecta `package.json` y despliega automáticamente
   - Tu app estará en `https://tu-proyecto.up.railway.app`

### 🐘 ElephantSQL (PostgreSQL como Servicio)
Si prefieres PostgreSQL separado:
- Crea cuenta en [elephantsql.com](https://elephantsql.com)
- Crea una instancia gratuita
- Copia la URL de conexión
- En Railway, agrega como variable de entorno: `DATABASE_URL=tu_url_de_elephantsql`

### ☁️ Otras Opciones
- **Heroku**: Similar a Railway, pero con add-ons para PostgreSQL
- **Vercel**: Para frontend, backend limitado
- **AWS/Azure**: Más complejos pero potentes

## Notas

- Las imágenes se almacenan localmente en `uploads/`. En producción, considera usar un servicio de almacenamiento en la nube.
- La eliminación de una institución también elimina sus estudiantes asociados (ON DELETE CASCADE).