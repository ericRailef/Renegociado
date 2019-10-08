import { ListaContratoCompra } from './OF01Request';
/**
 * Representacion de los datos de salida del servicio backend datosCampCliAsociado.
 *
 * Esta clase solo almacena los capos utilizados por la aplicacion y no toda la informacion
 * enviada por el backend.
 */
export class DatosCampanaResponse {
  tipoGestion: string;
  cuentaCorrienteActiva: string;
  indAbonoRealizado: string;
  Tasa: string;
  plazoMinimaNuevoConsumo: string;
  plazoMaximoNuevoConsumo: string;
  productoDestino: string;
  subproductoDestino: string;

  ListaContratos: ListaContratoCompra[];
}
