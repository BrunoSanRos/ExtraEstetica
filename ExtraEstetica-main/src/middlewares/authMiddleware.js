const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Buscamos el token en la cabecera "Authorization"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN_AQUI"

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    try {
        // 2. Verificamos si el token es válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario para usarlos luego
        next(); // Dejamos pasar al usuario
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};