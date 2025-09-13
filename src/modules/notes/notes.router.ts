import { Router, Request, Response } from "express";
import { NotesService } from "./notes.service";

const router = Router();
const notesService = new NotesService();

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: List of all notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   categoryId:
 *                     type: string
 *                   category:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const notes = await notesService.getAllNotes();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch notes" });
    }
});

/**
 * @swagger
 * /notes/category/{categoryId}:
 *   get:
 *     summary: Get notes by category ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of notes in the category
 *       404:
 *         description: Category not found
 */
router.get("/category/:categoryId", async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const notes = await notesService.getNotesByCategoryId(categoryId);
        res.json(notes);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to fetch notes by category" });
    }
});

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the note
 *               content:
 *                 type: string
 *                 description: Content of the note
 *               categoryId:
 *                 type: string
 *                 description: ID of the category
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Category not found
 */
router.post("/", async (req: Request, res: Response) => {
    try {
        const { title, content, categoryId } = req.body;
        const newNote = await notesService.createNote(title, content, categoryId);
        res.status(201).json(newNote);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('required') ? 400 :
            error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to create note" });
    }
});

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note found
 *       404:
 *         description: Note not found
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const note = await notesService.getNoteById(id);
        res.json(note);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to fetch note" });
    }
});

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title of the note
 *               content:
 *                 type: string
 *                 description: New content of the note
 *               categoryId:
 *                 type: string
 *                 description: New category ID
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Note or category not found
 */
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, categoryId } = req.body;
        const updatedNote = await notesService.updateNote(id, title, content, categoryId);
        res.json(updatedNote);
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('required') ? 400 :
            error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to update note" });
    }
});

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await notesService.deleteNote(id);
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to delete note" });
    }
});

/**
 * @swagger
 * /notes/category/{categoryId}:
 *   delete:
 *     summary: Delete all notes in a category
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Notes deleted successfully
 *       404:
 *         description: Category not found or no notes in category
 */
router.delete("/category/:categoryId", async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        await notesService.deleteNotesByCategoryId(categoryId);
        res.json({ message: "Notes deleted successfully" });
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ error: error instanceof Error ? error.message : "Failed to delete notes by category" });
    }
});

export default router;
