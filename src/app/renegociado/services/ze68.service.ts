import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ZE68Request } from '../model/ZE68Request';
import { ZE68Response } from '../model/ZE68Response';
import { ContextoService } from './contexto.service';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';

@Injectable({
  providedIn: 'root'
})
export class Ze68Service {

  private readonly ZE68_URI = '/renegociado/facade/DatosComplementariosCliente';
  private ze68Endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService, private ctxSrv: ContextoService) {
    this.ze68Endpoint = `${this.configSrv.getHost()}${this.ZE68_URI}`;
   }

   getObtenerServicioZE68(request: ZE68Request): Observable<ZE68Response> {
    return Observable.create((observer) => {
      this.http.post(this.ze68Endpoint, {
        'RutUsuario': this.ctxSrv.rutCliente,
        'INPUT': request
      },
        { headers: new HttpHeaders({'Content-Type': 'application/json'}) }
      ).subscribe((resp) => {
        // error Datapower
        if (resp['METADATA'].STATUS !== '0') {
          observer.error('Error en respuesta de servicio');
          observer.complete();
          return;
        }

        const codErr = resp['DATA']['TIB_ZE68_CONDatosComplementariosCliente_Response'].INFO.CODERR;

        // se verifica que no sea un error controlado. PEE0232 corresponde a que no se encontro registro
        if (codErr !== '00' && codErr !== 'PEE0232') {
          observer.error('Error en respuesta de servicio');
          observer.complete();
          return;
        }

        const ze68Resp = resp['DATA']['TIB_ZE68_CONDatosComplementariosCliente_Response'].OUTPUT.ESCALARES;
        observer.next(ze68Resp);
        observer.complete();
      }, (err) => {
        observer.error(MensajesErrores.ERR_COMUNICACION_SRV);
        observer.complete();
        return;
      });

    });
  }
}
