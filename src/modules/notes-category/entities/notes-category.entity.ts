import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.sql.entity';

@Entity('notes_categories')
export class NotesCategoryEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;
}