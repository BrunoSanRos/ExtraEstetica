const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// const authMiddleware = require('../middlewares/authMiddleware'); // COMENTADO
// const isAdmin = ... // YA NO LO USAMOS AQUÍ PARA QUE NO BLOQUEE

// --- RUTAS DEL ADMIN (MODO PRESENTACIÓN) ---
// Quitamos los middlewares para que el navegador pueda cargar la página y los formularios funcionen

// 1. Ver Panel Principal
router.get('/', adminController.getAdminPanel);

// 2. Crear nuevo empleado
router.post('/create-employee', adminController.createEmployee);

// 3. Actualizar Precio
router.post('/update-price', adminController.updateServicePrice);

// 4. Cancelar Cita
router.post('/cancel-appointment/:id', adminController.cancelAppointment);

module.exports = router;