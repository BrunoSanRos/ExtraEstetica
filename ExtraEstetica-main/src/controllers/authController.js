const { User, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
    // REGISTRO (Con validación blindada de teléfono)
    async register(req, res) {
        try {
            const { nombre_completo, email, password, telefono } = req.body;

            //  VALIDACIONES DE SEGURIDAD 
            
            // 1. Validar Nombre
            const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
            if (!nombreRegex.test(nombre_completo) || nombre_completo.length < 3) {
                return res.status(400).json({ message: 'El nombre solo debe contener letras.' });
            }

            // 2. Validar Teléfono (EXACTAMENTE 10 DÍGITOS)
            const telefonoRegex = /^\d{10}$/;
            if (!telefonoRegex.test(telefono)) {
                return res.status(400).json({ 
                    message: 'El teléfono debe contener exactamente 10 dígitos numéricos.' 
                });
            }

            // 3. Validar Password
            if (password.length < 4) {
                return res.status(400).json({ message: 'La contraseña es muy corta.' });
            }
            // ---------------------------------

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Este correo ya está registrado.' });
            }

            // Crear usuario
            const newUser = await User.create({
                nombre_completo,
                email,
                password_hash: password, // El modelo se encarga de encriptar
                telefono,
                role_id: 3 // Cliente
            });

            res.status(201).json({ message: 'Usuario registrado con éxito', userId: newUser.id });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error en el servidor al registrar.' });
        }
    },

    // LOGIN
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Buscar usuario por email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            // Comparar contraseña
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            // Crear Token
            const token = jwt.sign(
                { id: user.id, role_id: user.role_id, nombre: user.nombre_completo },
                process.env.JWT_SECRET || 'secreto_super_seguro',
                { expiresIn: '2h' }
            );

            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre_completo,
                    role_id: user.role_id
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al iniciar sesión' });
        }
    }
};