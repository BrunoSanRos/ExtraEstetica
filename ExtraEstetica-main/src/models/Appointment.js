const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    fecha_hora_inicio: { type: DataTypes.DATE, allowNull: false },
    fecha_hora_fin: { type: DataTypes.DATE, allowNull: false },
    estado: {
        type: DataTypes.ENUM('confirmada', 'en_curso', 'completada', 'cancelada', 'no_show'),
        defaultValue: 'confirmada'
    }
}, { timestamps: true, tableName: 'appointments' });

module.exports = Appointment;