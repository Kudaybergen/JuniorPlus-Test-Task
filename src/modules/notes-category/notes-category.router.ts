import { Router, Request, Response } from "express";
import { NotesCategoryService } from "./notes-category.service";

const router = Router();
const notesCategoryService = new NotesCategoryService();

/**
 * @swagger
 * /notes-category:
 *   get:
 *     summary: Get all notes categories
 *     tags: [Notes Category]
 *     responses:
 *       200:
 *         description: List of all notes categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const categories = await notesCategoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch notes categories" });
    }
});

/**
 * @swagger
 * /notes-category:
 *   post:
 *     summary: Create a new notes category
 *     tags: [Notes Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the notes category
 *     responses:
 *       201:
 *         description: Notes category created successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const newCategory = await notesCategoryService.createCategory(name);
        res.status(201).json(newCategory);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('required') ? 400 :
            error instanceof Error && error.message.includes('already exists') ? 409 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to create notes category" });
    }
});

/**
 * @swagger
 * /notes-category/{id}:
 *   get:
 *     summary: Get notes category by ID
 *     tags: [Notes Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notes category ID
 *     responses:
 *       200:
 *         description: Notes category found
 *       404:
 *         description: Notes category not found
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await notesCategoryService.getCategoryById(id);
        res.json(category);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to fetch notes category" });
    }
});

/**
 * @swagger
 * /notes-category/{id}:
 *   put:
 *     summary: Update notes category by ID
 *     tags: [Notes Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notes category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the notes category
 *     responses:
 *       200:
 *         description: Notes category updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Notes category not found
 *       409:
 *         description: A category with this name already exists
 */
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedCategory = await notesCategoryService.updateCategory(id, name);
        res.json(updatedCategory);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('required') ? 400 :
            error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('already exists') ? 409 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to update notes category" });
    }
});

/**
 * @swagger
 * /notes-category/{id}:
 *   delete:
 *     summary: Delete notes category by ID
 *     tags: [Notes Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notes category ID
 *     responses:
 *       200:
 *         description: Notes category deleted successfully
 *       404:
 *         description: Notes category not found
 */
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await notesCategoryService.deleteCategory(id);
        res.json({ message: "Notes category deleted successfully" });
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to delete notes category" });
    }
});

export default router;