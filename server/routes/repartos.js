const express = require('express');
const router = express.Router();
const db = require('../db');

// Mapeo de estados para convertir entre entero y string
const estadosMap = {
    1: 'En Proceso',
    2: 'Entregado',
    3: 'Cancelado'
};

// Mapeo inverso para convertir de string a entero
const estadoAValor = {
    'En Proceso': 1,
    'Entregado': 2,
    'Cancelado': 3
};

// Obtener repartos (pedidos) filtrados por fecha de entrega
router.get('/', async (req, res) => {
    try {
        const { fecha } = req.query; // Recibir la fecha en formato YYYY-MM-DD desde la query string

        // Consulta SQL para obtener los repartos (pedidos) junto con la información del cliente
        let query = `
            SELECT p.IDPedido, c.Nombre AS Cliente, p.DireccionEntrega, p.CantidadSodas, 
            p.Observaciones, p.EstadoPedido, p.FechaEntrega
            FROM Pedidos p
            JOIN Clientes c ON p.IDCliente = c.IDCliente
        `;

        // Si se pasa la fecha, agregamos una condición al WHERE para filtrar por FechaEntrega
        const params = [];
        if (fecha) {
            query += ` WHERE p.FechaEntrega = ?`;
            params.push(fecha);
        }

        const [rows] = await db.query(query, params);

        // Convertir el valor entero del estado al string correspondiente
        rows.forEach(reparto => {
            reparto.EstadoPedido = estadosMap[reparto.EstadoPedido];
        });

        // Retorna los repartos (pedidos) filtrados junto con los nombres de los clientes
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener repartos:', error);
        res.status(500).json({ message: 'Error al obtener los repartos', error });
    }
});

// Modificar el estado de un reparto
router.put('/:idPedido/estado', async (req, res) => {
    try {
        const { idPedido } = req.params; // ID del pedido (reparto) que se va a modificar
        const { nuevoEstado } = req.body; // Estado nuevo que recibimos en el cuerpo de la solicitud

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
        console.error('Error al actualizar el estado del reparto:', error);
        res.status(500).json({ message: 'Error al actualizar el estado del reparto', error });
    }
});



module.exports = router;
