import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContextoService } from '../../services/contexto.service';
import { FilaCrudSociedad, UiValidator } from './crud-sociedades/crud-sociedades.component';
import { CrudUtils } from './crud-sociedades/utils/CrudUtils';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomComponentValidators } from '../../shared/validators/custom-components-validators';
import { FormatCurrencyPipe } from '../../shared/pipes/format-currency.pipe';
import { CodaService } from '../../services/coda.service';
import { LABELS_ALERTA_DEFAULT1 } from '../../shared/components/alerta/alerta.component';
import { CODARequest } from '../../model/CODARequest';
import { Router } from '@angular/router';
import { Validador } from 'src/app/renegociado/shared/validators/utils/validador';
import { DocumentosService } from '../../services/documentos.service';
import { FormateadorBackend } from '../../shared/utilities/formateador-backend';
import { ContenidoExternoService } from '../../services/contenido-externo.service';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { CODAResponse } from '../../model/CODAResponse';
import { ResponseError } from '../../services/model/response-error';
import { ErrorService } from '../../services/error.service';
import { MensajesErrores } from '../../shared/utilities/mensaje-errores';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css']
})
export class ConfirmacionComponent implements OnInit, OnDestroy {

  private readonly MSG_ERROR_SOCIEDADES = 'Debe ingresar al menos una sociedad (todos los campos son requeridos) o seleccionar No para continuar';
  private readonly MSG_ERROR_REQUERIDOS = 'Todos los campos de esta página son requeridos y deben estar correctamente ingresados';

  sociedadesParticipacion: FilaCrudSociedad[] = [];
  sociedadesAval: FilaCrudSociedad[] = [];

  tienePreExistencias = false;
  botonGuardarEnEjecucion = false;
  displayAlertaPreexistencia = false;

  // configuracion para dialogo de error general de la aplicacion
  dialogoError = {
    ver : false,
    titulo: LABELS_ALERTA_DEFAULT1.titulo,
    detalle: LABELS_ALERTA_DEFAULT1.detalle
  };

  // data de entrada de la pagina
  formGroup: FormGroup;
  participaSociedades: string;
  esAvalOFiador: string;
  radioTienePreExistencias = '';
  preExistencias = '';
  segDesgravamen: boolean;
  cuentaCorrienteCargo: string;

  resultadoValidacionesManuales = {
    errorSeleccioneRadioParticipacionSoc: false,
    errorSeleccioneRadioEsAvalOFiador: false,
    errorAlMenosUnaSociedad: false,
    errorAlMenosUnAval: false,
    errorSeleccioneRadioPreExistencias: false,
    errorDebeIngresarPreExistencias: false,
    errorCompletarAval: false,
    errorCompletarSocidedad : false,
  };

  declaracionPersonalSaludHtml: any;
  showDPS = false;

  private crudUtils;

  constructor(private ctxSrv: ContextoService,
              private codaSrv: CodaService,
              private documentosSrv: DocumentosService,
              private router: Router,
              private contenidoExtSrv: ContenidoExternoService,
              private loadingSrv: LoadingService,
              private errorSrv: ErrorService,
              fmtCurrency: FormatCurrencyPipe) {

    this.cargarDeclaracionPersonalSalud();
    this.crudUtils = new CrudUtils(fmtCurrency);
    this.initFormulario();
  }

  ngOnInit() {
    const desgravamen = this.ctxSrv.selSegDesgravamen;
    this.segDesgravamen = (desgravamen && desgravamen !== null && desgravamen === 'S');
  }

  ngOnDestroy(): void {
    this.ctxSrv.esRetoma = false;
  }

