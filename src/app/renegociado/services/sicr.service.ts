import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { SICRRequest } from '../model/SICRRequest';
import { SICRResponse } from '../model/SICRResponse';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ContextoService } from './contexto.service';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class SicrService {

  private readonly SICR_URI = '/renegociado/facade/callSICR';
  private sicrEndpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService,
      private ctxSrv: ContextoService) {

    this.sicrEndpoint = `${this.configSrv.getHost()}${this.SICR_URI}`;
   }

   getObtenerServicioSICR(request: SICRRequest): Observable<SICRResponse> {
    return Observable.create((observer) => {
      this.http.post(this.sicrEndpoint, {
        'RutUsuario': this.ctxSrv.rutCliente,
        'SI-CRRequest': request
      }, {
        headers: new HttpHeaders({'Content-Type': 'application/json'})
      }
      ).subscribe((resp) => {
        const validador = new ValidadorTIBCODataPower({
          codigo: resp['DATA']['SI-CRResponse'].resultado,
          descripcion: 'Error en respuesta de servicio',
          respuestaOK: 'OK'
        });

        if (!validador.esValida(resp)) {
          observer.error(this.procesarTipoError(validador.getError(), resp));
          observer.complete();
          return;
        }

        const sicrResp = resp['DATA']['SI-CRResponse'].Data;
        observer.next(sicrResp);
        observer.complete();
      }, (err) => {
        observer.error(err);
        observer.complete();
        return;
      });

    });
  }

  // Verifica si es un error de negocio (TIBCO) y dependiendo del codigo retorna una
  // instancia de ResponseError con la configuracion del error respectiva.
  private procesarTipoError(err: ResponseError, resp: any): ResponseError {

    // El error es de negocio por lo que se evalua el tipo de error
    if (err.origenError === ResponseError.ORIGEN_TIBCO) {
      const wserr = resp.DATA['SI-CRResponse'].WSError;

      if (wserr && wserr.length > 0) {
        const primerErr = wserr[0].codError.trim();
        let mensaje = '';

        switch (primerErr) {
          case '@AVKTA6030':
          case '@AVKTA6050':
          case '@AVKTA8206':
          case '@AVKTA8203':
          case '@AVKTA8200':
          case '@AVKTA8204':
          case '@AVKTA8205':
            mensaje = MensajesErrores.COMPRA_DOLARES;
            break;
          default:
            mensaje = MensajesErrores.ERROR_GENERICO;
            break;
        }

        return new ResponseError(primerErr, mensaje, ResponseError.ORIGEN_TIBCO);
      }
    }

    return new ResponseError(ResponseError.COD_ERR_INTERNO, MensajesErrores.ERROR_GENERICO);
  }
}
