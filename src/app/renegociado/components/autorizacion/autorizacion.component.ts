import { Component, PipeTransform, Pipe, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { ContextoService } from '../../services/contexto.service';
import { Router } from '@angular/router';
import { Of00Service } from '../../services/of00.service';
import { LABELS_ALERTA_DEFAULT1 } from '../../shared/components/alerta/alerta.component';
import { OF00Request } from '../../model/OF00Request';
import { FormateadorBackend } from '../../shared/utilities/formateador-backend';
import { FormatoRutPipe } from '../../shared/pipes/formato-rut.pipe';
import { ConsultaDesafiosService } from '../../services/consulta-desafios.service';
import { ConsultaDesafiosRequest } from '../../model/ConsultaDesafiosRequest';
import { ConfigService } from '../../services/config.service';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { ResponseError } from '../../services/model/response-error';
import { ErrorService } from '../../services/error.service';
import { MensajesErrores } from '../../shared/utilities/mensaje-errores';
import { CampanaAceptadaService } from '../../services/campana-aceptada.service';
import { CampanaAceptadaRequest } from '../../model/CampanaAceptadaRequest';
import { ContrataCreditoConsumoService } from '../../services/contrata-credito-consumo.service';
import { ContrataCreditoConsumoRequest } from '../../model/ContrataCreditoConsumoRequest';
import { ContrataCreditoConsumoResponse } from '../../model/ContrataCreditoConsumoResponse';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-autorizacion',
  templateUrl: './autorizacion.component.html',
  styleUrls: ['./autorizacion.component.css']
})
export class AutorizacionComponent implements OnInit, OnDestroy {

  static readonly ERR_OBLIGATORIOS = 'Todos los campos son requeridos';

  // Objeto para invocar of00. Al volver atras el campo volverAlInicio va en 'N'
  private readonly requestOF00: OF00Request = {
    RutUsuario: this.ctxSrv.rutCliente,
    volverAlInicio: 'N',
    canalLogico: this.ctxSrv.canalLogico,
    usuarioAltair: this.ctxSrv.usuarioAltair,
    entidad: this.ctxSrv.entidad,
    idOrigen: this.ctxSrv.idOrigen,
    idSolicitud: this.ctxSrv.idSolicitud
  };

  // Manejo de cuadro de dialogo de error
  dialogoError = {
    ver: false,
    tipo: 'warn',
    labelBoton: 'Aceptar',
    titulo: LABELS_ALERTA_DEFAULT1.titulo,
    detalle: LABELS_ALERTA_DEFAULT1.detalle
  };

  errorValidacionToken = {
    ver: false,
    tipo: 'warn',
    labelBoton: 'Intentar nuevamente',
    titulo: 'Se ha producido un error al validar la clave',
    detalle: ''
  };

  documentos = {
    mandatoURL: null,
    contratoServAutomatizados: null,
    contratoCompraVentaDivisas: null,
    contratoMarco: null,
    polizas: null
  };

  dataUsuario = {
    existenSeguros: false,
    aceptaTerminosContrato: false,
    aceptaPolizas: false,
    superClave: {
      nroTarjeta: undefined,
      desafio: {
        coord1: undefined,
        coord2: undefined,
        coord3: undefined
      },
      clave: {
        clave1: undefined,
        clave2: undefined,
        clave3: undefined
      }
    }
  };

  botonEnEjecucion = false;
  mostrarSuperClave = false;

  @ViewChild('pdfViewer') pdfViewer;
  mandatoCargado = false;

  private aceptarCampanaReq: CampanaAceptadaRequest;

  constructor(private ctxSrv: ContextoService, private of00Srv: Of00Service,
        private contrataCreditoCsmoSrv: ContrataCreditoConsumoService, private router: Router,
        private rutPipe: FormatoRutPipe, private desafioSrv: ConsultaDesafiosService,
        private loadingSrv: LoadingService, private errorSrv: ErrorService,
        private aceptarCampSrv: CampanaAceptadaService,
        configSrv: ConfigService) {

    const documentosCtx = this.ctxSrv.ctx.autorizacion.documentos;

    // this.documentos.mandatoURL = `data:application/pdf;base64,${documentosCtx.mandato.data}`;

    // Estos se cargan a partir del servicio GEDO por lo que se guarda el tipo documental
    this.documentos.contratoServAutomatizados = documentosCtx.contratoServAutomatizados;
    this.documentos.contratoCompraVentaDivisas = documentosCtx.contratoCompraVentaDivisas;
    this.documentos.contratoMarco = documentosCtx.contratoMarco;
    this.documentos.polizas = documentosCtx.polizas;

    // informacion de seguros seleccionados
    this.dataUsuario.existenSeguros = (this.ctxSrv.selSegCesantia === 'S' || this.ctxSrv.selSegDesgravamen === 'S');

    // Request del servicio de CampanaAceptada
    this.aceptarCampanaReq = {
      RutUsuario: this.ctxSrv.rutCliente,
      CodCpn: this.ctxSrv.codCPN,
      NroDocPsn: FormateadorBackend.rutFromBackend(this.ctxSrv.rutCliente)
    };
  }

