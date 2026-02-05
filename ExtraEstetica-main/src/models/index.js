const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar modelos
const User = require('./User');
const Role = require('./Role');
const Employee = require('./Employee');
const Service = require('./Service');
const Appointment = require('./Appointment');

// Definir Skill
const Skill = sequelize.define('Skill', { 
    nombre: { type: DataTypes.STRING, unique: true } 
}, { timestamps: false, tableName: 'skills' });

// --- RELACIONES (TODO EN INGLÉS) ---

// Roles y Usuarios
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Empleados y Usuarios
User.hasOne(Employee, { foreignKey: 'user_id' });
// IMPORTANTE: Sin alias aquí para que sea fácil de incluir
Employee.belongsTo(User, { foreignKey: 'user_id' }); 

// Skills
Employee.belongsToMany(Skill, { through: 'employee_skills', timestamps: false });
Skill.belongsToMany(Employee, { through: 'employee_skills', timestamps: false });

// Servicios y Skills
Skill.hasMany(Service, { foreignKey: 'skill_requerida_id' });
Service.belongsTo(Skill, { foreignKey: 'skill_requerida_id' });

// --- CITAS (AQUÍ ES DONDE SUELE FALLAR) ---
// Definimos los alias EXACTOS que usa tu controlador

User.hasMany(Appointment, { as: 'citasCliente', foreignKey: 'client_id' });
Appointment.belongsTo(User, { as: 'client', foreignKey: 'client_id' }); // <--- 'client'

Employee.hasMany(Appointment, { as: 'citasEmpleado', foreignKey: 'employee_id' });
Appointment.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' }); // <--- 'employee'

Service.hasMany(Appointment, { as: 'appointments', foreignKey: 'service_id' });
Appointment.belongsTo(Service, { as: 'service', foreignKey: 'service_id' }); // <--- 'service'

module.exports = {
    sequelize,
    User, Role, Employee, Service, Appointment, Skill
};