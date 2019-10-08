import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { OF00Request } from '../model/OF00Request';
import { Observable } from 'rxjs';
import { OF00Response } from '../model/OF00Response';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ResponseError } from './model/response-error';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';

/**
 * Clase que encapsula la invocacion al servicio OF00 encargado de reiniciar
 * o limpiar la informacion del flujo realizado por el usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class Of00Service {

  private readonly OF00_URI = '/renegociado/facade/callOF-00';
  private endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.endpoint = `${this.configSrv.getHost()}${this.OF00_URI}`;
  }

  /**
   * Invoca al servicio OF00 y gestiona la respuesta.
   * @param request datos de entrada requerida
   * @returns Observable con OF00Response.
   */
  getOF00Response(request: OF00Request): Observable<OF00Response> {
    return Observable.create((observer) => {
      const headers = {
        headers: new HttpHeaders({'Content-Type': 'application/json' })
      };

      this.http.post(this.endpoint, request, headers).subscribe((resp: any) => {
        const validador = new ValidadorTIBCODataPower({
          codigo: resp.DATA.resultado,
          descripcion: 'Error en respuesta de servicio',
          respuestaOK: 'OK'
        });

        if (!validador.esValida(resp)) {
          observer.error(validador.getError());
          observer.complete();
          return;
        }

        const of00Resp = resp.DATA.Data;
        observer.next(of00Resp);
        observer.complete();
      }, _ => {
        observer.error(new ResponseError(ResponseError.COD_ERR_INTERNO, MensajesErrores.ERR_COMUNICACION_SRV));
        observer.complete();
      });
    });
  }
}
