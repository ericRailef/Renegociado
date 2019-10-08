import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { ConsultaDesafiosRequest } from '../model/ConsultaDesafiosRequest';
import { Observable } from 'rxjs';
import { ConsultaDesafiosResponse } from '../model/ConsultaDesafiosResponse';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

/**
 * Servicio que invoca al backend para obtener el desafio de seguridad.
 */
@Injectable({
  providedIn: 'root'
})
export class ConsultaDesafiosService {

  private readonly CONSULTAR_DESAFIO_URI = '/renegociado/facade/CONDesafios';
  private endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.endpoint = `${this.configSrv.getHost()}${this.CONSULTAR_DESAFIO_URI}`;
  }

  consultarDesafio(request: ConsultaDesafiosRequest): Observable<ConsultaDesafiosResponse> {
    return Observable.create(observer => {
      const headers = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      this.http.post(this.endpoint, request, headers).subscribe((resp: any) => {
        const validador = new ValidadorTIBCODataPower({
          codigo: resp.DATA.Solicitar_Desafio_Response.Informacion.Codigo,
          descripcion: resp.DATA.Solicitar_Desafio_Response.Informacion.Mensaje,
          respuestaOK: '00'
        });

        if (!validador.esValida(resp)) {
          observer.error(this.procesarTipoError(validador.getError(), resp));
          observer.complete();
          return;
        }

        observer.next(resp.DATA.Solicitar_Desafio_Response.Salida as ConsultaDesafiosResponse);
        observer.complete();
      }, err => {
          observer.error(err);
          observer.complete();
          return;
      });
    });
  }

  private procesarTipoError(err: ResponseError, resp: any): ResponseError {
    if (err.origenError === ResponseError.ORIGEN_TIBCO) {

      // Se valida el resultado obtenido en la 'Salida' de la respuesta
      if (err.codigo.trim() === '16') {
        const resultado = resp.DATA.Solicitar_Desafio_Response.Salida.Resultado;
        let mensaje = '';

        switch (resultado.trim()) {
          case '5203002':
          case '5203004':
            mensaje = MensajesErrores.SUPERCLAVE_NO_ASIGNADA;
            break;
          case '5203016':
          case '5203038':
            mensaje = MensajesErrores.SUPERCLAVE_BLOQUEADA;
            break;
          case '5203040':
            mensaje = MensajesErrores.SUPERCLAVE_INACTIVA;
            break;
          default:
            mensaje = MensajesErrores.ERROR_GENERICO;
            break;
        }

        return new ResponseError(ResponseError.COD_ERR_INTERNO, mensaje);
      }
    }

    return new ResponseError(ResponseError.COD_ERR_INTERNO, MensajesErrores.ERROR_GENERICO);
  }
}
