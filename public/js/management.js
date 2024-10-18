document.addEventListener('DOMContentLoaded', () => {
    const contentBody = document.getElementById('contentBody');
    const toggleButton = document.getElementById('toggleMenu');
    const menu = document.getElementById('miMenu');
    const fondoOscuro = document.getElementById('fondoOscuro');
    const logoutButton = document.getElementById('logoutButton');
    const userNameElement = document.getElementById('userName');
    const filtroClientes = document.getElementById('filtroClientes');
    const filtroPedidos = document.getElementById('filtroPedidos');
    

    // Variables para Clientes
    const itemsPerPageClientes = 30;
    let currentPageClientes = 1;
    let allClientes = [];

    // Variables para Pedidos
    const itemsPerPagePedidos = 30;
    let currentPagePedidos = 1;
    let allPedidos = [];

    // Variables para Repartos
    const itemsPerPageRepartos = 30;
    let currentPageRepartos = 1;
    let allRepartos = [];

    // Evento para abrir/cerrar el menú
    toggleButton.onclick = function() {
        if (menu.classList.contains('abierto')) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    };

    // Mostrar vistas según el menú lateral
    menu.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.tagName === 'A') {
            const vista = event.target.getAttribute('data-vista');
            mostrarVista(vista);
        }
    });
    
    //función formato de fecha
    function formatearFecha(fecha) {
        const dia = String(fecha.getDate()).padStart(2, '0'); 
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
        const año = fecha.getFullYear(); 
        return `${dia}-${mes}-${año}`; 
    }
    

    // Función para abrir el menú
    function abrirMenu() {
        menu.classList.add('abierto');
        fondoOscuro.classList.add('activo');
        toggleButton.classList.add('menu-abierto');
    }

    // Función para cerrar el menú
    function cerrarMenu() {
        menu.classList.remove('abierto');
        fondoOscuro.classList.remove('activo');
        toggleButton.classList.remove('menu-abierto');
    }

    // Función para cerrar la sesión
    logoutButton.onclick = function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };

    // Función para Fechas
    function formatearFecha(fecha) {
        const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0, por eso sumamos 1
        const año = fecha.getFullYear(); // Obtén el año
        return `${dia}-${mes}-${año}`; // Retorna la fecha en formato DD-MM-YYYY
    }

 // Función para mostrar la vista seleccionada
