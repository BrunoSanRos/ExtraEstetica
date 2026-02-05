const { Appointment, User, Service, Employee, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {

    // 1. MOSTRAR PANEL (CON BUSCADOR DE FECHA)
    async getAdminPanel(req, res) {
        try {
            // A. OBTENER LA FECHA DE BÚSQUEDA (O USAR HOY POR DEFECTO)
            // Si viene en la URL (?fecha=2024-02-05), la usamos. Si no, usamos hoy.
            let fechaBusqueda = req.query.fecha; 
            
            if (!fechaBusqueda) {
                // Truco para obtener fecha "YYYY-MM-DD" local
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                fechaBusqueda = now.toISOString().split('T')[0];
            }

            // B. DEFINIR RANGO DE TIEMPO (De 00:00 a 23:59 de ese día)
            const startDate = new Date(`${fechaBusqueda}T00:00:00`);
            const endDate = new Date(`${fechaBusqueda}T23:59:59`);

            // C. CONSULTA FILTRADA
            const appointments = await Appointment.findAll({
                where: {
                    fecha_hora_inicio: {
                        [Op.between]: [startDate, endDate] // Solo citas dentro de ese rango exacto
                    },
                    // estado: { [Op.ne]: 'cancelada' } // Descomenta si quieres ocultar canceladas
                },
                include: [
                    { model: User, as: 'client' },
                    { model: Service, as: 'service' },
                    { 
                        model: Employee, 
                        as: 'employee',
                        include: [{ model: User }] 
                    }
                ],
                order: [['fecha_hora_inicio', 'ASC']]
            });

            const services = await Service.findAll();

            res.render('admin', { 
                user: { nombre: 'Administrador', role_id: 1 },
                appointments,
                services,
                fechaSeleccionada: fechaBusqueda // Enviamos la fecha para que el calendario no se borre
            });

        } catch (error) {
            console.error("❌ ERROR:", error);
            res.status(500).send('Error al cargar el panel.');
        }
    },

    // 2. ACTUALIZAR PRECIO
    // 2. ACTUALIZAR PRECIO (CON VALIDACIÓN NO NEGATIVOS)
    async updateServicePrice(req, res) {
        try {
            const { id, precio } = req.body;
            
            // VALIDACIÓN: Si es negativo, rebotamos al usuario
            if (precio < 0) {
                return res.send(`
                    <script>
                        alert("⚠️ Error: El precio no puede ser negativo.");
                        window.location.href = "/admin";
                    </script>
                `);
            }

            await Service.update(
                { precio: precio },
                { where: { id: id } }
            );

            // Redirigir al panel para ver el cambio
            res.redirect('/admin');

        } catch (error) {
            console.error(error);
            res.status(500).send('Error al actualizar precio');
        }
    },

    // 3. CREAR EMPLEADO
    async createEmployee(req, res) {
        try {
            const { nombre, email, password, role } = req.body;
            
            const userExists = await User.findOne({ where: { email } });
            if (userExists) return res.status(400).send('El correo ya existe');

            const newUser = await User.create({
                nombre_completo: nombre,
                email,
                password_hash: password,
                role_id: 2
            });

            const newEmp = await Employee.create({
                user_id: newUser.id,
                fecha_contratacion: new Date()
            });

            let skillId = (role === 'MANICURISTA') ? 2 : 1;
            await sequelize.query(`INSERT INTO employee_skills (employee_id, skill_id) VALUES (${newEmp.id}, ${skillId})`);

            res.redirect('/admin');

        } catch (error) {
            console.error(error);
            res.status(500).send('Error al crear empleado');
        }
    },

    // 4. CANCELAR CITA
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            await Appointment.update({ estado: 'cancelada' }, { where: { id } });
            // Al redireccionar, volvemos a cargar la página (se irá al filtro de hoy por defecto)
            res.redirect('/admin'); 
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cancelar cita');
        }
    }
};