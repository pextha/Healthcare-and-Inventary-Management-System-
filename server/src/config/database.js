import sql from 'mssql';

const sqlConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrongPassword123!',
    database: process.env.DB_NAME || 'SafeMotherInventory',
    server: process.env.DB_SERVER || 'localhost',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // Set to true if you're on Azure
        trustServerCertificate: true // Change for production
    }
};

let pool;

export const connectDB = async () => {
    try {
        if (pool) return pool;
        pool = await sql.connect(sqlConfig);
        console.log('MSSQL connected successfully');
        return pool;
    } catch (error) {
        console.error('MSSQL connection failed:', error.message);
        process.exit(1);
    }
};

export const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectDB() first.');
    }
    return pool;
};

export { sql };
