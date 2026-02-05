const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Definimos las URLs
// POST http://localhost:3000/auth/register
router.post('/register', authController.register);

// POST http://localhost:3000/auth/login
router.post('/login', authController.login);

module.exports = router;