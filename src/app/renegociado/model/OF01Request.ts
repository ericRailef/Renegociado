/**
 * Representa la entrada requerida para el servicio OF-01.
 */
export interface OF01Request {
  canalLogico: string;
  usuarioAltair: string;
  idOrigen: string;
  tipoGestion: string;
  entidad: string;
  centro: string;
  rutCliente: string;
  cuentaCorrienteActiva?: string;
  cuentaCorrienteSobregiro?: string;
  indAbonoRealizado: string;

  ListaContratoCompra: ListaContratoCompra[];

  Tasa?: string;
  plazoMinimaNuevoConsumo: string;
  plazoMaximoNuevoConsumo?: string;
  productoDestino: string;
  subproductoDestino: string;
  fechaConsulta?: string;
}

export class ListaContratoCompra {
  NumeroContrato?: string;
  SistemaOrigen?: string;
  ProductoySubproducto?: string;
  CupoL1?: string;
  CupoL2?: string;
  CupoUSD?: string;
  indPago?: string;
  indBloqueo?: string;
  indCierre?: string;
  indCambioCupoL1?: string;
  indCambioCupoL2?: string;
  indCambioCupoUSD?: string;
}
