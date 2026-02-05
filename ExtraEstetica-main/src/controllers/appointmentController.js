const { Appointment, Service, Employee, User, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
    // 1. CREAR CITA
    async createAppointment(req, res) {
        try {
            // Ajustado para leer 'fecha_hora_inicio' que es lo que envía el formulario
            const { service_id, fecha_hora_inicio } = req.body;
            const client_id = req.user.id; 

            // VALIDACIONES DE TIEMPO
            const startDate = new Date(fecha_hora_inicio);
            const now = new Date();
            const tolerance = new Date(now.getTime() - 5 * 60000); 

            if (startDate < tolerance) {
                return res.status(400).json({ message: 'No puedes agendar en el pasado.' });
            }

            const day = startDate.getDay();
            const hour = startDate.getHours();

            if (day === 0 || day === 6) return res.status(400).json({ message: 'Solo atendemos de Lunes a Viernes.' });
            if (hour < 8 || hour >= 19) return res.status(400).json({ message: 'Horario de atención: 08:00 a 19:00.' });

            // BUSCAR SERVICIO
            const service = await Service.findByPk(service_id);
            if (!service) return res.status(404).json({ message: 'Servicio no encontrado.' });

            const endDate = new Date(startDate.getTime() + service.duracion_minutos * 60000);

            // BUSCAR EMPLEADOS CANDIDATOS
            const candidates = await Employee.findAll({
                include: {
                    model: sequelize.models.Skill,
                    where: { id: service.skill_requerida_id },
                    through: { attributes: [] }
                }
            });

            if (!candidates.length) return res.status(400).json({ message: 'No hay personal disponible para este servicio.' });

            // BUSCAR DISPONIBILIDAD (Collision Detection)
            let assignedEmployee = null;
            for (const employee of candidates) {
                const collision = await Appointment.findOne({
                    where: {
                        employee_id: employee.id,
                        [Op.or]: [
                            {
                                fecha_hora_inicio: { [Op.lt]: endDate },
                                fecha_hora_fin: { [Op.gt]: startDate }
                            }
                        ],
                        estado: { [Op.not]: 'cancelada' }
                    }
                });

                if (!collision) {
                    assignedEmployee = employee;
                    break;
                }
            }

            if (!assignedEmployee) {
                return res.status(409).json({ message: 'Cupo lleno en ese horario. Intenta otra hora.' });
            }

            // CREAR CITA
            const newAppointment = await Appointment.create({
                client_id,
                employee_id: assignedEmployee.id,
                service_id,
                fecha_hora_inicio: startDate,
                fecha_hora_fin: endDate,
                estado: 'confirmada'
            });

            res.status(201).json({ message: 'Cita creada exitosamente', cita: newAppointment });

        } catch (error) {
            console.error("Error al crear cita:", error);
            res.status(500).json({ message: 'Error interno al procesar la cita.' });
        }
    },

    // 2. VER MIS CITAS (MODIFICADO PARA MOSTRAR PRECIO Y EMPLEADO)
    async getMyAppointments(req, res) {
        try {
            const citas = await Appointment.findAll({ 
                where: { client_id: req.user.id },
                order: [['fecha_hora_inicio', 'DESC']],
                // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
                include: [
                    { 
                        model: Service, 
                        as: 'service', 
                        attributes: ['nombre', 'precio'] // Traemos el precio para que el cliente lo vea
                    },
                    { 
                        model: Employee, 
                        as: 'employee',
                        include: [{ 
                            model: User, 
                            attributes: ['nombre_completo'] // Traemos el nombre del estilista
                        }]
                    }
                ]
            });
            res.json(citas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener citas' });
        }
    },

    // 3. CANCELAR CITA
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const roleId = req.user.role_id;

            const appointment = await Appointment.findByPk(id);

            if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

            if (roleId !== 1 && appointment.client_id !== userId) {
                return res.status(403).json({ message: 'No tienes permiso.' });
            }

            appointment.estado = 'cancelada';
            await appointment.save();

            res.json({ message: 'Cita cancelada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al cancelar' });
        }
    }
};