const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validar que el controlador no esté vacío
if (!appointmentController) {
    console.error("Error: Controlador de citas vacío.");
}

// POST: Crear cita
router.post('/', authMiddleware, appointmentController.createAppointment);

// GET: Ver mis citas
router.get('/my-appointments', authMiddleware, appointmentController.getMyAppointments);

// PUT: Cancelar cita (NUEVO)
router.put('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;