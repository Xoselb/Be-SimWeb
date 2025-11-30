// database.js - Configuración y conexión a base de datos
// Soporte para múltiples bases de datos (MongoDB, PostgreSQL, MySQL)

const mongoose = require('mongoose');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');

class DatabaseManager {
    constructor() {
        this.type = process.env.DB_TYPE || 'mongodb'; // mongodb, postgresql, mysql
        this.connection = null;
        this.models = {};
    }

    // Conectar a la base de datos
    async connect() {
        try {
            switch (this.type) {
                case 'mongodb':
                    await this.connectMongoDB();
                    break;
                case 'postgresql':
                    await this.connectPostgreSQL();
                    break;
                case 'mysql':
                    await this.connectMySQL();
                    break;
                default:
                    throw new Error('Tipo de base de datos no soportado');
            }
            console.log(`✅ Conectado a ${this.type} exitosamente`);
        } catch (error) {
            console.error(`❌ Error conectando a ${this.type}:`, error);
            throw error;
        }
    }

    // MongoDB
    async connectMongoDB() {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eb_racing';
        await mongoose.connect(mongoURI);
        this.connection = mongoose.connection;
        
        // Definir esquemas
        this.defineMongoSchemas();
    }

    // PostgreSQL
    async connectPostgreSQL() {
        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'eb_racing',
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || 5432,
        });
        
        this.connection = pool;
        await this.createPostgreSQLTables();
    }

    // MySQL
    async connectMySQL() {
        this.connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'eb_racing',
            port: process.env.DB_PORT || 3306,
        });
        
        await this.createMySQLTables();
    }

    // Esquemas MongoDB
    defineMongoSchemas() {
        // Esquema de Usuario
        const UserSchema = new mongoose.Schema({
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            phone: String,
            address: String,
            avatar: String,
            role: { type: String, default: 'user', enum: ['user', 'admin'] },
            isActive: { type: Boolean, default: true },
            emailVerified: { type: Boolean, default: false },
            lastLogin: Date,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Esquema de Reserva
        const BookingSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            service: { type: String, required: true },
            date: { type: Date, required: true },
            time: { type: String, required: true },
            duration: { type: Number, required: true }, // minutos
            status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
            totalPrice: { type: Number, required: true },
            notes: String,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Esquema de Producto
        const ProductSchema = new mongoose.Schema({
            name: { type: String, required: true },
            description: String,
            price: { type: Number, required: true },
            category: { type: String, required: true },
            image: String,
            stock: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Esquema de Pedido
        const OrderSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            items: [{
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }],
            totalAmount: { type: Number, required: true },
            status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
            shippingAddress: {
                street: String,
                city: String,
                postalCode: String,
                country: String
            },
            paymentMethod: String,
            paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed', 'refunded'] },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Esquema de Sesión
        const SessionSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            token: { type: String, required: true, unique: true },
            expiresAt: { type: Date, required: true },
            isActive: { type: Boolean, default: true },
            userAgent: String,
            ipAddress: String,
            createdAt: { type: Date, default: Date.now }
        });

        this.models.User = mongoose.model('User', UserSchema);
        this.models.Booking = mongoose.model('Booking', BookingSchema);
        this.models.Product = mongoose.model('Product', ProductSchema);
        this.models.Order = mongoose.model('Order', OrderSchema);
        this.models.Session = mongoose.model('Session', SessionSchema);
    }

    // Tablas PostgreSQL
    async createPostgreSQLTables() {
        const queries = [
            // Usuarios
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                avatar TEXT,
                role VARCHAR(20) DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Reservas
            `CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                service VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(10) NOT NULL,
                duration INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                total_price DECIMAL(10,2) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Productos
            `CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                image TEXT,
                stock INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Pedidos
            `CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                shipping_address JSONB,
                payment_method VARCHAR(50),
                payment_status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Items de pedido
            `CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL
            )`,
            
            // Sesiones
            `CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_active BOOLEAN DEFAULT true,
                user_agent TEXT,
                ip_address INET,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const query of queries) {
            await this.connection.query(query);
        }
    }

    // Tablas MySQL
    async createMySQLTables() {
        const queries = [
            // Usuarios
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                avatar TEXT,
                role ENUM('user', 'admin') DEFAULT 'user',
                is_active BOOLEAN DEFAULT TRUE,
                email_verified BOOLEAN DEFAULT FALSE,
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,
            
            // Reservas
            `CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                service VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(10) NOT NULL,
                duration INT NOT NULL,
                status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
                total_price DECIMAL(10,2) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB`,
            
            // Productos
            `CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                image TEXT,
                stock INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,
            
            // Pedidos
            `CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                shipping_address JSON,
                payment_method VARCHAR(50),
                payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB`,
            
            // Items de pedido
            `CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            ) ENGINE=InnoDB`,
            
            // Sesiones
            `CREATE TABLE IF NOT EXISTS sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                user_agent TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB`
        ];

        for (const query of queries) {
            await this.connection.execute(query);
        }
    }

    // Obtener modelo (MongoDB)
    getModel(name) {
        return this.models[name];
    }

    // Ejecutar consulta (PostgreSQL/MySQL)
    async query(sql, params = []) {
        if (this.type === 'postgresql') {
            const result = await this.connection.query(sql, params);
            return result.rows;
        } else if (this.type === 'mysql') {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        }
        throw new Error('Método query no soportado para MongoDB');
    }

    // Cerrar conexión
    async disconnect() {
        try {
            if (this.type === 'mongodb') {
                await mongoose.disconnect();
            } else if (this.type === 'postgresql') {
                await this.connection.end();
            } else if (this.type === 'mysql') {
                await this.connection.end();
            }
            console.log('✅ Desconectado de la base de datos');
        } catch (error) {
            console.error('❌ Error desconectando:', error);
        }
    }
}

module.exports = new DatabaseManager();
