import { Repository, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { NotesCategoryEntity } from './entities/notes-category.entity';

export class NotesCategoryRepository {
    private repository: Repository<NotesCategoryEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(NotesCategoryEntity);
    }

    async findAll(): Promise<NotesCategoryEntity[]> {
        return await this.repository.find();
    }

    async findById(id: string): Promise<NotesCategoryEntity | null> {
        return await this.repository.findOne({ where: { id } as FindOptionsWhere<NotesCategoryEntity> });
    }

    async create(data: Partial<NotesCategoryEntity>): Promise<NotesCategoryEntity> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async update(id: string, data: Partial<NotesCategoryEntity>): Promise<NotesCategoryEntity | null> {
        await this.repository.update(id, data);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    async exists(id: string): Promise<boolean> {
        const count = await this.repository.count({ where: { id } as FindOptionsWhere<NotesCategoryEntity> });
        return count > 0;
    }

    async findByName(name: string): Promise<NotesCategoryEntity | null> {
        return await this.repository.findOne({ where: { name } });
    }
}
