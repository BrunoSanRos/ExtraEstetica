const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
    fecha_contratacion: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    }
}, { timestamps: false, tableName: 'employees' });

module.exports = Employee;