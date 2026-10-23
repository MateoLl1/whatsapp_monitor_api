


export interface RespuestaPaginadaReporteDto<T> {
  pagina: number
  limite: number
  total: number
  datos: T[]
}