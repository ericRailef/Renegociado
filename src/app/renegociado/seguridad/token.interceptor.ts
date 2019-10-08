import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContextoService } from '../services/contexto.service';

/**
 * Interceptor para manejo de Token de seguridad en peticiones ejecutadas por la aplicacion.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {

  constructor(private ctxSrv: ContextoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.ctxSrv.token;
    const modified = request.clone({
      setHeaders: {
        'access-token': `${(token ? token : '')}`,
        'Content-Type' : 'application/json'
      }
    });

    return next.handle(modified);
  }
}
