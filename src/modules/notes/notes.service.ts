import { NotesRepository } from './notes.repository';
import { NotesEntity } from './entities/notes.entity';
import { NotesCategoryService } from '../notes-category/notes-category.service';

export class NotesService {
    private repository: NotesRepository;
    private categoryService: NotesCategoryService;

    constructor() {
        this.repository = new NotesRepository();
        this.categoryService = new NotesCategoryService();
    }

    async getAllNotes(): Promise<NotesEntity[]> {
        try {
            return await this.repository.findAll();
        } catch (error) {
            throw new Error('Failed to fetch notes');
        }
    }

    async getNotesByCategoryId(categoryId: string): Promise<NotesEntity[]> {
        try {
            // Verify category exists
            await this.categoryService.getCategoryById(categoryId);

            return await this.repository.findByCategoryId(categoryId);
        } catch (error) {
            if (error instanceof Error && error.message === 'Notes category not found') {
                throw new Error('Category not found');
            }
            throw new Error('Failed to fetch notes by category');
        }
    }

    async getNoteById(id: string): Promise<NotesEntity> {
        try {
            const note = await this.repository.findById(id);
            if (!note) {
                throw new Error('Note not found');
            }
            return note;
        } catch (error) {
            if (error instanceof Error && error.message === 'Note not found') {
                throw error;
            }
            throw new Error('Failed to fetch note');
        }
    }

    async createNote(title: string, content: string, categoryId: string): Promise<NotesEntity> {
        try {
            // Validate input
            if (!title || title.trim().length === 0) {
                throw new Error('Title is required and cannot be empty');
            }
            if (!content || content.trim().length === 0) {
                throw new Error('Content is required and cannot be empty');
            }
            if (!categoryId || categoryId.trim().length === 0) {
                throw new Error('Category ID is required');
            }

            // Verify category exists
            await this.categoryService.getCategoryById(categoryId);

            // Create new note
            const newNote = await this.repository.create({
                title: title.trim(),
                content: content.trim(),
                categoryId: categoryId.trim()
            });
            return newNote;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create note');
        }
    }

    async updateNote(id: string, title: string, content: string, categoryId: string): Promise<NotesEntity> {
        try {
            // Validate input
            if (!title || title.trim().length === 0) {
                throw new Error('Title is required and cannot be empty');
            }
            if (!content || content.trim().length === 0) {
                throw new Error('Content is required and cannot be empty');
            }
            if (!categoryId || categoryId.trim().length === 0) {
                throw new Error('Category ID is required');
            }

            // Check if note exists
            const exists = await this.repository.exists(id);
            if (!exists) {
                throw new Error('Note not found');
            }

            // Verify category exists
            await this.categoryService.getCategoryById(categoryId);

            // Update note
            const updatedNote = await this.repository.update(id, {
                title: title.trim(),
                content: content.trim(),
                categoryId: categoryId.trim()
            });
            if (!updatedNote) {
                throw new Error('Failed to update note');
            }

            return updatedNote;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to update note');
        }
    }

    async deleteNote(id: string): Promise<void> {
        try {
            // Check if note exists
            const exists = await this.repository.exists(id);
            if (!exists) {
                throw new Error('Note not found');
            }

            // Delete note
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw new Error('Failed to delete note');
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Note not found') {
                throw error;
            }
            throw new Error('Failed to delete note');
        }
    }

    async deleteNotesByCategoryId(categoryId: string): Promise<void> {
        try {
            // Verify category exists
            await this.categoryService.getCategoryById(categoryId);

            // Check if there are notes in this category
            const hasNotes = await this.repository.existsByCategoryId(categoryId);
            if (!hasNotes) {
                throw new Error('No notes found in this category');
            }

            // Delete all notes in category
            const notes = await this.repository.findByCategoryId(categoryId);
            for (const note of notes) {
                await this.repository.delete(note.id);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Notes category not found') {
                throw new Error('Category not found');
            }
            if (error instanceof Error && error.message === 'No notes found in this category') {
                throw error;
            }
            throw new Error('Failed to delete notes by category');
        }
    }
}
