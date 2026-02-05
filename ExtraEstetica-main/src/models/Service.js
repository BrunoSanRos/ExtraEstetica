const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    duracion_minutos: { type: DataTypes.INTEGER, allowNull: false }, // ¡Crucial para tu examen!
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { timestamps: false, tableName: 'services' });

module.exports = Service;