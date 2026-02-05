const db = require('./src/models');

async function seed() {
    try {
        console.log('🌱 Iniciando proceso de poblado (Seeding)...');

        // 1. Limpiar la BD (Desactivamos seguridad FK para borrar todo limpio)
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        await db.sequelize.sync({ force: true }); // Borra y crea tablas de cero
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        // 2. Crear ROLES
        console.log('🔹 Creando Roles...');
        await db.Role.bulkCreate([
            { id: 1, nombre: 'admin' },
            { id: 2, nombre: 'empleado' },
            { id: 3, nombre: 'cliente' }
        ]);

        // 3. Crear SKILLS
        console.log('🔹 Creando Habilidades...');
        await db.Skill.bulkCreate([
            { id: 1, nombre: 'ESTILISTA' },
            { id: 2, nombre: 'MANICURISTA' },
            { id: 3, nombre: 'PEDICURISTA' }
        ]);

        // 4. Crear SERVICIOS
        console.log('🔹 Creando Catálogo de Servicios...');
        await db.Service.bulkCreate([
            { nombre: 'Corte de Cabello', duracion_minutos: 45, precio: 200, skill_requerida_id: 1 },
            { nombre: 'Tinte Completo', duracion_minutos: 120, precio: 800, skill_requerida_id: 1 },
            { nombre: 'Peinado', duracion_minutos: 60, precio: 300, skill_requerida_id: 1 },
            { nombre: 'Manicure', duracion_minutos: 45, precio: 150, skill_requerida_id: 2 },
            { nombre: 'Pedicure', duracion_minutos: 60, precio: 200, skill_requerida_id: 3 }
        ]);

        // 5. CREAR USUARIOS
        // ¡CORRECCIÓN! Pasamos la contraseña PLANA ("12345")
        // El modelo User se encargará de encriptarla automáticamente (Hooks)
        console.log('🔹 Creando Usuarios...');

        // A) USUARIO ADMIN
        await db.User.create({
            nombre_completo: "Administrador Jefe",
            email: "admin@estetica.com",
            password_hash: "12345", // <--- OJO: Contraseña plana
            telefono: "0000000000",
            role_id: 1
        });

        // B) USUARIO CLIENTE
        await db.User.create({
            nombre_completo: "Juan Perez (Cliente)",
            email: "juan@test.com",
            password_hash: "12345", // <--- OJO: Contraseña plana
            telefono: "5555555555",
            role_id: 3
        });

        // C) USUARIO EMPLEADO
        const estilista = await db.User.create({
            nombre_completo: "Maria Estilista",
            email: "maria@empleado.com",
            password_hash: "12345", // <--- OJO: Contraseña plana
            telefono: "1111111111",
            role_id: 2
        });
        
        // Asignar rol de empleado y skill
        const emp = await db.Employee.create({ user_id: estilista.id });
        const skillEstilista = await db.Skill.findByPk(1); 
        await emp.addSkill(skillEstilista);

        console.log('✅ Base de datos corregida y lista.');
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seed();