const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// BORRÉ LA LÍNEA DEL clientController QUE DABA ERROR

require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN EJS ---
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());

// ⚠️ ESTA LÍNEA ES VITAL PARA LOS FORMULARIOS (PRECIOS Y EMPLEADOS)
app.use(express.urlencoded({ extended: true })); 

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// --- RUTAS VISTAS ---
app.get('/', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Dejamos esta ruta directa. El panel cargará los precios con el script JS que pusimos antes.
// --- RUTA PANEL CLIENTE CON PRECIOS REALES ---
app.get('/panel', async (req, res) => {
    try {
        // 1. Buscamos los servicios actualizados en la BD
        const services = await db.Service.findAll();
        
        // 2. Se los enviamos a la vista
        res.render('panel', { services });
    } catch (error) {
        console.error("Error cargando panel:", error);
        // Si falla, cargamos el panel vacío para que no explote
        res.render('panel', { services: [] });
    }
});

// --- RUTAS API Y CONTROLADORES ---
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/admin', adminRoutes); // El admin sí cargará bien desde su ruta

// ==========================================
// CONFIGURACIÓN PARA JEST Y SERVIDOR
// ==========================================

async function iniciarServidor(port) {
    try {
        await db.sequelize.sync({ alter: false });
        console.log('✅ Base de datos lista.');
        
        const servidor = app.listen(port, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
        });

        servidor.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error(`❌ ERROR: El puerto ${port} está ocupado.`);
            } else {
                console.error('❌ Error al iniciar servidor:', e);
            }
        });

    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    iniciarServidor(PORT);
}

module.exports = app;