import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotesTable1757777928292 implements MigrationInterface {
    name = 'CreateNotesTable1757777928292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_notes_categories_name"`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying(255) NOT NULL, "content" text NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_337c70c841b6064e5797e974c32" FOREIGN KEY ("categoryId") REFERENCES "notes_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_337c70c841b6064e5797e974c32"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_notes_categories_name" ON "notes_categories" ("name") `);
    }

}
