import express from "express";
import cors from "cors";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';

import healthRouter from "./health/health.router";
import notesCategoryRouter from "./modules/notes-category/notes-category.router";
import notesRouter from "./modules/notes/notes.router";

const port = process.env.PORT || 5000;

const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./src/**/*.router.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Enable CORS for all origins (in production, specify your frontend domain)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use("/health", healthRouter);
app.use("/notes-category", notesCategoryRouter);
app.use("/notes", notesRouter);

export default app;