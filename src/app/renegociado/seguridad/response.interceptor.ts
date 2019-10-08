import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { ContextoService } from '../services/contexto.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResponseError } from '../services/model/response-error';
import { MensajesErrores } from '../shared/utilities/mensaje-errores';
import { ConfigService } from '../services/config.service';

/**
 * Clase encargada de interceptar las response y obtener desde el header el nuevo token de seguridad.
 */
@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor(private ctxSrv: ContextoService, private configSrv: ConfigService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
    .pipe(
        tap((event) => {
          // Se verifica que la respuesta a analizar provenga del backend
          if (event instanceof HttpResponse) {

            if (event.url.indexOf('assets/') >= 0) {
              return;
            }

            if (event.url.startsWith(this.configSrv.getHost())) {
              // En caso de cualquier otro error informado por Datapower se controla
              // enviando a pagina de error o al welcome dependiendo del punto en el
              // que se encuentre el usuario.
              if (event.body.METADATA.STATUS !== '0') {
                throw new ResponseError('DATAPOWER-' + event.body.METADATA.STATUS, MensajesErrores.ERROR_GENERICO, ResponseError.ORIGEN_DATAPOWER);
              }

              const newToken = event.headers.get('access-token');
              this.ctxSrv.token = (newToken.trim().length > 0 ? newToken : this.ctxSrv.token);
            }
          }
        }, (error) => {
          console.error(error);
          throw new ResponseError('RENEGO-' + error.status, MensajesErrores.ERROR_GENERICO, ResponseError.ORIGEN_DATAPOWER);
        })
      );
  }
}

