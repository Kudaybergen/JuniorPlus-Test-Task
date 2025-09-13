import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/base.sql.entity";
import { NotesCategoryEntity } from "../../notes-category/entities/notes-category.entity";


@Entity('notes')
export class NotesEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'uuid' })
    categoryId!: string;

    @ManyToOne(() => NotesCategoryEntity, (category) => category.id)
    category!: NotesCategoryEntity;
}