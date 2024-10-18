// login.js
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar que el formulario recargue la página

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito con SweetAlert2
            Swal.fire({
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo al panel de gestión...',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    popup: 'my-custom-popup',
                    title: 'my-custom-title',
                    confirmButton: 'my-custom-button'
                }
            }).then(() => {
                // Guardar el token y redirigir al panel de gestión
                localStorage.setItem('token', data.token);
                window.location.href = 'management.html';
            });
        } else {
            // Mostrar mensaje de error con SweetAlert2
            Swal.fire({
                title: 'Error',
                text: data.message || 'Usuario o contraseña incorrectos',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                customClass: {
                    popup: 'my-custom-popup-error',
                    title: 'my-custom-title',
                    confirmButton: 'my-custom-button-error'
                }
            });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al conectar con el servidor. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            customClass: {
                popup: 'my-custom-popup-error',
                title: 'my-custom-title',
                confirmButton: 'my-custom-button-error'
            }
        });
    }
});
