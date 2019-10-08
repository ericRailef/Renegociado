import { ResponseError } from "../model/response-error";
import { MensajesErrores } from '../../shared/utilities/mensaje-errores';

export class RespuestaTIBCO {
  codigo: string;
  descripcion: string;
  respuestaOK = '00';
}

/**
 * Clase que centraliza la validacion de la respuesta TIBCO y DATAPOWER.
 */
export class ValidadorTIBCODataPower {

  private err: ResponseError = null;

  static validarMotivoNoOfertable(codigo: string): string {
    let mensaje = '';

    switch (codigo) {
      case '008':
        mensaje = MensajesErrores.MTO_SIMULADO_SUPERIOR;
        break;
      case '021':
      case '022':
        mensaje = MensajesErrores.SIN_DEUDA;
        break;
      case '@ERRSIM001':
        mensaje = MensajesErrores.COMPRAS_EN_VUELO;
        break;
      default:
        mensaje = MensajesErrores.ERROR_GENERICO;
        break;
    }

    return mensaje;
  }

  constructor(private respTIBCO: RespuestaTIBCO) { }

  /**
   * Realiza la validacion estandar de las respuesta de TIBCO y DataPower.
   * Para poder validar TIBCO se requiere un objeto con los valores particulares
   * a cada respuesta TIBCO debido a que cada servicio retorna una estructura diferente
   * con informacion del error.
   * @param resp objeto completo retornado por el backend.
   * @param respTIBCO objeto con los datos de la respuesta TIBCO.
   */
  esValida(resp: any): boolean {
    // Se valida respuesta de DataPower
    if (resp.METADATA.STATUS !== '0') {
      this.err = new ResponseError(resp.METADATA.STATUS, resp.METADATA.DESCRIPCION, ResponseError.ORIGEN_DATAPOWER);
      return false;
    }

    // Se valida respuesta de TIBCO
    if (this.respTIBCO.codigo !== this.respTIBCO.respuestaOK) {
      this.err =  new ResponseError(this.respTIBCO.codigo, this.respTIBCO.descripcion, ResponseError.ORIGEN_TIBCO);
      return false;
    }

    return true;
  }

  getError(): ResponseError {
    return this.err;
  }
}
