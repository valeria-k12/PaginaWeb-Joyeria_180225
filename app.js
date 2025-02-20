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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Obtener todos los productos
app.get('/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener los productos:', err);
          res.status(500).send('Error al obtener los productos');
          return;
      }
      res.json(results);
  });
});

// Agregar un producto
app.post('/productos', (req, res) => {
  console.log('Datos recibidos para agregar producto:', req.body);
  const { nombre, precio, imagen, descripcion } = req.body;
  const query = 'INSERT INTO productos (nombre, precio, imagen, descripcion) VALUES (?, ?, ?, ?)';
  db.query(query, [nombre, precio, imagen, descripcion], (err, results) => {
      if (err) {
          console.error('Error al agregar producto:', err);
          res.status(500).send('Error al agregar el producto');
          return;
      }
      console.log('Producto agregado exitosamente:', results);
      res.status(201).json({ mensaje: 'Producto agregado exitosamente' });
  });
});

// Actualizar un producto
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, descripcion } = req.body;
  const query = 'UPDATE productos SET nombre = ?, precio = ?, imagen = ?, descripcion = ? WHERE id = ?';
  db.query(query, [nombre, precio, imagen, descripcion, id], (err, results) => {
      if (err) {
          console.error('Error al actualizar producto:', err);
          res.status(500).send('Error al actualizar el producto');
          return;
      }
      if (results.affectedRows === 0) {
          res.status(404).send('Producto no encontrado');
      } else {
          console.log('Producto actualizado exitosamente:', results);
          res.status(200).json({ mensaje: 'Producto actualizado exitosamente' });
      }
  });
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = ?';
  db.query(query, [id], (err, results) => {
      if (err) {
          console.error('Error al eliminar producto:', err);
          res.status(500).send('Error al eliminar el producto');
          return;
      }
      if (results.affectedRows === 0) {
          res.status(404).send('Producto no encontrado');
      } else {
          console.log('Producto eliminado exitosamente:', results);
          res.status(200).json({ mensaje: 'Producto eliminado exitosamente' });
      }
  });
});
// ============================
// Rutas para usuarios
// ============================

// Obtener todos los usuarios (sin la contraseña por seguridad)
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

// Actualizar un usuario (solo se actualiza la contraseña si se envía una nueva)
app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, rol } = req.body;

  if (!name || !email || rol === undefined) {
    res.status(400).send('El nombre, email y rol son obligatorios');
    return;
  }

  if (password && password.trim() !== '') {
    // Se actualiza también la contraseña
    const query = 'UPDATE usuarios SET name = ?, email = ?, password = ?, rol = ? WHERE id = ?';
    db.query(query, [name, email, password, rol, id], (err, results) => {
      if (err) {
        res.status(500).send('Error al actualizar el usuario');
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send('Usuario no encontrado');
      } else {
        res.status(200).json({ mensaje: 'Usuario actualizado exitosamente (con nueva contraseña)' });
      }
    });
  } else {
    // Se actualizan solo los demás campos y se conserva la contraseña
    const query = 'UPDATE usuarios SET name = ?, email = ?, rol = ? WHERE id = ?';
    db.query(query, [name, email, rol, id], (err, results) => {
      if (err) {
        res.status(500).send('Error al actualizar el usuario');
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send('Usuario no encontrado');
      } else {
        res.status(200).json({ mensaje: 'Usuario actualizado exitosamente (sin modificar la contraseña)' });
      }
    });
  }
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

// Ruta de login (sin cambios)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Email y contraseña son obligatorios');
    return;
  }
  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      res.status(500).send('Error al iniciar sesión');
      return;
    }
    if (results.length > 0) {
      const usuario = results[0];
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
