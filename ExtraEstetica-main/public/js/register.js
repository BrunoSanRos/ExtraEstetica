document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_completo = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre_completo,
                telefono,
                email,
                password
            })
        });

        const data = await res.json();

        if (res.ok) {
            // Éxito: Mostramos mensaje y redirigimos al Login
            document.getElementById('mensaje').innerHTML = '<span class="text-success">¡Cuenta creada! Redirigiendo...</span>';
            setTimeout(() => {
                window.location.href = '/'; // Vuelta al Login
            }, 1500);
        } else {
            // Error (ej: email repetido)
            document.getElementById('mensaje').innerText = data.message;
        }

    } catch (error) {
        console.error(error);
        document.getElementById('mensaje').innerText = "Error de conexión";
    }
});