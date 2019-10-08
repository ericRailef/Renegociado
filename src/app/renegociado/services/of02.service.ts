import { Injectable } from '@angular/core';
import { OF02Request } from '../model/OF02Request';
import { Observable, ReplaySubject } from 'rxjs';
import { OF02Response } from '../model/OF02Response';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContextoService } from 'src/app/renegociado/services/contexto.service';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';

@Injectable({
  providedIn: 'root'
})
export class Of02Service {

  private readonly OF02_URI = '/renegociado/facade/callOF02';
  private of02Endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService, private ctxSrv: ContextoService) {
    this.of02Endpoint = `${this.configSrv.getHost()}${this.OF02_URI}`;
  }

  getObtenerServicioOF02(request: OF02Request): Observable<OF02Response | any> {
    return Observable.create((observer) => {
      this.http.post(this.of02Endpoint, {
        'RutUsuario': this.ctxSrv.rutCliente,
        'OF-02Request': request
      }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }).subscribe((resp) => {

        if (resp['METADATA'].STATUS !== '0' || resp['DATA']['OF-02Response'].resultado !== 'OK') {
          observer.error('Error en respuesta de servicio');
          observer.complete();
          return;
        }
        const of02Resp = resp['DATA']['OF-02Response'].Data;

        observer.next(of02Resp);
        observer.complete();
      }, (err) => {
        observer.error(err);
        observer.complete();
        return;
      });
    });
  }
}
