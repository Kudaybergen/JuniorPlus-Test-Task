import { DataSource } from 'typeorm';
import { NotesCategoryEntity } from '../modules/notes-category/entities/notes-category.entity';
import { NotesEntity } from '../modules/notes/entities/notes.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'techworks_user',
    password: process.env.DB_PASSWORD || 'techworks_password',
    database: process.env.DB_NAME || 'techworks_db',
    entities: [NotesCategoryEntity, NotesEntity],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    migrations: [__dirname + '/../migrations/*.js'],
    migrationsTableName: 'migrations',
    subscribers: [__dirname + '/../subscribers/*.js'],
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log('Database connection established successfully');

        // Auto-run migrations
        console.log('Running migrations...');
        await AppDataSource.runMigrations();
        console.log('Migrations completed successfully');
    } catch (error) {
        console.error('Error during database initialization:', error);
        throw error;
    }
};
