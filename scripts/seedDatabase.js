// seedDatabase.js - Script para poblar la base de datos con datos de ejemplo
require('dotenv').config();
const db = require('../config/database');

async function seedDatabase() {
    try {
        console.log('🌱 Poblando base de datos con datos de ejemplo...');
        
        // Conectar a la base de datos
        await db.connect();
        
        // Crear usuario de prueba
        const bcrypt = require('bcrypt');
        
        let testUser;
        if (db.type === 'mongodb') {
            testUser = await db.getModel('User').findOne({ email: 'test@example.com' });
        } else {
            const users = await db.query('SELECT * FROM users WHERE email = ?', ['test@example.com']);
            testUser = users[0];
        }
        
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('Test123!', 10);
            
            if (db.type === 'mongodb') {
                await db.getModel('User').create({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: hashedPassword,
                    phone: '+34 600 000 000',
                    address: 'Calle Test 123, Barcelona, España',
                    role: 'user',
                    emailVerified: true
                });
            } else {
                await db.query(
                    'INSERT INTO users (first_name, last_name, email, password, phone, address, role, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    ['Test', 'User', 'test@example.com', hashedPassword, '+34 600 000 000', 'Calle Test 123, Barcelona, España', 'user', true]
                );
            }
            
            console.log('✅ Usuario de prueba creado');
        } else {
            console.log('ℹ️  Usuario de prueba ya existe');
        }
        
        // Crear productos de ejemplo
        const products = [
            {
                name: 'EB Racing Hoodie',
                description: 'Sudadera oficial de EB Racing con logo bordado',
                price: 49.99,
                category: 'clothing',
                image: '/img/shop/hoodie.jpg',
                stock: 50
            },
            {
                name: 'Simracing Gloves',
                description: 'Guantes profesionales para simracing',
                price: 89.99,
                category: 'accessories',
                image: '/img/shop/gloves.jpg',
                stock: 30
            },
            {
                name: 'Racing Wheel',
                description: 'Volante de carreras profesional',
                price: 299.99,
                category: 'hardware',
                image: '/img/shop/wheel.jpg',
                stock: 15
            },
            {
                name: 'EB Racing Cap',
                description: 'Gorra oficial de EB Racing',
                price: 19.99,
                category: 'clothing',
                image: '/img/shop/cap.jpg',
                stock: 100
            },
            {
                name: 'Pedal Set',
                description: 'Set de pedales profesional de 3 pedales',
                price: 199.99,
                category: 'hardware',
                image: '/img/shop/pedals.jpg',
                stock: 20
            }
        ];
        
        if (db.type === 'mongodb') {
            for (const product of products) {
                const existingProduct = await db.getModel('Product').findOne({ name: product.name });
                if (!existingProduct) {
                    await db.getModel('Product').create(product);
                    console.log(`✅ Producto creado: ${product.name}`);
                }
            }
        } else {
            for (const product of products) {
                const existingProducts = await db.query('SELECT * FROM products WHERE name = ?', [product.name]);
                if (existingProducts.length === 0) {
                    await db.query(
                        'INSERT INTO products (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
                        [product.name, product.description, product.price, product.category, product.image, product.stock]
                    );
                    console.log(`✅ Producto creado: ${product.name}`);
                }
            }
        }
        
        console.log('🎉 Base de datos poblada exitosamente!');
        console.log('');
        console.log('📋 Usuarios de prueba:');
        console.log('   Email: test@example.com');
        console.log('   Password: Test123!');
        console.log('');
        console.log('👤 Administrador:');
        console.log('   Email: admin@ebracing.com');
        console.log('   Password: Admin123!');
        
    } catch (error) {
        console.error('❌ Error poblando base de datos:', error);
        process.exit(1);
    } finally {
        await db.disconnect();
        process.exit(0);
    }
}

seedDatabase();
