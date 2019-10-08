import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ContrataCreditoConsumoRequest } from '../model/ContrataCreditoConsumoRequest';
import { ContrataCreditoConsumoResponse } from '../model/ContrataCreditoConsumoResponse';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class ContrataCreditoConsumoService {

  private readonly CONTRATO_CRED_CSMO_URI = '/renegociado/facade/ContrataCreditoConsumo';
  private contrataCredCsmoEndpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.contrataCredCsmoEndpoint = `${this.configSrv.getHost()}${this.CONTRATO_CRED_CSMO_URI}`;
  }

  contratarCreditoConsumo(request: ContrataCreditoConsumoRequest): Observable<ContrataCreditoConsumoResponse> {
    return Observable.create((observer) => {
      const headers = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      this.http.post(this.contrataCredCsmoEndpoint, request, headers).subscribe(
        (resp: any) => this.procesarResponse(resp, observer),
        (err: any) => this.procesarError(err, observer));
    });
  }

  private procesarResponse(resp: any, observer: any) {
    const validador = new ValidadorTIBCODataPower({
      codigo: resp.DATA.ContrataCreditoConsumo_Response.INFO.Codigo,
      descripcion: resp.DATA.ContrataCreditoConsumo_Response.INFO.Descripcion,
      respuestaOK: '00'
    });

    if (!validador.esValida(resp)) {
      observer.error(this.getDetalleErrorManejado(validador.getError(), resp));
      observer.complete();
      return;
    }

    const response: ContrataCreditoConsumoResponse = resp.DATA.ContrataCreditoConsumo_Response.OUTPUT;

    observer.next(response);
    observer.complete();
  }

  private getDetalleErrorManejado(err: ResponseError, resp: any): ResponseError {
    if (err.origenError === ResponseError.ORIGEN_TIBCO) {
      let mensaje = '';

      switch (err.codigo.trim()) {
        case '5203004':
        case '5203002':
          mensaje = MensajesErrores.SUPERCLAVE_NO_ASIGNADA;
          break;
        case '5203007':
        case '5203038':
          mensaje = MensajesErrores.ERROR_GENERICO;
          break;
        case '5203017':
        case '5203016':
          mensaje = MensajesErrores.SUPERCLAVE_BLOQUEADA;
          break;
        case '5203000':
          const intententos = resp.DATA.ContrataCreditoConsumo_Response.OUTPUT.Escalares.IntentosFallidosRestantes;
          mensaje = MensajesErrores.SUPERCLAVE_VAL_INVALIDOS.replace('[intentos]', intententos);
          break;
        default:
          mensaje = MensajesErrores.ERROR_GENERICO;
          break;
      }

      return new ResponseError(err.codigo.trim(), mensaje);
    }

    return new ResponseError(ResponseError.COD_ERR_INTERNO, MensajesErrores.ERROR_GENERICO);
  }

  private procesarError(resp: ResponseError, observer: any) {
    observer.error(resp);
    observer.complete();
    return;
  }
}
