import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { GEDORequest } from '../model/GEDORequest';
import { Observable } from 'rxjs';
import { GEDOResponse } from '../model/GEDOResponse';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class GedoService {

  private readonly GEDO_URI = '/renegociado/facade/callGE-DO';
  private gedoEndpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.gedoEndpoint = `${this.configSrv.getHost()}${this.GEDO_URI}`;
  }

  getObtenerServicioGEDO(request: GEDORequest): Observable<GEDOResponse> {
    return Observable.create((observer) => {
      const headers = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      this.http.post(this.gedoEndpoint, request, headers).subscribe((resp: any) => {
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

        const gedoResp = resp['DATA'].Data;

        observer.next(gedoResp);
        observer.complete();
      }, (err) => {
          observer.error(err);
          observer.complete();
          return;
      });
    });
  }
}
