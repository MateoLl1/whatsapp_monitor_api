import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1770043104739 implements MigrationInterface {
    name = 'InitSchema1770043104739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "asesores" ("as_id" SERIAL NOT NULL, "as_nombre" character varying(100) NOT NULL, "as_activo" boolean NOT NULL DEFAULT false, "as_num_whatsapp" character varying(20), CONSTRAINT "PK_561799c795ab94fb6c80d24be80" PRIMARY KEY ("as_id"))`);
        await queryRunner.query(`CREATE TABLE "conversaciones" ("co_id" SERIAL NOT NULL, "co_cliente_numero" character varying(30) NOT NULL, "co_nom_cliente" character varying, "co_fe_inicio" TIMESTAMP, "co_fe_fin" TIMESTAMP, "co_estado" character varying(20), "co_asesor_id" integer NOT NULL, CONSTRAINT "PK_1ce73d796708a519146f608a002" PRIMARY KEY ("co_id"))`);
        await queryRunner.query(`CREATE TABLE "mensajes" ("me_id" SERIAL NOT NULL, "me_mensajes" text NOT NULL, "me_objeto" character varying(100), "me_fecha" TIMESTAMP NOT NULL, "me_from_me" boolean NOT NULL DEFAULT false, "me_conv_id" integer, CONSTRAINT "PK_e0a4475a6942d759da0e10ea988" PRIMARY KEY ("me_id"))`);
        await queryRunner.query(`ALTER TABLE "conversaciones" ADD CONSTRAINT "FK_41635a24e87e840f9389c2edb41" FOREIGN KEY ("co_asesor_id") REFERENCES "asesores"("as_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mensajes" ADD CONSTRAINT "FK_81c51ca5fe2ae283a098ab8549c" FOREIGN KEY ("me_conv_id") REFERENCES "conversaciones"("co_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mensajes" DROP CONSTRAINT "FK_81c51ca5fe2ae283a098ab8549c"`);
        await queryRunner.query(`ALTER TABLE "conversaciones" DROP CONSTRAINT "FK_41635a24e87e840f9389c2edb41"`);
        await queryRunner.query(`DROP TABLE "mensajes"`);
        await queryRunner.query(`DROP TABLE "conversaciones"`);
        await queryRunner.query(`DROP TABLE "asesores"`);
    }

}
