import dataSource from '../../database/whatsapp-report.data-source'
import { ReportePlantillaWhatsappEntity } from '../entidades/reporte-plantilla-whatsapp.entidad'

async function ejecutarSeedReportes() {
  await dataSource.initialize()

  const repositorio = dataSource.getRepository(ReportePlantillaWhatsappEntity)

  const datos: Partial<ReportePlantillaWhatsappEntity>[] = [
    {
      rpw_id_plantilla: '1',
      rpw_nombre_plantilla: 'proteccion_de_datos|es_ES',
      rpw_numero_variables: 2,
      rpw_uuid: '7348666af479452987176ef5fd44552b',
      rpw_nombre: 'GIANELA GUTIERRES',
      rpw_numero: '593984395843',
      rpw_fecha: new Date('2026-03-02'),
      rpw_hora: '10:49:21',
      rpw_estado: 'ERR_BAD_REQUEST',
      rpw_mensaje:
        '400 - "{\\"error\\":{\\"template_uuid\\":[\\"does not exist, make sure the uuid is correct or create a new template message\\"]}}"',
      rpw_variable_json: ''
    },
    {
      rpw_id_plantilla: '1',
      rpw_nombre_plantilla: 'proteccion_de_datos|es_ES',
      rpw_numero_variables: 2,
      rpw_uuid: '7348666af479452987176ef5fd44552b',
      rpw_nombre: 'DANIEL SOLORZANO',
      rpw_numero: '593998266800',
      rpw_fecha: new Date('2026-03-02'),
      rpw_hora: '15:48:18',
      rpw_estado: 'Enviado',
      rpw_mensaje: '',
      rpw_variable_json: '["DANIEL SOLORZANO","https://link.autoconsa.com/b72bobc65g15p2l"]'
    },
    {
      rpw_id_plantilla: '2',
      rpw_nombre_plantilla: 'nueva_encuesta_dos_horas|es_EC',
      rpw_numero_variables: 4,
      rpw_uuid: 'be463e7a7b0942a9866a9aae1851b669',
      rpw_nombre: 'CONGELADOS ECUATORIANOS CONECUA',
      rpw_numero: '593997043659',
      rpw_fecha: new Date('2026-03-02'),
      rpw_hora: '15:48:41',
      rpw_estado: 'Enviado',
      rpw_mensaje: '',
      rpw_variable_json:
        '["CONGELADOS ECUATORIANOS CONECUA","GROOVE LTZ AC 1.5 5P 4X2 TM","TANCA MARENGO","https://link.autoconsa.com/u72oxv2bgdb1zc7"]'
    }
  ]

  await repositorio.insert(datos)

  await dataSource.destroy()
}

ejecutarSeedReportes().catch(() => process.exit(1))