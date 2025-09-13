import 'reflect-metadata';
import app from "./app";
import { initializeDatabase } from "./config/database.config";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