function mostrarVista(vista) {
    cerrarMenu();
    
    // Ocultar la sección de bienvenida
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.classList.add('hidden');
    }

    // Ocultar todas las vistas
    document.getElementById('vistaClientes').style.display = 'none';
    document.getElementById('vistaPedidos').style.display = 'none';
    document.getElementById('vistaRepartos').style.display = 'none';

    // Mostrar la vista seleccionada
    if (vista === 'clientes') {
        document.getElementById('vistaClientes').style.display = 'block';
        cargarClientes();
    } else if (vista === 'pedidos') {
        document.getElementById('vistaPedidos').style.display = 'block';
        cargarPedidos();
    } else if (vista === 'repartos') {
        document.getElementById('vistaRepartos').style.display = 'block';
        cargarRepartos();
    }
}


    // Función para cargar clientes
    async function cargarClientes() {
        try {
            const response = await fetch('http://localhost:3000/api/clientes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar los clientes');
            allClientes = await response.json();
            mostrarClientes(allClientes);
        } catch (error) {
            console.error('Error al cargar los clientes:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los clientes',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    // Función para mostrar clientes con paginación y filtro
    function mostrarClientes(clientes) {
        const startIndex = (currentPageClientes - 1) * itemsPerPageClientes;
        const paginatedClients = clientes.slice(startIndex, startIndex + itemsPerPageClientes);

        let html = `
            <table class="customers-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Cant. Inicial Sodas</th>
                        <th>Cant. Actual Sodas</th>
                        <th>Estado Cuenta</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        paginatedClients.forEach(cliente => {
            html += `
                <tr>
                    <td>${cliente.IDCliente}</td>
                    <td>${cliente.Nombre}</td>
                    <td>${cliente.Direccion}</td>
                    <td>${cliente.Telefono}</td>
                    <td>${cliente.Email}</td>
                    <td>${cliente.CantidadInicialSodas}</td>
                    <td>${cliente.CantidadActualSodas}</td>
                    <td>${cliente.EstadoCuenta}</td>
                    <td>
                        <button onclick="verCliente(${cliente.IDCliente})" class="boton-accion"><i class="fas fa-eye"></i></button>
                        <button onclick="abrirModalModificarCliente(${cliente.IDCliente})" class="boton-accion"><i class="fas fa-edit"></i></button>
                        <button onclick="eliminarCliente(${cliente.IDCliente})" class="boton-accion"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        document.getElementById('clientesList').innerHTML = html;
        document.getElementById('vistaClientes').style.display = 'block';
    }

    // Función para cargar pedidos
    async function cargarPedidos() {
        try {
            const response = await fetch('http://localhost:3000/api/pedidos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar los pedidos');
            allPedidos = await response.json();
            mostrarPedidos(allPedidos);
        } catch (error) {
            console.error('Error al cargar los pedidos:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los pedidos',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

// Función para mostrar pedidos con paginación
function mostrarPedidos(pedidos) {
    const startIndex = (currentPagePedidos - 1) * itemsPerPagePedidos;
    const paginatedPedidos = pedidos.slice(startIndex, startIndex + itemsPerPagePedidos);
    
    let html = `
        <table class="customers-table">
            <thead>
                <tr>
                    <th>ID Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha Entrega</th>
                    <th>Cantidad de Sodas</th>
                    <th>Dirección de Entrega</th>
                    <th>Observaciones</th>
                    <th>Estado del Pedido</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedPedidos.forEach(pedido => {
        // Formatear las fechas en formato DD-MM-YYYY
        const fechaEntrega = formatearFecha(new Date(pedido.FechaEntrega));
        
        // Definir la clase CSS según el estado del pedido
        let estadoClass = '';
        if (pedido.EstadoPedido === 'En Proceso') {
            estadoClass = 'estado-en-proceso';
        } else if (pedido.EstadoPedido === 'Entregado') {
            estadoClass = 'estado-entregado';
        } else if (pedido.EstadoPedido === 'Cancelado') {
            estadoClass = 'estado-cancelado';
        }

        html += `
            <tr>
                <td>${pedido.IDPedido}</td>
                <td>${pedido.Cliente}</td> <!-- Muestra el nombre del cliente en lugar del ID -->
                <td>${fechaEntrega}</td>
                <td>${pedido.CantidadSodas}</td>
                <td>${pedido.DireccionEntrega || 'N/A'}</td> <!-- Muestra 'N/A' si no hay dirección -->
                <td>${pedido.Observaciones || 'Ninguna'}</td> <!-- Muestra 'Ninguna' si no hay observaciones -->
                <td>
                    <select id="selectEstadoPedido-${pedido.IDPedido}" class="${estadoClass}" onchange="cambiarEstadoPedido(${pedido.IDPedido})">
                        <option value="En Proceso" ${pedido.EstadoPedido === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="Entregado" ${pedido.EstadoPedido === 'Entregado' ? 'selected' : ''}>Entregado</option>
                        <option value="Cancelado" ${pedido.EstadoPedido === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <button onclick="verPedido(${pedido.IDPedido})" class="boton-accion"><i class="fas fa-eye"></i></button>
                    <button onclick="abrirModalModificarPedido(${pedido.IDPedido})" class="boton-accion"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarPedido(${pedido.IDPedido})" class="boton-accion"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    document.getElementById('pedidosList').innerHTML = html;
    document.getElementById('vistaPedidos').style.display = 'block';
}


// Modificar la función cargarRepartos para que guarde todos los repartos
async function cargarRepartos() {
    try {
        const response = await fetch('http://localhost:3000/api/repartos', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al cargar los repartos');
        allRepartos = await response.json(); // Guardar todos los repartos en la variable global
        filtrarRepartosPorFecha(); // Aplicar el filtro de fecha al cargar
    } catch (error) {
        console.error('Error al cargar los repartos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los repartos',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}


    // Función para mostrar repartos
    function mostrarRepartos(repartos) {
        let html = `
            <table class="customers-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Dirección de Entrega</th>
                        <th>Cantidad de Sodas</th>
                        <th>Observaciones</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;
    
        repartos.forEach(reparto => {
            let estadoClass = '';
            if (reparto.EstadoPedido === 'En Proceso') {
                estadoClass = 'estado-en-proceso';
            } else if (reparto.EstadoPedido === 'Entregado') {
                estadoClass = 'estado-entregado';
            } else if (reparto.EstadoPedido === 'Cancelado') {
                estadoClass = 'estado-cancelado';
            }
    
            html += `
                <tr>
                    <td>${reparto.Cliente || 'Sin cliente'}</td>
                    <td>${reparto.DireccionEntrega || 'Sin dirección'}</td>
                    <td>${reparto.CantidadSodas}</td>
                    <td>${reparto.Observaciones || 'Ninguna'}</td>
                    <td>
                        <select id="selectEstadoReparto-${reparto.IDPedido}" class="${estadoClass}" onchange="cambiarEstadoReparto(${reparto.IDPedido})">
                            <option value="En Proceso" ${reparto.EstadoPedido === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                            <option value="Entregado" ${reparto.EstadoPedido === 'Entregado' ? 'selected' : ''}>Entregado</option>
                            <option value="Cancelado" ${reparto.EstadoPedido === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="verPedido(${reparto.IDPedido})" class="boton-accion"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `;
        });
    
        html += `</tbody></table>`;
        document.getElementById('repartosList').innerHTML = html;
    }
    
    
//Cambiar estado reparto
    async function cambiarEstadoReparto(idPedido) {
        const selectElement = document.getElementById(`selectEstadoReparto-${idPedido}`);
        const nuevoEstado = selectElement.value; // Obtener el nuevo estado seleccionado
    
        try {
            const response = await fetch(`http://localhost:3000/api/repartos/${idPedido}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nuevoEstado })
            });
    
            if (response.ok) {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Estado del reparto actualizado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                cargarRepartos(); // Recargar la lista de repartos
            } else {
                const data = await response.json();
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'No se pudo actualizar el estado del reparto',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        } catch (error) {
            console.error('Error al actualizar el estado del reparto:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al conectar con el servidor.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }
    
    //cambiar estado pedido
    async function cambiarEstadoPedido(idPedido) {
        const selectElement = document.getElementById(`selectEstadoPedido-${idPedido}`);
        const nuevoEstado = selectElement.value;
    
        try {
            const response = await fetch(`http://localhost:3000/api/pedidos/${idPedido}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nuevoEstado })
            });
    
            if (response.ok) {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Estado del pedido actualizado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                cargarPedidos(); // Recargar la lista de pedidos
            } else {
                const data = await response.json();
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'No se pudo actualizar el estado del pedido',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        } catch (error) {
            console.error('Error al actualizar el estado del pedido:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al conectar con el servidor.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }
    
    
       // Función para filtrar clientes
        filtroClientes.addEventListener('input', () => {
        const filtro = filtroClientes.value.toLowerCase();
        const clientesFiltrados = allClientes.filter(cliente =>
            cliente.Nombre.toLowerCase().includes(filtro) ||
            cliente.Email.toLowerCase().includes(filtro) ||
            cliente.Direccion.toLowerCase().includes(filtro)
        );
        currentPageClientes = 1;
        mostrarClientes(clientesFiltrados);
    });
    
        // Función para filtrar pedidos
        filtroPedidos.addEventListener('input', () => {
            const filtro = filtroPedidos.value.toLowerCase();
        
            // Filtrar pedidos solo por el nombre del cliente
            const pedidosFiltrados = allPedidos.filter(pedido => {
                const clienteNombre = pedido.Cliente ? pedido.Cliente.toLowerCase() : '';
        
                // Filtrar solo por nombre de cliente
                return clienteNombre.includes(filtro);
            });
        
            currentPagePedidos = 1;
            mostrarPedidos(pedidosFiltrados);
        });
        
        

// Función para filtrar repartos por fecha
function filtrarRepartosPorFecha() {
    const filtroRepartosElement = document.getElementById('filtroRepartos');

    // Verifica si el elemento existe en el DOM
    if (!filtroRepartosElement) {
        console.error("El campo de filtro de repartos no está presente en el DOM.");
        return;
    }

    const fechaSeleccionada = filtroRepartosElement.value; // Valor en formato YYYY-MM-DD

    if (!fechaSeleccionada) {
        document.getElementById('repartosList').innerHTML = '';
        return; // Si no se selecciona ninguna fecha, no muestra nada
    }

    // Filtrar los repartos cuya fecha coincida con la seleccionada
    const repartosFiltrados = allRepartos.filter(reparto => {
        // Verificamos si la propiedad FechaEntrega está definida
        if (reparto.FechaEntrega) {
            const fechaEntrega = reparto.FechaEntrega.split('T')[0]; // Extraemos la parte de la fecha (YYYY-MM-DD)
            return fechaEntrega === fechaSeleccionada; // Comparamos directamente en formato YYYY-MM-DD
        }
        // Si no tiene FechaEntrega, no lo mostramos
        return false;
    });

    // Si no hay repartos para la fecha seleccionada
    if (repartosFiltrados.length === 0) {
        document.getElementById('repartosList').innerHTML = '<p>No hay repartos para la fecha seleccionada.</p>';
        return;
    }

    mostrarRepartos(repartosFiltrados); // Muestra los repartos filtrados
}


    // Función para ver un cliente
    async function verCliente(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Cliente no encontrado');
            const cliente = await response.json();
            Swal.fire({
                title: `Cliente: ${cliente.Nombre}`,
                html: `
                    <p><strong>Dirección:</strong> ${cliente.Direccion}</p>
                    <p><strong>Teléfono:</strong> ${cliente.Telefono}</p>
                    <p><strong>Email:</strong> ${cliente.Email}</p>
                    <p><strong>Cantidad Inicial de Sodas:</strong> ${cliente.CantidadInicialSodas}</p>
                    <p><strong>Cantidad Actual de Sodas:</strong> ${cliente.CantidadActualSodas}</p>
                    <p><strong>Estado Cuenta:</strong> ${cliente.EstadoCuenta}</p>
                `,
                confirmButtonText: 'Cerrar'
            });
        } catch (error) {
            console.error('Error al obtener el cliente:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del cliente',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    // Función para ver un pedido
    async function verPedido(idPedido) {
        try {
            const response = await fetch(`http://localhost:3000/api/pedidos/${idPedido}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const pedido = await response.json();
            
            if (!response.ok) {
                throw new Error('No se pudo obtener el pedido');
            }
    
            // Aplicar formateo de fecha
            const fechaPedido = pedido.FechaPedido ? formatearFecha(new Date(pedido.FechaPedido)) : 'Sin fecha';
            const fechaEntrega = pedido.FechaEntrega ? formatearFecha(new Date(pedido.FechaEntrega)) : 'Sin fecha';
    
            Swal.fire({
                title: `Pedido ID: ${pedido.IDPedido}`,
                html: `
                    <p><strong>Cliente:</strong> ${pedido.IDCliente}</p>
                    <p><strong>Fecha Pedido:</strong> ${fechaPedido}</p>
                    <p><strong>Fecha Entrega:</strong> ${fechaEntrega}</p>
                    <p><strong>Cantidad de Sodas:</strong> ${pedido.CantidadSodas}</p>
                    <p><strong>Dirección de Entrega:</strong> ${pedido.DireccionEntrega || 'Sin dirección'}</p>
                    <p><strong>Observaciones:</strong> ${pedido.Observaciones || 'Ninguna'}</p>
                    <p><strong>Estado:</strong> ${pedido.EstadoPedido}</p>
                `,
                confirmButtonText: 'Cerrar'
            });
        } catch (error) {
            console.error('Error al obtener el pedido:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del pedido',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }
    



    // Función para ver un reparto
    async function verReparto(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/repartos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Reparto no encontrado');
            
            const reparto = await response.json();
    
            // Aplicar formateo de fecha
            const fechaReparto = reparto.FechaReparto ? formatearFecha(new Date(reparto.FechaReparto)) : 'Sin fecha';
    
            Swal.fire({
                title: `Reparto ID: ${reparto.IDReparto}`,
                html: `
                    <p><strong>ID Pedido:</strong> ${reparto.IDPedido}</p>
                    <p><strong>Fecha Reparto:</strong> ${fechaReparto}</p>
                    <p><strong>Cantidad de Sodas:</strong> ${reparto.CantidadSodas}</p>
                    <p><strong>Estado del Reparto:</strong> ${reparto.EstadoReparto}</p>
                `,
                confirmButtonText: 'Cerrar'
            });
        } catch (error) {
            console.error('Error al obtener el reparto:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del reparto',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }
    

    // Función para abrir el modal de agregar cliente
    function abrirModalAgregarCliente() {
        document.getElementById('modal-body').innerHTML = `
            <h2>Agregar Cliente</h2>
            <form id="formAgregarCliente">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" required>
                <label for="direccion">Dirección:</label>
                <input type="text" id="direccion" required>
                <label for="telefono">Teléfono:</label>
                <input type="text" id="telefono" required>
                <label for="email">Email:</label>
                <input type="email" id="email" required>
                <label for="cantidadInicialSodas">Cantidad Inicial de Sodas:</label>
                <input type="number" id="cantidadInicialSodas" min="0" required>
                <button type="submit">Guardar</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
        document.getElementById('formAgregarCliente').addEventListener('submit', agregarCliente);
    }

    // Función para agregar un cliente
    async function agregarCliente(event) {
        event.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const direccion = document.getElementById('direccion').value;
        const telefono = document.getElementById('telefono').value;
        const email = document.getElementById('email').value;
        const cantidadInicialSodas = parseInt(document.getElementById('cantidadInicialSodas').value, 10);

        try {
            const response = await fetch('http://localhost:3000/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nombre, direccion, telefono, email, cantidadInicialSodas })
            });
            if (!response.ok) throw new Error('No se pudo agregar el cliente');
            Swal.fire({
                title: 'Éxito',
                text: 'Cliente agregado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            cargarClientes();
            cerrarModal();
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al conectar con el servidor',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }


// Función para abrir el modal de agregar pedido
async function abrirModalAgregarPedido() {
    // Cargar los clientes para el select antes de mostrar el modal
    const clientes = await obtenerClientes();

    let optionsHtml = '';
    clientes.forEach(cliente => {
        optionsHtml += `<option value="${cliente.IDCliente}">${cliente.Nombre}</option>`;
    });

    document.getElementById('modal-body').innerHTML = `
        <h2>Agregar Pedido</h2>
        <form id="formAgregarPedido">
            <label for="idCliente">Cliente:</label>
            <input type="text" id="filtroClientesPedido" placeholder="Filtrar cliente..." class="buscador-cliente">
            <select id="idCliente" class="select-clientes" required>
                <option value="">Seleccione un cliente</option>
                ${optionsHtml}
            </select>
            

            <label for="fechaEntrega">Fecha Entrega:</label>
            <input type="date" id="fechaEntrega">

            <label for="cantidadSodas">Cantidad de Sodas:</label>
            <input type="number" id="cantidadSodas" required>

            <label for="observaciones">Observaciones:</label>
            <input type="text" id="observaciones">

            <label for="estadoPedido">Estado del Pedido:</label>
            <select id="estadoPedido" required>
                <option value="En Proceso">En Proceso</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
            </select>

            <button type="submit">Guardar</button>
        </form>
    `;
    document.getElementById('modal').style.display = 'block';

    // Asignar evento para filtrar los clientes mientras se escribe
    document.getElementById('filtroClientesPedido').addEventListener('input', filtrarClientesSelect);

    document.getElementById('formAgregarPedido').addEventListener('submit', agregarPedido);
}

// Función para obtener la lista de clientes desde el backend
async function obtenerClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/clientes', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al cargar los clientes');
        return await response.json();
    } catch (error) {
        console.error('Error al cargar los clientes:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los clientes',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return [];
    }
}

// Función para filtrar clientes en el select según lo que se escribe en el input de búsqueda
function filtrarClientesSelect() {
    const input = document.getElementById('filtroClientesPedido').value.toLowerCase();
    const select = document.getElementById('idCliente');
    const options = select.options;

    for (let i = 1; i < options.length; i++) { // Comienza en 1 para evitar el primer "Seleccione un cliente"
        const optionText = options[i].text.toLowerCase();
        if (optionText.includes(input)) {
            options[i].style.display = ''; // Mostrar opción
        } else {
            options[i].style.display = 'none'; // Ocultar opción
        }
    }
}



// Función para agregar un pedido
async function agregarPedido(event) {
    event.preventDefault();

    // Obtener los valores del formulario
    const idCliente = document.getElementById('idCliente').value;
    const fechaEntrega = document.getElementById('fechaEntrega').value || null; // Puede ser opcional
    const cantidadSodas = document.getElementById('cantidadSodas').value;
    const observaciones = document.getElementById('observaciones').value || ''; // Puede ser opcional
    const estadoPedido = document.getElementById('estadoPedido').value;

    // Validar que los campos requeridos no estén vacíos
    if (!idCliente || !cantidadSodas || !estadoPedido) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor complete todos los campos obligatorios.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Crear el objeto de pedido que se enviará al servidor
    const pedidoData = {
        idCliente,
        fechaEntrega,  // Fecha de entrega opcional
        cantidadSodas,
        observaciones,
        estadoPedido
    };

    try {
        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de que el token esté presente
            },
            body: JSON.stringify(pedidoData)
        });

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Pedido agregado correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            cargarPedidos(); // Recargar la lista de pedidos
            cerrarModal(); // Cerrar el modal
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo agregar el pedido.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al agregar pedido:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al conectar con el servidor.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}




 // Función para abrir el modal de modificar cliente
async function abrirModalModificarCliente(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Cliente no encontrado');
        }

        const cliente = await response.json();

        // Excluir Nombre y CantidadInicialSodas del formulario de modificación
        document.getElementById('modal-body').innerHTML = `
            <h2>Modificar Cliente</h2>
            <form id="formModificarCliente">
                <p><strong>Nombre: </strong>${cliente.Nombre}</p> <!-- Nombre se muestra pero no es editable -->
                <label for="direccion">Dirección:</label>
                <input type="text" id="direccion" value="${cliente.Direccion}" required>
                <label for="telefono">Teléfono:</label>
                <input type="text" id="telefono" value="${cliente.Telefono}" required>
                <label for="email">Email:</label>
                <input type="email" id="email" value="${cliente.Email}" required>
                <label for="cantidadActualSodas">Cantidad Actual de Sodas:</label>
                <input type="number" id="cantidadActualSodas" value="${cliente.CantidadActualSodas}" min="0" required>
                <label for="estadoCuenta">Estado de Cuenta:</label>
                <select id="estadoCuenta" required>
                    <option value="Abierta" ${cliente.EstadoCuenta === 'Abierta' ? 'selected' : ''}>Abierta</option>
                    <option value="Suspendida" ${cliente.EstadoCuenta === 'Suspendida' ? 'selected' : ''}>Suspendida</option>
                    <option value="Cerrada" ${cliente.EstadoCuenta === 'Cerrada' ? 'selected' : ''}>Cerrada</option>
                </select>
                <button type="submit">Guardar</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';

        document.getElementById('formModificarCliente').addEventListener('submit', (e) => modificarCliente(e, id));
    } catch (error) {
        console.error('Error al obtener el cliente para modificar:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo obtener el cliente para modificar',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}

    // Función para abrir el modal de agregar reparto
    function abrirModalAgregarReparto() {
        document.getElementById('modal-body').innerHTML = `
            <h2>Agregar Reparto</h2>
            <form id="formAgregarReparto">
                <label for="idPedido">ID Pedido:</label>
                <input type="number" id="idPedido" required>
                <label for="fechaReparto">Fecha Reparto:</label>
                <input type="date" id="fechaReparto" required>
                <label for="cantidadSodas">Cantidad de Sodas:</label>
                <input type="number" id="cantidadSodas" required>
                <label for="estadoReparto">Estado del Reparto:</label>
                <input type="text" id="estadoReparto" required>
                <button type="submit">Guardar</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';
        document.getElementById('formAgregarReparto').addEventListener('submit', agregarReparto);
    }

    // Función para agregar un reparto
    async function agregarReparto(event) {
        event.preventDefault();
        const idPedido = document.getElementById('idPedido').value;
        const fechaReparto = document.getElementById('fechaReparto').value;
        const cantidadSodas = document.getElementById('cantidadSodas').value;
        const estadoReparto = document.getElementById('estadoReparto').value;

        try {
            const response = await fetch('http://localhost:3000/api/repartos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ idPedido, fechaReparto, cantidadSodas, estadoReparto })
            });
            if (!response.ok) throw new Error('No se pudo agregar el reparto');
            Swal.fire({
                title: 'Éxito',
                text: 'Reparto agregado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            cargarRepartos();
            cerrarModal();
        } catch (error) {
            console.error('Error al agregar reparto:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al conectar con el servidor',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

 // Función para abrir el modal de modificar pedido
async function abrirModalModificarPedido(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Pedido no encontrado');
            } else {
                throw new Error('Error al obtener el pedido');
            }
        }

        const pedido = await response.json();

        // Mostrar solo los campos permitidos para modificar
        document.getElementById('modal-body').innerHTML = `
            <h2>Modificar Pedido</h2>
            <form id="formModificarPedido">
                <label for="fechaEntrega">Fecha Entrega:</label>
                <input type="date" id="fechaEntrega" value="${pedido.FechaEntrega ? pedido.FechaEntrega.split('T')[0] : ''}" required>
                <label for="cantidadSodas">Cantidad de Sodas:</label>
                <input type="number" id="cantidadSodas" value="${pedido.CantidadSodas}" required>
                <label for="direccionEntrega">Dirección de Entrega:</label>
                <input type="text" id="direccionEntrega" value="${pedido.DireccionEntrega || ''}">
                <label for="observaciones">Observaciones:</label>
                <input type="text" id="observaciones" value="${pedido.Observaciones || ''}">
                <label for="estadoPedido">Estado Pedido:</label>
                <select id="estadoPedido" required>
                    <option value="En Proceso" ${pedido.EstadoPedido === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="Entregado" ${pedido.EstadoPedido === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="Cancelado" ${pedido.EstadoPedido === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
                <button type="submit">Guardar</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';

        document.getElementById('formModificarPedido').addEventListener('submit', (e) => modificarPedido(e, id));
    } catch (error) {
        console.error('Error al obtener el pedido para modificar:', error);

        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo obtener el pedido para modificar',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}


// Función para abrir el modal de modificar reparto
async function abrirModalModificarReparto(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/repartos/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Reparto no encontrado');
        }

        const reparto = await response.json();

        document.getElementById('modal-body').innerHTML = `
            <h2>Modificar Reparto</h2>
            <form id="formModificarReparto">
                <label for="idPedido">ID Pedido:</label>
                <input type="number" id="idPedido" value="${reparto.IDPedido}" required>
                <label for="fechaReparto">Fecha Reparto:</label>
                <input type="date" id="fechaReparto" value="${reparto.FechaReparto}" required>
                <label for="cantidadSodas">Cantidad de Sodas:</label>
                <input type="number" id="cantidadSodas" value="${reparto.CantidadSodas}" required>
                <label for="estadoReparto">Estado del Reparto:</label>
                <input type="text" id="estadoReparto" value="${reparto.EstadoReparto}" required>
                <button type="submit">Guardar</button>
            </form>
        `;
        document.getElementById('modal').style.display = 'block';

        document.getElementById('formModificarReparto').addEventListener('submit', (e) => modificarReparto(e, id));
    } catch (error) {
        console.error('Error al obtener el reparto para modificar:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo obtener el reparto para modificar',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Función para modificar un cliente
async function modificarCliente(event, id) {
    event.preventDefault();
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const cantidadActualSodas = parseInt(document.getElementById('cantidadActualSodas').value, 10);
    const estadoCuenta = document.getElementById('estadoCuenta').value;

    // Validar que los campos no estén vacíos antes de enviar la solicitud
    if (!direccion || !telefono || !email || isNaN(cantidadActualSodas) || !estadoCuenta) {
        Swal.fire({
            title: 'Error',
            text: 'Todos los campos son obligatorios.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ direccion, telefono, email, cantidadActualSodas, estadoCuenta })
        });

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Cliente modificado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            cargarClientes();
            cerrarModal();
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo modificar el cliente',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al modificar cliente:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al conectar con el servidor',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Función para modificar un pedido
async function modificarPedido(event, id) {
    event.preventDefault();
    
    // Obtener los valores de los campos del formulario
    const fechaEntregaElement = document.getElementById('fechaEntrega');
    const cantidadSodasElement = document.getElementById('cantidadSodas');
    const direccionEntregaElement = document.getElementById('direccionEntrega');
    const observacionesElement = document.getElementById('observaciones');
    const estadoPedidoElement = document.getElementById('estadoPedido');
    
    // Verificación de existencia de elementos antes de acceder a sus valores
    if (!fechaEntregaElement || !cantidadSodasElement || !estadoPedidoElement) {
        console.error('Uno o más elementos del formulario no se encuentran en el DOM.');
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al obtener los datos del formulario.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Obtener los valores
    const fechaEntrega = fechaEntregaElement.value;
    const cantidadSodas = cantidadSodasElement.value;
    const direccionEntrega = direccionEntregaElement ? direccionEntregaElement.value : '';
    const observaciones = observacionesElement ? observacionesElement.value : '';
    const estadoPedido = estadoPedidoElement.value;

    // Validar que los campos no estén vacíos antes de enviar la solicitud
    if (!fechaEntrega || !cantidadSodas || !estadoPedido) {
        Swal.fire({
            title: 'Error',
            text: 'Todos los campos obligatorios deben ser completados.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ fechaEntrega, cantidadSodas, direccionEntrega, observaciones, estadoPedido })
        });

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Pedido modificado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            cargarPedidos();
            cerrarModal();
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo modificar el pedido',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al modificar pedido:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al conectar con el servidor.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}


// Función para modificar un reparto
async function modificarEstadoReparto(idPedido, nuevoEstado) {
    try {
        const response = await fetch(`http://localhost:3000/api/repartos/${idPedido}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ nuevoEstado })
        });

        if (response.ok) {
            Swal.fire({
                title: 'Éxito',
                text: 'Estado del reparto actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            cargarRepartos(); // Recargar la lista de repartos
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Error',
                text: data.message || 'No se pudo actualizar el estado del reparto',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al actualizar el estado del reparto:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al conectar con el servidor.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}


    // Función para eliminar un cliente
    async function eliminarCliente(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    const data = await response.json();
    
                    if (!response.ok) {
                        // Mostrar el mensaje de error si el cliente tiene pedidos asociados
                        Swal.fire({
                            title: 'Error',
                            text: data.message || 'No se pudo eliminar el cliente',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                        return;
                    }
    
                    Swal.fire(
                        'Eliminado',
                        'El cliente ha sido eliminado.',
                        'success'
                    );
                    cargarClientes(); // Recargar la lista de clientes
                } catch (error) {
                    console.error('Error al eliminar cliente:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al conectar con el servidor',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }
        });
    }
    

    // Función para eliminar un pedido
    async function eliminarPedido(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
    
                    const data = await response.json();
    
                    if (!response.ok) {
                        // Mostrar el mensaje de error si el estado del pedido no es "En Proceso"
                        Swal.fire({
                            title: 'Error',
                            text: data.message || 'No se pudo eliminar el pedido',
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                        return;
                    }
    
                    Swal.fire(
                        'Eliminado',
                        'El pedido ha sido eliminado.',
                        'success'
                    );
                    cargarPedidos(); // Recargar la lista de pedidos
                } catch (error) {
                    console.error('Error al eliminar pedido:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al conectar con el servidor',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }
        });
    }
    

    // Función para eliminar un reparto
    async function eliminarReparto(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/repartos/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (!response.ok) throw new Error('No se pudo eliminar el reparto');
                    Swal.fire(
                        'Eliminado',
                        'El reparto ha sido eliminado.',
                        'success'
                    );
                    cargarRepartos();
                } catch (error) {
                    console.error('Error al eliminar reparto:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al conectar con el servidor',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }
        });
    }

    // Función para cerrar el modal
    function cerrarModal() {
        document.getElementById('modal').style.display = 'none';
    }

    // Exponer las funciones necesarias al contexto global para que puedan ser llamadas desde el HTML
    window.verCliente = verCliente;
    window.verPedido = verPedido;
    window.verReparto = verReparto;
    window.abrirModalAgregarCliente = abrirModalAgregarCliente;
    window.abrirModalAgregarPedido = abrirModalAgregarPedido;
    window.abrirModalAgregarReparto = abrirModalAgregarReparto;
    window.eliminarCliente = eliminarCliente;
    window.eliminarPedido = eliminarPedido;
    window.eliminarReparto = eliminarReparto;
    window.cerrarModal = cerrarModal;
    window.abrirModalModificarCliente = abrirModalModificarCliente;
    window.abrirModalModificarPedido = abrirModalModificarPedido;
    window.abrirModalModificarReparto = abrirModalModificarReparto;
    window.filtrarRepartosPorFecha = filtrarRepartosPorFecha;
    window.cambiarEstadoReparto = cambiarEstadoReparto;
    window.cambiarEstadoPedido = cambiarEstadoPedido;
});