  private initFormulario() {
    // se recupera la informacion de la pagina desde el ctx.
    const paginaGuardadaCtx = this.ctxSrv.ctx.confirmacion;

    this.formGroup = new FormGroup({
      telefono: new FormControl(paginaGuardadaCtx.telefono, [Validators.minLength(12) , CustomComponentValidators.validarTelefono]),
      email: new FormControl(paginaGuardadaCtx.email, [
        Validators.required,
        Validators.maxLength(150),
        Validators.pattern(Validador.EMAIL_REGEXP)
      ]),
      autorizacion: new FormControl(paginaGuardadaCtx.autorizacion, Validators.requiredTrue)
    });

    this.cuentaCorrienteCargo = paginaGuardadaCtx.cuentaCorrienteCargo;
    this.participaSociedades = this.convertirFlagParticipaSociedadesOAval(paginaGuardadaCtx.participaSociedades);
    this.esAvalOFiador = this.convertirFlagParticipaSociedadesOAval(paginaGuardadaCtx.esAvalFiador);
    this.tienePreExistencias = paginaGuardadaCtx.tienePreExistencias;

    if (paginaGuardadaCtx.tienePreExistencias !== undefined) {
      this.preExistencias = paginaGuardadaCtx.preExistencias ? paginaGuardadaCtx.preExistencias : '';
      this.radioTienePreExistencias = paginaGuardadaCtx.preExistencias ? 'S' : 'N';
    }

    if (paginaGuardadaCtx.participaSociedades) {
      this.sociedadesParticipacion = paginaGuardadaCtx.listadoSociedades.map((s) => {
        const uiValidators = new UiValidator();
        uiValidators.rsLock = true;

        return {
          modo: CrudUtils.MODO_PARTICIPACION,
          rut: s.rutSociedad,
          razonSocial: s.razonSocial,
          capital: s.capital,
          fianzaSolidaria: false,
          utilidad: s.utilidad,
          tipoSociedad: s.tipoSociedad,
          uiValidators: uiValidators
        };
      });
    }

    if (paginaGuardadaCtx.esAvalFiador) {
      this.sociedadesAval = paginaGuardadaCtx.listadoAvaloFiador.map((s) => {
        const uiValidators = new UiValidator();
        uiValidators.rsLock = false;

        return {
          modo: CrudUtils.MODO_AVAL,
          rut: s.rutSociedad,
          razonSocial: s.razonSocial,
          capital: null,
          fianzaSolidaria: (s.fianzaSolidaria === 'S'),
          utilidad: s.utilidad,
          tipoSociedad: s.tipoSociedad,
          uiValidators: uiValidators
        };
      });
    }
  }

  private convertirFlagParticipaSociedadesOAval(flag: boolean): string {
    if (flag === undefined) {
      return undefined;
    }

    return (flag ? 'S' : 'N');
  }

  /**
   * Ejecuta la logica requerida cuando el usuario presiona guardar.
   * Guarda la informacion ingrsada por el usuario en el contexto , invoca a CODA
   * y abre la seccion de Mandato.
   */
  onClickGuardar(): void {
    if (!this.datosPaginaValidos()) {
      // this.verDialogoError('', this.MSG_ERROR_REQUERIDOS);
      return;
    }

    this.botonGuardarEnEjecucion = true;
    this.loadingSrv.setHttpStatus(true);

    this.codaSrv.getCODAResponse(this.getNewCODARequest()).subscribe(
      resp => this.procesarCODAResp(resp),
      err => this.procesarCODAError(err));
  }

  private procesarCODAResp(resp: CODAResponse) {
    // se actualiza informacion del contexto
    this.ctxSrv.indContratoMarcoFirmado = resp.indContratoMarcoFirmado;
    this.ctxSrv.selSegCesantia = resp.selSegCesantia;
    this.ctxSrv.selSegDesgravamen = resp.selSegDesgravamen;

    this.obtenerDocsYNavegarAutorizacion();
  }

  private procesarCODAError(err: ResponseError) {
    this.botonGuardarEnEjecucion = false;
    this.errorSrv.irPaginaErrorConDetalle({ titulo: LABELS_ALERTA_DEFAULT1.titulo, detalle: MensajesErrores.ERROR_GENERICO });
  }

  /*
   * Ejecuta los servicios para obtener las rutas de los PDFs a requeridos en la pagina siguiente,
   * si todo sale bien se envia al usuario a la pagina de autorizacion.
   */
  private obtenerDocsYNavegarAutorizacion(): void {
    this.documentosSrv.obtenerDocumentosAutorizacion().subscribe(archivos => {
      this.loadingSrv.setHttpStatus(false);

      this.ctxSrv.ctx.autorizacion.documentos = archivos;
      this.router.navigateByUrl('/autorizacion');
    }, (_: ResponseError)  => {
      this.errorSrv.irPaginaErrorConDetalle({ titulo: LABELS_ALERTA_DEFAULT1.titulo, detalle: MensajesErrores.ERROR_GENERICO });
    });
  }

