import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CancelarVisualResponse } from '../model/CancelarVisualResponse';
import { Observable } from 'rxjs';
import { CancelarVisualRequest } from '../model/CancelarVisualRequest';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class CancelarVisualService {

  private readonly CANCELAR_VISUAL_URI = '/renegociado/facade/cancelarVisual';
  private endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.endpoint = `${this.configSrv.getHost()}${this.CANCELAR_VISUAL_URI}`;
  }

  /**
   * Invoca al servicio 'cancelarVisual'. Si todo sale ok, se retorna una instancia de
   * Observable<CancelarVisualResponse>.
   * @param request instancia de CancelarVisualRequest
   */
  getCancelarVisualResponse(request: CancelarVisualRequest): Observable<CancelarVisualResponse> {
    return Observable.create(observer => {
      const headers = { headers: new HttpHeaders({'Content-Type': 'application/json' }) };

      this.http.post(this.endpoint, request, headers).subscribe(resp => {
        const validador = new ValidadorTIBCODataPower({
          codigo: resp['DATA'].Response_PR_HOB_CLT_CAL_VSN_CPN.INFO.Codigo,
          descripcion: resp['DATA'].Response_PR_HOB_CLT_CAL_VSN_CPN.INFO.Descripcion,
          respuestaOK: '00'
        });

        if (!validador.esValida(resp)) {
          observer.error(validador.getError());
          observer.complete();
          return;
        }

        const response: CancelarVisualRequest = resp['DATA'].Response_PR_HOB_CLT_CAL_VSN_CPN.OUTPUT.Escalares;

        observer.next(response);
        observer.complete();
      }, err => {
        observer.error(err);
        observer.complete();
        return;
      });
    });
  }

}