  ngOnInit() {
    this.displayMandato(this.ctxSrv.ctx.autorizacion.documentos.mandato.data);
  }

  ngOnDestroy(): void {
    if (this.ctxSrv.esRetoma) {
      this.ctxSrv.esRetoma = false;
    }
  }

  private displayMandato(data: string) {
    this.pdfViewer.pdfSrc = this.base64ToBlob(data);
    this.pdfViewer.refresh();
    this.mandatoCargado = true;
  }

  private base64ToBlob(data: string): Blob {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: 'application/pdf' });
  }

  soloNumeros(event: any) {
    const keyCode = event.keyCode;

    // Se validan que solo sean teclas numericas, tanto el teclado normal como del teclado numerico
    if (keyCode > 31 && (keyCode < 48 || keyCode > 57) && (keyCode < 96 || keyCode > 105)) {
      return false;
    }

    return true;
  }

  cambiarFoco(value: string, nextFoco: string = '') {
    if (nextFoco !== '' && value.length === 2) {
      document.getElementById(nextFoco).focus();
    }
  }

  // Verifica si el usuario ha aceptado los terminos y condiciones.
  // En caso que existan seguros el usuario debe marcar ambos checkbox.
  verificarAceptacionTerminos() {
    if ((this.dataUsuario.existenSeguros && this.dataUsuario.aceptaPolizas && this.dataUsuario.aceptaTerminosContrato) ||
        (!this.dataUsuario.existenSeguros && this.dataUsuario.aceptaTerminosContrato)) {

      this.obtenerDesafio();
    } else {
      this.mostrarSuperClave = false;
    }
  }

  /*
   * Vuelve a la pagina de Confirmacion.
   */
  onClickVolverAtras() {
    this.loadingSrv.setHttpStatus(true);

    this.of00Srv.getOF00Response(this.requestOF00).subscribe(resp => {
      this.loadingSrv.setHttpStatus(false);

      // campos comunes
      this.ctxSrv.selSegCesantia = resp.indSeguroCesantia;
      this.ctxSrv.selSegDesgravamen = resp.indSeguroDesgravamen;

      // campos requeridos por la pagina
      const dataConfirmacion = this.ctxSrv.ctx.confirmacion;
      dataConfirmacion.telefono = FormateadorBackend.telefonoFromBackend(resp.telefonoMovil);
      dataConfirmacion.email = resp.email;
      dataConfirmacion.autorizacion = true;
      dataConfirmacion.participaSociedades = (resp.flagParticipaciones && resp.flagParticipaciones.trim() === 'S');
      dataConfirmacion.esAvalFiador = (resp.flagAvales && resp.flagAvales.trim() === 'S');
      dataConfirmacion.tienePreExistencias = (resp.indDPS === 'S');
      dataConfirmacion.preExistencias = resp.descripcionDPS;
      dataConfirmacion.cuentaCorrienteCargo = resp.cuentaCorrienteCargo;

      if (dataConfirmacion.participaSociedades && resp.ListadoSociedades) {
        dataConfirmacion.listadoSociedades = resp.ListadoSociedades.map(sociedad => {
          sociedad.rutSociedad = this.rutPipe.transform(sociedad.rutSociedad);
          sociedad.capital = FormateadorBackend.porcentajeFromBackend(sociedad.capital);
          sociedad.utilidad = FormateadorBackend.porcentajeFromBackend(sociedad.utilidad);
          sociedad.tipoSociedad = sociedad.tipoSociedad.trim();
          return sociedad;
        });
      }

      if (dataConfirmacion.esAvalFiador && resp.ListadoAvales) {
        dataConfirmacion.listadoAvaloFiador = resp.ListadoAvales.map(sociedad => {
          sociedad.rutSociedad = this.rutPipe.transform(sociedad.rutSociedad);
          sociedad.utilidad = FormateadorBackend.porcentajeFromBackend(sociedad.utilidad);
          sociedad.tipoSociedad = sociedad.tipoSociedad.trim();
          return sociedad;
        });
      }

      this.router.navigateByUrl('/confirmacion');
    }, (err: ResponseError) => this.verificarErrorVolver(err));
  }

  /**
   * Valida que la SuperClave este ingresada e invoca al servicio ContrataCreditoConsumo.
   */
  onClickContratar() {
    if (!this.mostrarSuperClave) {
      this.mostrarError('', AutorizacionComponent.ERR_OBLIGATORIOS, 'err');
      return;
    }

    const request: ContrataCreditoConsumoRequest = {
      RutUsuario: this.ctxSrv.rutCliente,
      Cabecera: {
        HOST: {
          'USUARIO-ALT': this.ctxSrv.usuarioAltair,
          'TERMINAL-ALT': '',
          'CANAL-ID': ''
        },
        CanalFisico: this.ctxSrv.canalFisico,
        CanalLogico: this.ctxSrv.canalLogico,
        RutCliente: this.ctxSrv.rutCliente,
        RutUsuario: this.ctxSrv.rutCliente,
        IpCliente: '',
        InfoDispositivo: '',
        InfoDataPower: '',
        InfoArquitectura: '',
        InfoGeneral: ''
      },
      INPUT: {
        RutCliente: this.ctxSrv.rutCliente,
        MatrizDesafio: `${this.dataUsuario.superClave.clave.clave1};${this.dataUsuario.superClave.clave.clave2};${this.dataUsuario.superClave.clave.clave3}`,
        entidad: this.ctxSrv.entidad,
        idOrigen: this.ctxSrv.idOrigen,
        idSolicitud: this.ctxSrv.idSolicitud,
        fechaConsulta: ''
      }
    };

    this.botonEnEjecucion = true;
    this.loadingSrv.setHttpStatus(true);

    this.contrataCreditoCsmoSrv.contratarCreditoConsumo(request).subscribe(
      (resp: ContrataCreditoConsumoResponse) => this.procesarSeguroContratado(resp),
      (err: ResponseError) => this.manejarErrorContratacion(err)
    );
  }

  private procesarSeguroContratado(resp: ContrataCreditoConsumoResponse) {
    this.ctxSrv.contrataCreditoConsumoResponse = resp;

    const irContratado = () => {
      this.loadingSrv.setHttpStatus(false);
      this.router.navigateByUrl('/contratado');
    };

    // Se invoca a servicio que marcara en el backend que la campana y credito fue contratado por el cliente.
    // en caso de algun error en este servicio, el usuario no se enterara.
    this.aceptarCampSrv.aceptarCampana(this.aceptarCampanaReq).subscribe(
      _ => irContratado(),
      _ => irContratado());
  }

  private manejarErrorContratacion(err: ResponseError) {
    this.botonEnEjecucion = false;
    this.loadingSrv.setHttpStatus(false);

    // El error es de autenticacion de coordenadas, se le muestra al usuario los intentos restantes
    if (err.codigo === '5203000') {
      // se muestra error
      this.errorValidacionToken.detalle = err.mensaje;
      this.errorValidacionToken.ver = true;
      return;
    }

    // Cualquier otro error se envia a pagina de error
    this.errorSrv.irPaginaErrorConDetalle({ titulo: 'Error', detalle: err.mensaje });
  }

  private obtenerDesafio() {
    const req: ConsultaDesafiosRequest = {
      cabecera: {
        HOST: {
          "USUARIO-ALT": this.ctxSrv.usuarioAltair,
          "TERMINAL-ALT": '',
          "CANAL-ID": ''
        },
        CanalFisico: this.ctxSrv.canalFisico,
        CanalLogico: this.ctxSrv.canalLogico,
        RutCliente: this.ctxSrv.rutCliente,
        RutUsuario: this.ctxSrv.rutCliente,
        IpCliente: '',
        InfoDispositivo: '',
        InfoGeneral: {
          NumeroServidor: ''
        }
      },
      Solicitar_Desafio_Request: {
        RutCliente: this.ctxSrv.rutCliente
      }
    };

    // Se activa loading
    this.loadingSrv.setHttpStatus(true);

    this.desafioSrv.consultarDesafio(req).subscribe(resp => {
      this.loadingSrv.setHttpStatus(false);
      const matriz = resp.MatrizDesafio.split(';');

      this.dataUsuario.superClave.desafio.coord1 = matriz[0];
      this.dataUsuario.superClave.desafio.coord2 = matriz[1];
      this.dataUsuario.superClave.desafio.coord3 = matriz[2];
      this.dataUsuario.superClave.nroTarjeta = resp.NumeroTarjeta;

      this.mostrarSuperClave = true;
    }, (err: ResponseError) => {
      this.loadingSrv.setHttpStatus(false);
      this.errorSrv.irPaginaErrorConDetalle({ titulo: LABELS_ALERTA_DEFAULT1.titulo, detalle: err.mensaje });
    });
  }

  private mostrarError(titulo: string = LABELS_ALERTA_DEFAULT1.titulo, detalle: string = LABELS_ALERTA_DEFAULT1.detalle, tipo = 'warn') {
    this.dialogoError.tipo = tipo;
    this.dialogoError.titulo = titulo;
    this.dialogoError.detalle = detalle;
    this.dialogoError.ver = true;

    this.loadingSrv.setHttpStatus(false);
  }

  verificarErrorVolver(err: ResponseError) {
    switch (err.origenError) {
      case ResponseError.ORIGEN_TIBCO:
        this.mostrarError(LABELS_ALERTA_DEFAULT1.titulo, MensajesErrores.ERROR_GENERICO, 'error');
        break;
      default:
        this.errorSrv.irPaginaErrorConDetalle({ titulo: 'Error', detalle: MensajesErrores.ERROR_GENERICO });
        break;
    }
  }

  // Se invoca desde el boton 'Intentar Nuevamente' del dialogo de error.
  intentarNuevamenteContratar() {
    // this.onClickContratar();
    this.errorValidacionToken.ver = false;
  }
}