  /*
   * Crea una nueva instancia de CODARequest con los datos requeridos.
   */
  private getNewCODARequest(): CODARequest {
    // crea request con los datos ingresados por el usuario
    const request: CODARequest = {
      RutUsuario: this.ctxSrv.rutCliente,
      idSolicitud: this.ctxSrv.idSolicitud,
      selSegCesantia: this.ctxSrv.selSegCesantia,
      selSegDesgravamen: this.ctxSrv.selSegDesgravamen,
      selSegVida: 'N',
      indContratoMarcoFirmado: this.ctxSrv.indContratoMarcoFirmado,
      telefonoMovil: FormateadorBackend.telefonoToBackend(this.formGroup.get('telefono').value),
      email: this.formGroup.get('email').value,
      cuentaCorrienteCargo: this.cuentaCorrienteCargo,
      flagParticipaciones: this.participaSociedades,
      listaSociedades: this.getListaSociedadesToBackend(this.sociedadesParticipacion, this.participaSociedades),
      flagAvales: this.esAvalOFiador,
      listaAvales: this.getListaAvalesToBackend(this.sociedadesAval, this.esAvalOFiador),
      indDPS: this.radioTienePreExistencias,
      descripcionDPS: this.preExistencias
    };
    return request;
  }

  /*
   * Transforma la lista de FilaCrudSociedad ingresada por el usuario al formato requerido
   * por el servicio CODA.
   */
  private getListaSociedadesToBackend(sociedadesIngresadas: FilaCrudSociedad[],
    participaSociedades: string = 'S'): any[] {

    if (participaSociedades !== 'S' || !sociedadesIngresadas || sociedadesIngresadas.length === 0) {
      return [{
        rutSociedad: '',
        razonSocial: '',
        capital: '',
        utilidad: '',
        tipoSociedad: ''
      }];
    }

    return this.sociedadesParticipacion.map(s => {
      return {
        rutSociedad: FormateadorBackend.rutToBackend(s.rut),
        razonSocial: s.razonSocial,
        capital: FormateadorBackend.porcentajeToBackend(s.capital),
        utilidad: FormateadorBackend.porcentajeToBackend(s.utilidad),
        tipoSociedad: s.tipoSociedad
      };
    });
  }

  /*
   * Transforma la lista de FilaCrudSociedad ingresada por el usuario al formato requerido
   * por el servicio CODA.
   */
  private getListaAvalesToBackend(avalesIngresadas: FilaCrudSociedad[], esAval: string = 'S'): any[] {

    if (esAval !== 'S' || !avalesIngresadas || avalesIngresadas.length === 0) {
      return [{
        rutSociedad: '',
        razonSocial: '',
        fianzaSolidaria: '',
        utilidad: '',
        tipoSociedad: ''
      }];
    }

    return this.sociedadesAval.map(s => {
      return {
        rutSociedad: FormateadorBackend.rutToBackend(s.rut),
        razonSocial: s.razonSocial,
        fianzaSolidaria: (s.fianzaSolidaria ? 'S' : 'N'),
        utilidad: FormateadorBackend.porcentajeToBackend(s.utilidad),
        tipoSociedad: s.tipoSociedad
      };
    });
  }

  private verDialogoError(titulo: string, detalle: string): void {
    this.dialogoError.titulo = titulo;
    this.dialogoError.detalle = detalle;
    this.dialogoError.ver = true;

    this.loadingSrv.setHttpStatus(false);
  }

  onChangeCrudSociedades(data: FilaCrudSociedad[]) {
    this.sociedadesParticipacion = data;
  }

  onChangeCrudAvalOFiador(data: FilaCrudSociedad[]) {
    this.sociedadesAval = data;
  }

