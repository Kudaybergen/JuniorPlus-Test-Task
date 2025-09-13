import { Router, Request, Response } from "express";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Health check status message
 *           example: "Health check passed"
 *       required:
 *         - message
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               message: "Health check passed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */
router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Health check passed" });
});

export default router;