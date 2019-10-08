import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { CampanaAceptadaRequest } from '../model/CampanaAceptadaRequest';
import { Observable } from 'rxjs';
import { CampanaAceptadaResponse } from '../model/CampanaAceptadaResponse';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class CampanaAceptadaService {

  private readonly CAMPANA_ACEPTADA_URI = '/renegociado/facade/CampClienteAceptada';
  private endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.endpoint = `${this.configSrv.getHost()}${this.CAMPANA_ACEPTADA_URI}`;
  }

  aceptarCampana(req: CampanaAceptadaRequest): Observable<CampanaAceptadaResponse> {
    return Observable.create(observer => {
      const headers = { headers: new HttpHeaders({'Content-Type': 'application/json' }) };

      this.http.post(this.endpoint, req, headers).subscribe(
        resp => this.procesarResponse(resp, observer),
        err => this.procesarError(err, observer)
      );
    });
  }

  private procesarResponse(resp: any, observer: any) {
    const validador = new ValidadorTIBCODataPower({
      codigo: resp.DATA.Response_pr_hob_cpn_cli_ace.INFO.Codigo,
      descripcion: resp.DATA.Response_pr_hob_cpn_cli_ace.INFO.Descripcion,
      respuestaOK: '00'
    });

    if (!validador.esValida(resp)) {
      observer.error(validador.getError());
      observer.complete();
      return;
    }

    const response: CampanaAceptadaResponse = resp.DATA.Response_pr_hob_cpn_cli_ace.OUTPUT.Escalares;

    observer.next(response);
    observer.complete();
  }

  private procesarError(err: any, observer: any) {
    observer.error(new ResponseError(ResponseError.COD_ERR_INTERNO, 'No ha sido posible obtener respuesta'));
    observer.complete();
    return;
  }
}
