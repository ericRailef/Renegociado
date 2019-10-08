/**
 * Representa la entrada al servicio SICR.
 */
export interface SICRRequest {
  canalLogico: string;
  usuarioAltair: string;
  entidad: string;
  centro: string;
  idSolicitud: string;
}
