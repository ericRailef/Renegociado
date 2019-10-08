import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { CODARequest } from '../model/CODARequest';
import { CODAResponse } from '../model/CODAResponse';
import { Observable } from 'rxjs';
import { ContextoService } from './contexto.service';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

/**
 * Clase que encapsula la invocacion al servicio CODA.
 */
@Injectable({
  providedIn: 'root'
})
export class CodaService {

  private readonly CODA_URI = '/renegociado/facade/callCODA';
  private endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService, private ctxSrv: ContextoService) {
    this.endpoint = `${this.configSrv.getHost()}${this.CODA_URI}`;
  }

  /**
   * Invoca al servicio CODA y gestiona la respuesta.
   * @param request datos de entrada requerida
   * @returns Observable con CODAResponse.
   */
  getCODAResponse(request: CODARequest): Observable<CODAResponse> {
    return Observable.create((observer) => {
      this.http.post(this.endpoint, request, {
        headers: new HttpHeaders({'Content-Type': 'application/json' })
      }).subscribe((resp: any) => {
        const validador = new ValidadorTIBCODataPower({
          codigo: resp.DATA.resultado,
          descripcion: MensajesErrores.ERROR_GENERICO,
          respuestaOK: 'OK'
        });

        if (!validador.esValida(resp)) {
          observer.error(validador.getError());
          observer.complete();
          return;
        }

        const codaResp = resp['DATA'].Data;
        observer.next(codaResp);
        observer.complete();
      }, (err) => {
        observer.error(err);
        observer.complete();
        return;
      });
    });
  }
}
