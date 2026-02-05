// 1. LOGOUT GLOBAL (Definido primero para que siempre funcione)
window.logout = function() { 
    localStorage.clear(); 
    window.location.href = '/'; 
};

// 2. VERIFICACIÓN DE SEGURIDAD
const token = localStorage.getItem('token');
const roleId = localStorage.getItem('roleId');

// Si no es admin, fuera
if (!token || roleId != 1) {
    window.location.href = '/';
} else {
    // Si es admin, cargamos las citas inmediatamente
    cargarCitasGlobales();
}

// 3. FUNCIÓN CARGAR CITAS
async function cargarCitasGlobales() {
    try {
        const res = await fetch('/admin/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Error al cargar citas');

        const citas = await res.json();
        const tbody = document.getElementById('tablaCitas');
        
        // Limpiamos la tabla antes de llenarla
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay citas registradas.</td></tr>';
            return;
        }

        citas.forEach(cita => {
            const fecha = new Date(cita.fecha_hora_inicio).toLocaleString();
            
            // Botón Cancelar (solo si no está cancelada ya)
            let boton = '';
            if(cita.estado !== 'cancelada') {
                boton = `<button onclick="cancelarCitaAdmin(${cita.id})" class="btn btn-sm btn-outline-danger">Cancelar</button>`;
            } else {
                boton = '-';
            }

            // Color del badge
            const badgeClass = cita.estado === 'cancelada' ? 'bg-danger' : 'bg-success';

            tbody.innerHTML += `
                <tr>
                    <td>${fecha}</td>
                    <td>${cita.cliente ? cita.cliente.nombre_completo : 'N/A'}</td>
                    <td>${cita.Service ? cita.Service.nombre : 'N/A'}</td>
                    <td>Emp #${cita.employee_id}</td>
                    <td><span class="badge ${badgeClass}">${cita.estado}</span></td>
                    <td>${boton}</td>
                </tr>`;
        });
    } catch (e) { 
        console.error("Error en cargarCitasGlobales:", e); 
    }
}

// 4. FUNCIÓN CANCELAR CITA
window.cancelarCitaAdmin = async function(id) {
    if(!confirm('¿Admin: Cancelar esta cita?')) return;

    try {
        const res = await fetch(`/appointments/${id}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            cargarCitasGlobales(); // Recargar la tabla
        } else {
            alert('Error al cancelar la cita.');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión.');
    }
};

// 5. EVENTO CREAR EMPLEADO
const formEmpleado = document.getElementById('empleadoForm');
if (formEmpleado) {
    formEmpleado.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('empNombre').value;
        const email = document.getElementById('empEmail').value;
        const password = document.getElementById('empPass').value;
        const especialidad = document.getElementById('empRol').value;

        // Validación Frontend
        const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nombreRegex.test(nombre)) {
            alert("El nombre solo puede contener letras.");
            return;
        }

        try {
            const res = await fetch('/admin/create-employee', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre, email, password, especialidad })
            });

            const data = await res.json();

            if(res.ok) {
                alert('✅ Empleado creado exitosamente');
                formEmpleado.reset();
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión al crear empleado.');
        }
    });
}