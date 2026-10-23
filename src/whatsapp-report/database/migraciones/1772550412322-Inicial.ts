import { MigrationInterface, QueryRunner } from "typeorm";

export class Inicial1772550412322 implements MigrationInterface {
    name = 'Inicial1772550412322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "SI_REPORTE_PLANTILLAS_WHATSAPP" ("RPW_ID" int NOT NULL IDENTITY(1,1), "RPW_ID_PLANTILLA" varchar(100) NOT NULL, "RPW_NOMBRE_PLANTILLA" varchar(200) NOT NULL, "RPW_NUMERO_VARIABLES" int NOT NULL, "RPW_UUID" varchar(200) NOT NULL, "RPW_NOMBRE" varchar(200) NOT NULL, "RPW_NUMERO" varchar(50) NOT NULL, "RPW_FECHA" date NOT NULL, "RPW_HORA" time NOT NULL, "RPW_ESTADO" varchar(50) NOT NULL, "RPW_MENSAJE" nvarchar(max) NOT NULL, "RPW_VARIABLE_JSON" nvarchar(max) NOT NULL, CONSTRAINT "PK_e7b5fa31d329bb87b2370a363be" PRIMARY KEY ("RPW_ID"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "SI_REPORTE_PLANTILLAS_WHATSAPP"`);
    }

}
