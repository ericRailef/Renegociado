import { Injectable } from '@angular/core';
import { SICCRequest } from '../model/SICCRequest';
import { Observable } from 'rxjs';
import { SICCResponse } from '../model/SICCResponse';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContextoService } from './contexto.service';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';
import { ResponseError } from './model/response-error';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';

@Injectable({
  providedIn: 'root'
})
export class SiccService {

  private readonly SICC_URI = '/renegociado/facade/callSICC';
  private siccEndpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService, private ctxSrv: ContextoService) {
    this.siccEndpoint = `${this.configSrv.getHost()}${this.SICC_URI}`;
  }

  getObtenerServicioSICC(request: SICCRequest): Observable<SICCResponse | null> {
    return Observable.create((observer) => {
      const body = {
        'RutUsuario': this.ctxSrv.rutCliente,
        'SI-CCRequest': request
      };

      const options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      this.http.post(this.siccEndpoint, body, options).subscribe((resp) => {
        const validador = new ValidadorTIBCODataPower({
          codigo: resp['DATA']['SI-CCResponse'].resultado,
          descripcion: '',
          respuestaOK: 'OK'
        });

        if (!validador.esValida(resp)) {
          observer.error(this.manejarError(validador.getError(), resp));
          observer.complete();
          return;
        }

        const siccResp = resp['DATA']['SI-CCResponse'].Data;
        observer.next(siccResp);
        observer.complete();
      }, (err) => {
        observer.error(err);
        observer.complete();
        return;
      });
    });
  }

  // Toma el error TIBCO encontrado y verifica si fue alguno de los codigos
  // de error que requieren un tratamiento especial (008, 021, 022).
  private manejarError(err: ResponseError, resp: any): ResponseError {
    // Si es un error TIBCO en este servicio se debe ir a buscar la estructura WSError
    if (err.origenError === ResponseError.ORIGEN_TIBCO) {
      const wserr = resp.DATA['SI-CCResponse'].WSError;

      // Segun especificacion es un arreglo. Se considerara el primero que se encuentre
      if (wserr && wserr.length > 0) {
        const primerErr = wserr[0].codError.trim();
        let mensaje = ValidadorTIBCODataPower.validarMotivoNoOfertable(primerErr);

        return new ResponseError(primerErr, mensaje, ResponseError.ORIGEN_TIBCO);
      }
    }

    // Error datapower, se envia error generico segun lo solicitado por el cliente
    return new ResponseError(ResponseError.COD_ERR_INTERNO, MensajesErrores.ERROR_GENERICO);
  }
}
