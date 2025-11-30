// setupDatabase.js - Script para configurar la base de datos
require('dotenv').config();
const db = require('../config/database');

async function setupDatabase() {
    try {
        console.log('🔧 Configurando base de datos...');
        
        // Conectar a la base de datos
        await db.connect();
        
        console.log(`✅ Base de datos ${db.type} configurada exitosamente`);
        
        // Crear índices para MongoDB
        if (db.type === 'mongodb') {
            const User = db.getModel('User');
            const Session = db.getModel('Session');
            
            // Índices únicos
            await User.collection.createIndex({ email: 1 }, { unique: true });
            await Session.collection.createIndex({ token: 1 }, { unique: true });
            await Session.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            
            console.log('✅ Índices de MongoDB creados');
        }
        
        // Crear usuario administrador por defecto
        const bcrypt = require('bcrypt');
        
        let adminUser;
        if (db.type === 'mongodb') {
            adminUser = await db.getModel('User').findOne({ email: 'admin@ebracing.com' });
        } else {
            const users = await db.query('SELECT * FROM users WHERE email = ?', ['admin@ebracing.com']);
            adminUser = users[0];
        }
        
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            
            if (db.type === 'mongodb') {
                await db.getModel('User').create({
                    firstName: 'Admin',
                    lastName: 'EB Racing',
                    email: 'admin@ebracing.com',
                    password: hashedPassword,
                    role: 'admin',
                    emailVerified: true
                });
            } else {
                await db.query(
                    'INSERT INTO users (first_name, last_name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
                    ['Admin', 'EB Racing', 'admin@ebracing.com', hashedPassword, 'admin', true]
                );
            }
            
            console.log('✅ Usuario administrador creado');
        } else {
            console.log('ℹ️  Usuario administrador ya existe');
        }
        
        console.log('🎉 Base de datos lista para usar!');
        
    } catch (error) {
        console.error('❌ Error configurando base de datos:', error);
        process.exit(1);
    } finally {
        await db.disconnect();
        process.exit(0);
    }
}

setupDatabase();
