// import { environment } from '../../../environments/environment';

/**
 * Clase que encapsula los errores de los servicios y la accion a ejecutar.
 */
export class ResponseError {

  static readonly COD_ERR_INTERNO = 'ERR01';

  static readonly ORIGEN_TIBCO = 'T';
  static readonly ORIGEN_DATAPOWER = 'D';

  constructor(private codigoError: string, private msjError: string, private origen: string = '') {
  }

  /**
   * Retorna una funcion por defecto que redirige al Welcome del Portal.
   */
  static getFnVolverPortal(): () => any {
    return () => {

    };
  }

  get codigo(): string { return this.codigoError; }
  get mensaje(): string { return this.msjError; }
  get origenError(): string { return this.origen; }
}
