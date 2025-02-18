const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3001;

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tienda',
});

db.connect(err => {
  if (err) {
    console.error('Error de conexión a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// Rutas para productos
// ============================

// Obtener todos los productos
app.get('/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los productos');
      return;
    }
    res.json(results);
  });
});

// Agregar un nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, precio, imagen, descripcion } = req.body;
  const query = 'INSERT INTO productos (nombre, precio, imagen, descripcion) VALUES (?, ?, ?, ?)';
  db.query(query, [nombre, precio, imagen, descripcion], (err) => {
    if (err) {
      res.status(500).send('Error al agregar el producto');
      return;
    }
    res.status(201).json({ mensaje: 'Producto agregado exitosamente' });
  });
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      res.status(500).send('Error al eliminar el producto');
      return;
    }
    res.status(200).json({ mensaje: 'Producto eliminado exitosamente' });
  });
});

// Modificar un producto
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, descripcion } = req.body;
  const query = 'UPDATE productos SET nombre = ?, precio = ?, imagen = ?, descripcion = ? WHERE id = ?';
  db.query(query, [nombre, precio, imagen, descripcion, id], (err) => {
    if (err) {
      res.status(500).send('Error al modificar el producto');
      return;
    }
    res.status(200).json({ mensaje: 'Producto modificado exitosamente' });
  });
});

// ============================
// Rutas para usuarios
// ============================

// Obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  const query = 'SELECT id, name, email, rol FROM usuarios';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los usuarios');
      return;
    }
    res.json(results);
  });
});

// Registrar un usuario
app.post('/usuarios', (req, res) => {
  const { name, email, password, rol = 0 } = req.body;

  if (!name || !email || !password) {
    res.status(400).send('Todos los campos son obligatorios');
    return;
  }

  const query = 'INSERT INTO usuarios (name, email, password, rol) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, password, rol], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).send('El correo ya está registrado');
      } else {
        res.status(500).send('Error al registrar el usuario');
      }
      return;
    }
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  });
});

// Modificar un usuario (incluye la modificación del rol)
app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, rol } = req.body;

  if (!name || !email || !password || rol === undefined) {
    res.status(400).send('Todos los campos son obligatorios');
    return;
  }

  const query = 'UPDATE usuarios SET name = ?, email = ?, password = ?, rol = ? WHERE id = ?';
  db.query(query, [name, email, password, rol, id], (err, results) => {
    if (err) {
      res.status(500).send('Error al actualizar el usuario');
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send('Usuario no encontrado');
    } else {
      res.status(200).json({ mensaje: 'Usuario actualizado exitosamente' });
    }
  });
});

// Eliminar un usuario
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM usuarios WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error al eliminar el usuario');
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send('Usuario no encontrado');
    } else {
      res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
    }
  });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      res.status(500).send('Error al iniciar sesión');
      return;
    }

    if (results.length > 0) {
      const usuario = results[0];
      // Asignar rol 0 (usuario normal) si el campo rol está vacío o indefinido
      if (usuario.rol === undefined || usuario.rol === null) {
        usuario.rol = 0;
      }
      res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario });
    } else {
      res.status(401).send('Credenciales incorrectas');
    }
  });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


