/**
 * ARCHIVO: public/js/panel.js
 * Lógica actualizada para mostrar precios y empleados dinámicos.
 */

// 1. LOGOUT GLOBAL
window.logout = function() { 
    localStorage.clear(); 
    window.location.href = '/'; 
};

// 2. VERIFICACIÓN DE SEGURIDAD
const token = localStorage.getItem('token');
const roleId = localStorage.getItem('roleId'); 
const userName = localStorage.getItem('userName');

if (!token) window.location.href = '/';

if(document.getElementById('userName')) {
    document.getElementById('userName').innerText = userName;
}

// ==========================================
// LÓGICA DIFERENCIADA: EMPLEADO VS CLIENTE
// ==========================================

if (roleId == 2) {
    // 🟢 CASO A: ES UN EMPLEADO (STAFF)
    const cardFormulario = document.querySelector('#citaForm');
    if(cardFormulario) {
        const cardPadre = cardFormulario.closest('.card-custom');
        if(cardPadre) {
            cardPadre.innerHTML = `
                <div class="text-center py-5">
                    <h1 style="font-size: 4rem;">✂️</h1>
                    <h4 class="mt-3 text-success" style="color: var(--color-militar)!important;">Panel de Staff</h4>
                    <p class="lead">Bienvenido/a, ${userName}.</p>
                    <hr class="w-50 mx-auto">
                    <div class="alert alert-secondary mt-4">
                        <small>ℹ️ Tu agenda y asignaciones son gestionadas por la <strong>Administración</strong>.</small>
                    </div>
                </div>`;
        }
    }
    
    const listaCitas = document.getElementById('listaCitas');
    if(listaCitas) {
        const cardLista = listaCitas.closest('.card-custom');
        if(cardLista) {
            cardLista.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <h5>📅 Agenda Global</h5>
                    <p>Consulta tus asignaciones con el Administrador.</p>
                </div>`;
        }
    }

} else {
    // 🔵 CASO B: ES UN CLIENTE
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        fechaInput.min = now.toISOString().slice(0, 16);
    }

    cargarCitas();

    const formCita = document.getElementById('citaForm');
    if(formCita) {
        formCita.addEventListener('submit', async (e) => {
            e.preventDefault();
            const service_id = document.getElementById('servicio').value;
            const fechaVal = document.getElementById('fecha').value;
            
            if(!fechaVal) {
                alert("Por favor selecciona una fecha.");
                return;
            }

            // Enviamos el campo como 'fecha_hora_inicio' para que coincida con el controlador
            try {
                const res = await fetch('/appointments', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        service_id, 
                        fecha_hora_inicio: fechaVal 
                    })
                });

                const data = await res.json();
                const msgDiv = document.getElementById('mensaje');

                if (res.ok) {
                    msgDiv.innerHTML = `<div class="alert alert-success py-2">✅ Cita Agendada Exitosamente</div>`;
                    cargarCitas(); 
                    formCita.reset(); 
                } else {
                    msgDiv.innerHTML = `<div class="alert alert-danger py-2">❌ ${data.message}</div>`;
                }
            } catch (error) {
                console.error(error);
                document.getElementById('mensaje').innerHTML = `<div class="alert alert-danger">Error de conexión</div>`;
            }
        });
    }
}

// ==========================================
// FUNCIONES AUXILIARES (DINÁMICAS)
// ==========================================

async function cargarCitas() {
    try {
        const res = await fetch('/appointments/my-appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(!res.ok) return;

        const citas = await res.json();
        const lista = document.getElementById('listaCitas');
        if(!lista) return;

        lista.innerHTML = '';

        if(citas.length === 0) {
            lista.innerHTML = '<li class="list-group-item text-center text-muted">No tienes citas próximas.</li>';
            return;
        }

        citas.forEach(cita => {
            const fecha = new Date(cita.fecha_hora_inicio).toLocaleString('es-MX', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            
            // Ya no usamos el objeto manual de servicios, usamos lo que viene de la BD
            const nombreServicio = cita.service ? cita.service.nombre : 'Servicio';
            const precioServicio = cita.service ? cita.service.precio : '0.00';
            const nombreEmpleado = (cita.employee && cita.employee.User) ? cita.employee.User.nombre_completo : 'Asignando...';

            let estadoHTML = '';
            if(cita.estado === 'cancelada') {
                estadoHTML = `<span class="badge bg-danger">Cancelada</span>`;
            } else {
                estadoHTML = `
                    <div class="text-end">
                        <span class="badge bg-success mb-1">Confirmada</span><br>
                        <button onclick="cancelarCita(${cita.id})" class="btn btn-sm btn-outline-danger" style="font-size: 0.7rem;">Cancelar</button>
                    </div>`;
            }

            lista.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2 rounded border-0">
                    <div>
                        <div class="fw-bold text-uppercase" style="color: var(--color-militar);">${nombreServicio}</div>
                        <div class="text-success fw-bold small">Total a pagar: $${precioServicio}</div>
                        <small class="text-muted"><i class="bi bi-person"></i> Atiende: ${nombreEmpleado}</small><br>
                        <small class="text-muted"><i class="bi bi-clock"></i> ${fecha}</small>
                    </div>
                    ${estadoHTML}
                </li>`;
        });
    } catch (error) {
        console.error("Error cargando citas:", error);
    }
}

window.cancelarCita = async function(id) {
    if(!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    try {
        const res = await fetch(`/appointments/${id}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            cargarCitas(); 
        } else {
            const data = await res.json();
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión al cancelar.');
    }
};