const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Endpoint para iniciar sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Verificar si el usuario existe en la base de datos
        const [rows] = await db.query('SELECT * FROM Usuarios WHERE NombreUsuario = ?', [username]);

        // Si el usuario no existe, responder con un error
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        // Verificar la contraseña de manera directa
        if (user.Contraseña !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar un token JWT si la autenticación es correcta
        const token = jwt.sign(
            { id: user.IDUsuario, username: user.NombreUsuario },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // El token expira en 2 horas
        );

        res.json({ token, message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
});

module.exports = router;
