import { Repository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { NotesEntity } from './entities/notes.entity';

export class NotesRepository {
    private repository: Repository<NotesEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(NotesEntity);
    }

    async findAll(): Promise<NotesEntity[]> {
        return await this.repository.find({
            relations: ['category']
        });
    }

    async findById(id: string): Promise<NotesEntity | null> {
        return await this.repository.findOne({
            where: { id } as FindOptionsWhere<NotesEntity>,
            relations: ['category']
        });
    }

    async findByCategoryId(categoryId: string): Promise<NotesEntity[]> {
        return await this.repository.find({
            where: { categoryId } as FindOptionsWhere<NotesEntity>,
            relations: ['category']
        });
    }

    async create(data: Partial<NotesEntity>): Promise<NotesEntity> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async update(id: string, data: Partial<NotesEntity>): Promise<NotesEntity | null> {
        await this.repository.update(id, data);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.repository.count({ where: { id } as FindOptionsWhere<NotesEntity> });
        return count > 0;
    }

    async existsByCategoryId(categoryId: string): Promise<boolean> {
        const count = await this.repository.count({ where: { categoryId } as FindOptionsWhere<NotesEntity> });
        return count > 0;
    }
}
