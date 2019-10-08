import { Injectable } from '@angular/core';
import { OF01Request } from '../model/OF01Request';
import { Observable } from 'rxjs';
import { OF01Response } from '../model/OF01Response';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContextoService } from './contexto.service';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ResponseError } from './model/response-error';

@Injectable({
  providedIn: 'root'
})
export class Of01Service {

  private readonly OF01_URI = '/renegociado/facade/callOF01';
  private of01Endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService, private ctxSrv: ContextoService) {
    this.of01Endpoint = `${this.configSrv.getHost()}${this.OF01_URI}`;
   }

  getObtenerServicioOF01(request: OF01Request): Observable<OF01Response> {
    return Observable.create((observer) => {
      this.http.post(this.of01Endpoint, {
        'RutUsuario': this.ctxSrv.rutCliente,
        'OF-01Request': request
      }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }).subscribe((resp) => {
        const validacionTIBCODataPower = new ValidadorTIBCODataPower({
          codigo: resp['DATA']['OF-01Response'].resultado,
          descripcion: resp['DATA']['OF-01Response'].resultado,
          respuestaOK: 'OK'
        });

        // Se valida respuesta Datapower y Tibco
        if (!validacionTIBCODataPower.esValida(resp)) {
          observer.error(validacionTIBCODataPower.getError());
          observer.complete();
          return;
        }

        const of01Resp = resp['DATA']['OF-01Response'].Data;

        observer.next(of01Resp);
        observer.complete();
      }, (err: ResponseError) => {
          observer.error(err);
          observer.complete();
          return;
      });
    });
  }

}
