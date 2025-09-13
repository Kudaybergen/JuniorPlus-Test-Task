import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'techworks_user',
    password: process.env.DB_PASSWORD || 'techworks_password',
    database: process.env.DB_NAME || 'techworks_db',
    entities: [],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Error during database initialization:', error);
        throw error;
    }
};
