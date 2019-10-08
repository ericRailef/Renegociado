/**
 * Representa la entrada para el servicio OF-02
 */
export interface OF02Request {
    canalLogico: string;
    usuarioAltair: string;
    entidad: string;
    idOrigen: string;
    indDetalleDeuda: string;
    valorUF: string;
    fechaConsulta: string;
    idSolicitud: string;
}