  /**
   * Verifica que los datos ingresados por el usuario sean validos.
   */
  datosPaginaValidos(): boolean {
    let isOk = true;

    if (!this.formGroup.valid) {
      (<any>Object).keys(this.formGroup.controls).forEach(k => {
        this.formGroup.controls[k].markAsTouched();
      });

      isOk = false;
    }

    if (!this.validarSociedadesAgregadas()) {
      isOk = false;
    }

    // Solo si selecciono seguro desgravamen, se solicitan preexistencias
    if (this.segDesgravamen) {
      this.resultadoValidacionesManuales.errorSeleccioneRadioPreExistencias = false;
      this.resultadoValidacionesManuales.errorDebeIngresarPreExistencias = false;

      // Aun no selecciono ni Si ni No
      if (this.radioTienePreExistencias !== 'S' && this.radioTienePreExistencias !== 'N') {
        this.resultadoValidacionesManuales.errorSeleccioneRadioPreExistencias = true;
        isOk = false;
      }

      if (this.radioTienePreExistencias === 'S' && (!this.preExistencias || this.preExistencias.trim().length === 0)) {
        this.resultadoValidacionesManuales.errorDebeIngresarPreExistencias = true;
        isOk = false;
      }
    }

    return isOk;
  }

  /*
   * Verifica que el usuario haya ingresado la lista de sociedades.
   * Si el usuario mantiene marcado el radio de participacion de sociedades o que es aval
   * debe ingresar al menos una sociedad respectivamente.
   */
  private validarSociedadesAgregadas(): boolean {
    this.resultadoValidacionesManuales.errorAlMenosUnaSociedad = false;
    this.resultadoValidacionesManuales.errorAlMenosUnAval = false;
    this.resultadoValidacionesManuales.errorSeleccioneRadioParticipacionSoc = false;
    this.resultadoValidacionesManuales.errorSeleccioneRadioEsAvalOFiador = false;
    this.resultadoValidacionesManuales.errorCompletarAval = false;

    let isOk = true;

    if (this.participaSociedades !== 'S' && this.participaSociedades !== 'N') {
      this.resultadoValidacionesManuales.errorSeleccioneRadioParticipacionSoc = true;
      isOk = false;
    }

    if (this.esAvalOFiador !== 'S' && this.esAvalOFiador !== 'N') {
      this.resultadoValidacionesManuales.errorSeleccioneRadioEsAvalOFiador = true;
      isOk = false;
    }
    const totalSociedadesOK = this.sociedadesParticipacion.filter((fila) => this.crudUtils.validarFila(fila)).length;
    if (this.participaSociedades === 'S'
      && totalSociedadesOK === 0) {
      this.resultadoValidacionesManuales.errorAlMenosUnaSociedad = true;
      isOk = false;
    } else if (totalSociedadesOK !== this.sociedadesParticipacion.length) {
      this.resultadoValidacionesManuales.errorCompletarSocidedad = true;
      isOk = false;
    }

    const totalAvalesOK = this.sociedadesAval.filter((fila) => this.crudUtils.validarFila(fila)).length;
    if (this.esAvalOFiador === 'S' && totalAvalesOK === 0) {
      this.resultadoValidacionesManuales.errorAlMenosUnAval = true;
      isOk = false;
    } else if (this.sociedadesAval.length !== totalAvalesOK) {
      this.resultadoValidacionesManuales.errorCompletarAval = true;
      isOk = false;
    }

    return isOk;
  }

  private cargarDeclaracionPersonalSalud(): void {
    this.contenidoExtSrv.getHtml('assets/external/declaracion_salud.html').subscribe(html => {
      this.declaracionPersonalSaludHtml = html;
    }, err => this.verDialogoError('', 'No fue posible cargar dialogo de DPS'));
  }

  abrirDPS(): void {
    this.showDPS = true;
  }

  cerrarDPS(): void {
    this.showDPS = false;
  }

  verificarErrorVolver(err: ResponseError) {
    switch (err.origenError) {
      case ResponseError.ORIGEN_TIBCO:
        this.verDialogoError(LABELS_ALERTA_DEFAULT1.titulo, MensajesErrores.ERROR_GENERICO);
        break;
      default:
        this.errorSrv.irPaginaErrorConDetalle({ titulo: 'Error', detalle: MensajesErrores.ERROR_GENERICO });
        break;
    }
  }
}
