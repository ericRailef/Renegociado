import { Component, OnInit, Input } from '@angular/core';
import { DetalleSimulacionData } from './model/detalleSimulacionData';
import { ContextoService } from '../../../services/contexto.service';
import { SicrService } from '../../../services/sicr.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LABELS_ALERTA_DEFAULT1 } from '../alerta/alerta.component';
import { LoadingService } from '../loading/loading.service';
import { ErrorService } from '../../../services/error.service';
import { ResponseError } from '../../../services/model/response-error';
import { MensajesErrores } from '../../utilities/mensaje-errores';
import { SICRResponse } from '../../../model/SICRResponse';


@Component({
  selector: 'app-detalle-simulacion',
  templateUrl: './detalle-simulacion.component.html',
  styleUrls: ['./detalle-simulacion.component.css']
})
export class DetalleSimulacionComponent implements OnInit {

  eventoAbrirAcordeon: Subject<void> = new Subject<void>();

  dialogoError: any;
  btnSiguienteEnEjecucion = false;

  @Input() flagVer = false;
  @Input() data: DetalleSimulacionData;

  verRebajaCierre = true;

  constructor(private ctxSrv: ContextoService,
              private sicrSrv: SicrService,
              private router: Router,
              private loadingSrv: LoadingService,
              private errorSrv: ErrorService) {
    // Atributos para manejo de dialogo de error
    this.dialogoError = {
      display: false,
      titulo: LABELS_ALERTA_DEFAULT1.titulo,
      detalle: LABELS_ALERTA_DEFAULT1.detalle
    };
  }

  ngOnInit() {
    // Si no hay rebaja ni cierre de productos (tarjetas ni lineas de credito)
    this.verRebajaCierre = this.verificarRebajaCupoCierreProductos();
  }

  private verificarRebajaCupoCierreProductos() {
    // Vienen null
    if (!this.data.modificacionProductosTC && !this.data.modificacionProductosLCA) {
      return false;
    }

    // Al menos una viene informada
    return true;
  }

  onClickSiguiente() {
    this.loadingSrv.setHttpStatus(true, '');
    this.btnSiguienteEnEjecucion = true;

    const sicrRequest = {
      canalLogico: this.ctxSrv.canalLogico,
      usuarioAltair: this.ctxSrv.usuarioAltair,
      entidad: this.ctxSrv.entidad,
      centro: this.ctxSrv.centro,
      idSolicitud: this.ctxSrv.idSolicitud
    };

    this.sicrSrv.getObtenerServicioSICR(sicrRequest)
      .subscribe(resp => this.procesarRespuestaSICR(resp), (err: ResponseError) => this.manejarErrorSICR(err));
  }

  private procesarRespuestaSICR(resp: SICRResponse): void {
    // Se valida que el cliente siga siendo ofertable, caso contrario se envia a pagina de error
    if (resp.IndOfertable.trim() !== 'S') {
      this.errorSrv.irPaginaErrorConDetalle({
        titulo: LABELS_ALERTA_DEFAULT1.titulo,
        detalle: MensajesErrores.ERROR_GENERICO
      });
      this.loadingSrv.setHttpStatus(false);
      return;
    }

    // El cliente sigue siendo ofertable en este punto
    this.procesarClienteOfertable(resp);
  }

  private procesarClienteOfertable(resp: SICRResponse): void {
    this.loadingSrv.setHttpStatus(false);

    // se actualizan datos transversales a la aplicacion
    this.ctxSrv.idSolicitud = resp.idSolicitud;
    this.ctxSrv.selSegCesantia = this.getFlagSiNo(resp.selSegCesantia);
    this.ctxSrv.selSegDesgravamen = this.getFlagSiNo(resp.selSegDesgravamen);
    this.ctxSrv.indContratoMarcoFirmado = this.getFlagSiNo(resp.Ind_ContratoMarcoFirmado);

    // datos para pagina de confirmacion
    this.ctxSrv.ctx.confirmacion.cuentaCorrienteCargo = resp.CuentaCorrienteCargo;

    this.ctxSrv.solicitudCreada = true;
    this.router.navigateByUrl('/confirmacion');
  }

  private manejarErrorSICR(err: ResponseError): void {
    this.ctxSrv.solicitudCreada = false;
    this.btnSiguienteEnEjecucion = false;
    this.loadingSrv.setHttpStatus(false);

    this.errorSrv.irPaginaErrorConDetalle({
      titulo: LABELS_ALERTA_DEFAULT1.titulo,
      detalle: err.mensaje
    });
  }

  /*
   * Si el monto es cero corresponde a un cierre de producto.
   */
  cierreProducto(monto: string): boolean {
    return (!monto || Number(monto.substring(0, monto.length - 1)) === 0);
  }

  private getFlagSiNo(backendFlag: string): string {
    return (backendFlag && backendFlag !== null ? backendFlag.trim() : 'N');
  }

  verificarErrorVolver(err: ResponseError) {
    switch (err.origenError) {
      case ResponseError.ORIGEN_TIBCO:
        this.dialogoError.display = true;
        this.dialogoError.detalle = MensajesErrores.ERROR_GENERICO;
        break;
      default:
        this.errorSrv.irPaginaErrorConDetalle({ titulo: 'Error', detalle: MensajesErrores.ERROR_GENERICO });
        break;
    }
  }

  montoUSDValido(valorUSD: string): boolean {
    if (!valorUSD || valorUSD.trim() === '') {
      return false;
    }

    const monto: Number = Number(valorUSD);

    return monto && monto > 0.00;
  }
}
