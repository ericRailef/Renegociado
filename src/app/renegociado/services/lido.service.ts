import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { LIDORequest } from '../model/LIDORequest';
import { LIDOResponse } from '../model/LIDOResponse';
import { Observable } from 'rxjs';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class LidoService {

  private readonly LIDO_URI = '/renegociado/facade/callLI-DO';
  private lidoEndpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.lidoEndpoint = `${this.configSrv.getHost()}${this.LIDO_URI}`;
  }

  getObtenerServicioLIDO(request: LIDORequest): Observable<LIDOResponse> {
    return Observable.create((observer) => {
      const headers = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      this.http.post(this.lidoEndpoint, request, headers).subscribe((resp: any) => {
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

        const lidoResp = resp['DATA'].Data;

        observer.next(lidoResp);
        observer.complete();
      }, err => {
          observer.error(err);
          observer.complete();
          return;
      });
    });
  }
}
