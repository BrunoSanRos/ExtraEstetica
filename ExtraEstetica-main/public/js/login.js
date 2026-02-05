document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.nombre);
            localStorage.setItem('roleId', data.user.role_id);

            // Redirección según Rol
            if (data.user.role_id === 1) {
                window.location.href = '/admin';
            } else {
                window.location.href = '/panel';
            }
        } else {
            document.getElementById('mensaje').innerText = data.message;
        }
    } catch (error) { console.error(error); }
});