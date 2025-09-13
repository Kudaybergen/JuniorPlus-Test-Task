import { NotesCategoryRepository } from './notes-category.repository';
import { NotesCategoryEntity } from './entities/notes-category.entity';

export class NotesCategoryService {
    private repository: NotesCategoryRepository;

    constructor() {
        this.repository = new NotesCategoryRepository();
    }

    async getAllCategories(): Promise<NotesCategoryEntity[]> {
        try {
            return await this.repository.findAll();
        } catch (error) {
            throw new Error('Failed to fetch notes categories');
        }
    }

    async getCategoryById(id: string): Promise<NotesCategoryEntity> {
        try {
            const category = await this.repository.findById(id);
            if (!category) {
                throw new Error('Notes category not found');
            }
            return category;
        } catch (error) {
            if (error instanceof Error && error.message === 'Notes category not found') {
                throw error;
            }
            throw new Error('Failed to fetch notes category');
        }
    }

    async createCategory(name: string): Promise<NotesCategoryEntity> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Name is required and cannot be empty');
            }

            const existingCategory = await this.repository.findByName(name.trim());
            if (existingCategory) {
                throw new Error('A category with this name already exists');
            }

            const newCategory = await this.repository.create({ name: name.trim() });
            return newCategory;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create notes category');
        }
    }

    async deleteCategory(id: string): Promise<void> {
        try {
            const exists = await this.repository.exists(id);
            if (!exists) {
                throw new Error('Notes category not found');
            }

            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw new Error('Failed to delete notes category');
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Notes category not found') {
                throw error;
            }
            throw new Error('Failed to delete notes category');
        }
    }

    async updateCategory(id: string, name: string): Promise<NotesCategoryEntity> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Name is required and cannot be empty');
            }

            const exists = await this.repository.exists(id);
            if (!exists) {
                throw new Error('Notes category not found');
            }

            const existingCategory = await this.repository.findByName(name.trim());
            if (existingCategory && existingCategory.id !== id) {
                throw new Error('A category with this name already exists');
            }

            const updatedCategory = await this.repository.update(id, { name: name.trim() });
            if (!updatedCategory) {
                throw new Error('Failed to update notes category');
            }

            return updatedCategory;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to update notes category');
        }
    }
}
