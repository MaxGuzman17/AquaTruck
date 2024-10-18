const express = require('express');
const router = express.Router();
const db = require('../db');

// Mapa para convertir entre estados numéricos y sus descripciones
const estadoCuentaMap = {
    0: 'Abierta',
    1: 'Cerrada',
    2: 'Suspendida'
};

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Clientes');

        // Convertimos el estado numérico a texto antes de enviar la respuesta
        rows.forEach(cliente => {
            cliente.EstadoCuenta = estadoCuentaMap[cliente.EstadoCuenta];
        });

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ message: 'Error al obtener los clientes' });
    }
});

// Obtener un cliente por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM Clientes WHERE IDCliente = ?', [id]);

        if (rows.length > 0) {
            const cliente = rows[0];
            cliente.EstadoCuenta = estadoCuentaMap[cliente.EstadoCuenta]; // Convertimos el estado numérico a texto
            res.json(cliente);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el cliente:', error);
        res.status(500).json({ message: 'Error al obtener el cliente' });
    }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
    const { nombre, direccion, telefono, email, cantidadInicialSodas, estadoCuenta } = req.body;
    const cantidadActualSodas = cantidadInicialSodas || 0;

    // Convertir el estado de cuenta textual a su valor numérico
    const estadoCuentaNumero = Object.keys(estadoCuentaMap).find(key => estadoCuentaMap[key] === estadoCuenta) || 0; // Abierta por defecto

    try {
        const result = await db.query(
            'INSERT INTO Clientes (Nombre, Direccion, Telefono, Email, CantidadInicialSodas, CantidadActualSodas, EstadoCuenta) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, direccion, telefono, email, cantidadInicialSodas, cantidadActualSodas, estadoCuentaNumero]
        );

        const newClienteId = result[0].insertId;
        res.status(201).json({ message: 'Cliente agregado correctamente', IDCliente: newClienteId });
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'El email ya está registrado' });
        } else {
            res.status(500).json({ message: 'Error al agregar cliente' });
        }
    }
});

// Actualizar un cliente por ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { direccion, telefono, email, cantidadActualSodas, estadoCuenta } = req.body;

    const estadoCuentaNumero = Object.keys(estadoCuentaMap).find(key => estadoCuentaMap[key] === estadoCuenta);

    try {
        const [result] = await db.query(
            'UPDATE Clientes SET Direccion = ?, Telefono = ?, Email = ?, CantidadActualSodas = ?, EstadoCuenta = ? WHERE IDCliente = ?',
            [direccion, telefono, email, cantidadActualSodas, estadoCuentaNumero, id]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Cliente actualizado correctamente' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'El email ya está registrado' });
        } else {
            res.status(500).json({ message: 'Error al actualizar cliente' });
        }
    }
});


// Eliminar un cliente por ID
router.delete('/:id', async (req, res) => {
    const clienteId = req.params.id;

    try {
        // Verificar si el cliente tiene pedidos asociados
        const [pedidos] = await db.query('SELECT * FROM Pedidos WHERE IDCliente = ?', [clienteId]);

        if (pedidos.length > 0) {
            // Si existen pedidos, no se permite eliminar el cliente
            return res.status(400).json({
                message: 'No se puede eliminar el cliente, tiene pedidos asociados.'
            });
        }

        // Si no tiene pedidos asociados, proceder a eliminar el cliente
        const [result] = await db.query('DELETE FROM Clientes WHERE IDCliente = ?', [clienteId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({ message: 'Error al eliminar el cliente', error });
    }
});


module.exports = router;
