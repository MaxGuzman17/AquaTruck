const express = require('express');
const router = express.Router();
const db = require('../db');

// Mapeo de estados para convertir entre entero y string
const estadosMap = {
    1: 'En Proceso',
    2: 'Entregado',
    3: 'Cancelado'
};

const estadoAValor = {
    'En Proceso': 1,
    'Entregado': 2,
    'Cancelado': 3
};

// Obtener todos los pedidos 
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.IDPedido, c.Nombre AS Cliente, p.FechaPedido, p.FechaEntrega, 
            p.CantidadSodas, p.EstadoPedido, p.DireccionEntrega, p.Observaciones
            FROM Pedidos p
            JOIN Clientes c ON p.IDCliente = c.IDCliente
        `;
        const [rows] = await db.query(query);
        
        // Convertir el valor entero del estado al string correspondiente
        rows.forEach(pedido => {
            pedido.EstadoPedido = estadosMap[pedido.EstadoPedido];
        });

        res.json(rows); // Retorna todos los pedidos con el estado mapeado
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
});

// Obtener un pedido por ID 
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.IDPedido, c.Nombre AS IDCliente, p.FechaPedido, p.FechaEntrega, 
            p.CantidadSodas, p.EstadoPedido, p.DireccionEntrega, p.Observaciones
            FROM Pedidos p
            JOIN Clientes c ON p.IDCliente = c.IDCliente
            WHERE p.IDPedido = ?
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length > 0) {
            const pedido = rows[0];
            // Convertir el valor entero del estado al string correspondiente
            pedido.EstadoPedido = estadosMap[pedido.EstadoPedido];
            res.json(pedido); // Retorna el pedido con el estado mapeado
        } else {
            res.status(404).json({ message: 'Pedido no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el pedido', error });
    }
});

// Agregar un nuevo pedido
router.post('/', async (req, res) => {
    try {
        const { idCliente, fechaEntrega, cantidadSodas, estadoPedido, observaciones } = req.body;

        // Verificación de datos básicos
        if (!idCliente || !cantidadSodas || !estadoPedido) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados' });
        }

        // Obtener la fecha actual para el pedido
        const fechaPedido = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const estadoPedidoValor = estadoAValor[estadoPedido]; // Convertir a valor entero

        const query = `
            INSERT INTO Pedidos (IDCliente, FechaPedido, FechaEntrega, CantidadSodas, EstadoPedido, Observaciones) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [idCliente, fechaPedido, fechaEntrega, cantidadSodas, estadoPedidoValor, observaciones]);

        res.status(201).json({ message: 'Pedido agregado correctamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el pedido', error });
    }
});



// Actualizar un pedido existente
router.put('/:id', async (req, res) => {
    try {
        const { fechaEntrega, cantidadSodas, direccionEntrega, observaciones, estadoPedido } = req.body;

        // Verificación de datos básicos
        if (!fechaEntrega || !cantidadSodas || !estadoPedido) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados' });
        }

        const estadoPedidoValor = estadoAValor[estadoPedido]; // Convertir a valor entero

        const query = `
            UPDATE Pedidos 
            SET FechaEntrega = ?, CantidadSodas = ?, DireccionEntrega = ?, Observaciones = ?, EstadoPedido = ?
            WHERE IDPedido = ?
        `;
        const [result] = await db.query(query, [fechaEntrega, cantidadSodas, direccionEntrega, observaciones, estadoPedidoValor, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el pedido', error });
    }
});

// Eliminar un pedido
router.delete('/:id', async (req, res) => {
    const pedidoId = req.params.id;

    try {
        // Verificar el estado del pedido
        const [rows] = await db.query('SELECT EstadoPedido FROM Pedidos WHERE IDPedido = ?', [pedidoId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const pedido = rows[0];

        // Verificar si el estado es 'En Proceso' (valor 1)
        if (pedido.EstadoPedido !== 1) {
            return res.status(400).json({
                message: 'Solo se puede eliminar un pedido si está en estado "En Proceso".'
            });
        }

        // Si el estado es 'En Proceso', proceder a eliminar el pedido
        const [result] = await db.query('DELETE FROM Pedidos WHERE IDPedido = ?', [pedidoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        res.status(500).json({ message: 'Error al eliminar el pedido', error });
    }
});


// Modificar el estado de un pedido
router.put('/:idPedido/estado', async (req, res) => {
    try {
        const { idPedido } = req.params;
        const { nuevoEstado } = req.body;

        // Validar que el estado enviado es válido
        if (!estadoAValor[nuevoEstado]) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        // Convertir el estado a su valor numérico correspondiente
        const estadoValor = estadoAValor[nuevoEstado];

        // Consulta para actualizar el estado del pedido
        const query = `UPDATE Pedidos SET EstadoPedido = ? WHERE IDPedido = ?`;
        const [result] = await db.query(query, [estadoValor, idPedido]);

        // Comprobar si se ha actualizado alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Responder con éxito
        res.json({ message: 'Estado del pedido actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
    }
});

module.exports = router;
