const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para carga de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

function createTables() {
  // Crear tablas si no existen
  pool.query(`
    CREATE TABLE IF NOT EXISTS instituciones (
      id_institucion SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creando tabla instituciones:', err);
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS estudiantes (
      id_estudiante SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      foto VARCHAR(255),
      id_institucion INTEGER REFERENCES instituciones(id_institucion) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creando tabla estudiantes:', err);
  });
}

createTables();

// Rutas para Instituciones
app.get('/api/instituciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM instituciones');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/instituciones', async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query('INSERT INTO instituciones (nombre) VALUES ($1) RETURNING id_institucion', [nombre]);
    res.json({ id: result.rows[0].id_institucion, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/instituciones/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    await pool.query('UPDATE instituciones SET nombre = $1 WHERE id_institucion = $2', [nombre, id]);
    res.json({ message: 'Institución actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/instituciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM instituciones WHERE id_institucion = $1', [id]);
    res.json({ message: 'Institución eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas para Estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, i.nombre AS institucion_nombre
      FROM estudiantes e
      LEFT JOIN instituciones i ON e.id_institucion = i.id_institucion
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/estudiantes', upload.single('foto'), async (req, res) => {
  const { nombre, id_institucion } = req.body;
  const foto = req.file ? req.file.filename : null;
  console.log('POST /api/estudiantes body=', req.body, 'file=', req.file ? req.file.filename : null);
  try {
    const result = await pool.query('INSERT INTO estudiantes (nombre, foto, id_institucion) VALUES ($1, $2, $3) RETURNING id_estudiante', [nombre, foto, id_institucion]);
    res.json({ id: result.rows[0].id_estudiante, nombre, foto, id_institucion });
  } catch (err) {
    console.error('Error en POST /api/estudiantes', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/estudiantes/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nombre, id_institucion } = req.body;
  const foto = req.file ? req.file.filename : null;
  try {
    let query = 'UPDATE estudiantes SET nombre = $1, id_institucion = $2';
    let params = [nombre, id_institucion];
    if (foto) {
      query += ', foto = $3';
      params.push(foto);
    }
    query += ' WHERE id_estudiante = $' + (params.length + 1);
    params.push(id);
    await pool.query(query, params);
    res.json({ message: 'Estudiante actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/estudiantes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM estudiantes WHERE id_estudiante = $1', [id]);
    res.json({ message: 'Estudiante eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});