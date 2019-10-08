import { OF01Response } from '../../../model/OF01Response';
import { ContextoService } from 'src/app/renegociado/services/contexto.service';
import { Injectable } from '@angular/core';

/**
 * Clase que ejecuta el proceso de retoma que consiste en cargar el contexto
 * con la informacion de retoma desde OF-01 para que un usuario retome el flujo desde
 * donde haya quedado.
 */
@Injectable({
  providedIn: 'root'
})
export class Retoma {

  readonly RETOMA_SIMULACION = '0001';
  readonly RETOMA_CONFIRMACION_P1 = '0002';

  constructor(private ctxSrv: ContextoService) {

  }

  ejecutarRetoma(of01Resp: OF01Response): void {
    const siguienteTarea = of01Resp.codigoSiguienteTarea;

    switch (siguienteTarea) {
      case this.RETOMA_SIMULACION:
        this.ejecutarRetomaSimulacion(of01Resp);
        break;
      case this.RETOMA_CONFIRMACION_P1:
        this.ejecutarRetomaConfirmacionPaso1(of01Resp);
        break;
    }
  }

  private ejecutarRetomaSimulacion(of01Resp: OF01Response): void {
  }

  private ejecutarRetomaConfirmacionPaso1(of01Resp: OF01Response): void {

  }
}
