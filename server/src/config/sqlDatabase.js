import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';

// If running outside the normal flow, load env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

let appPool;

export const connectMSSQL = async () => {
    try {
        if (appPool) {
            return appPool;
        }
        appPool = await sql.connect(sqlConfig);
        console.log('MSSQL connected successfully');
        return appPool;
    } catch (error) {
        console.error('MSSQL Database Connection Failed!', error);
        throw error;
    }
};

export { sql };
