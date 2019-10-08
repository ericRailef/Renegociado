import { Component, OnInit, OnDestroy } from '@angular/core';
import { OF01Response } from '../../model/OF01Response';
import { Of01Service } from '../../services/of01.service';
import { ContextoService } from '../../services/contexto.service';
import { Of02Service } from '../../services/of02.service';
import { OF02Response } from '../../model/OF02Response';
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { SiccService } from '../../services/sicc.service';
import { SICCRequest } from '../../model/SICCRequest';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { OfertaValidators } from './utils/oferta-validators';
import { LABELS_ALERTA_DEFAULT1 } from '../../shared/components/alerta/alerta.component';
import { DocumentosService } from '../../services/documentos.service';
import { FormatoRutPipe } from '../../shared/pipes/formato-rut.pipe';
import { FormateadorBackend } from '../../shared/utilities/formateador-backend';
import { DatosCampanaService } from '../../services/datos-campana.service';
import { DatosCampanaRequest } from '../../model/DatosCampanaRequest';
import { DatosCampanaResponse } from '../../model/DatosCampanaResponse';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { ResponseError } from '../../services/model/response-error';
import { LoadingInfo } from '../../shared/components/loading/loading.component';
import { ErrorService } from '../../services/error.service';
import { CancelarVisualService } from '../../services/cancelar-visual.service';
import { MensajesErrores } from '../../shared/utilities/mensaje-errores';
import { SICCResponse } from '../../model/SICCResponse';
import { ValidadorTIBCODataPower } from '../../services/utils/validador-tibco-datapower';

@Component({
  selector: 'app-oferta',
  templateUrl: './oferta.component.html',
  styleUrls: ['./oferta.component.css']
})
export class OfertaComponent implements OnInit, OnDestroy {

  private readonly RETOMA_SIMULACION = '0002';
  private readonly RETOMA_CONFIRMACION = '0003';
  private readonly RETOMA_AUTORIZACION = '0004';

  eventoAbrirCreditos: Subject<boolean> = new Subject<boolean>();
  eventoAbrirTarjetas: Subject<boolean> = new Subject<boolean>();
  eventoAbrirLineas: Subject<boolean> = new Subject<boolean>();

  // Flag que indica si el usuario ha expandido al menos un acordeon
  cargaInicial = true;

  // Variables para mostrar el detalle en cuador de dialogo de las deudas
  detalleCreditoCsmoData: any;
  verDetalleCreditoCsmo = false;

  detalleCuentaCteData: any;
  verDetalleCtaCte = false;

  detalleTarjetasData: any;
  verDetalleTarjetas = false;

  ofertable = true;
  tieneAlgunaDeuda = true;

  formValido = false;
  btnEnEjecucion = false;

  // flag para ocultar o mostrar boton simular
  verBotonSimular = true;

  dialogoError = {
    ver: false,
    titulo: LABELS_ALERTA_DEFAULT1.titulo,
    detalle: LABELS_ALERTA_DEFAULT1.detalle
  };

  // Almacena la informacion de las deudas del cliente
  deudas = {
    deudaTotal: '0',
    deudaTotalUSD: undefined,
    deudaTotalAlDia: '0',
    deudaTotalUSDAlDia: undefined,
    creditosConsumo: {
      listado: [],
      total: '0',
      totalAlDia: '0'
    },
    tarjetasCredito: {
      listado: [],
      totalCLP: '0',
      totalUSD: '0',
      totalCLPAlDia: '0',
      totalUSDAlDia: '0'
    },
    lineasCredito: {
      listado: [],
      totalCLP: '0',
      totalUSD: '0',
      totalCLPAlDia: '0',
      totalUSDAlDia: '0'
    }
  };


  // Seguros disponibles para el cliente. Dependen de OF02
  segurosVisibles = {
    cesantia: false,
    desgravamen: false,
    vida: false
  };

  // Binding a campos en el html
  formGroup = new FormGroup({
    plazoSeleccionado: new FormControl(null),
    primerVencimiento: new FormControl(null),
    seguroCesantia: new FormControl(true),
    seguroDesgravamen: new FormControl(true),
    seguroVida: new FormControl(true),
  });

  // Lista con plazos del credito generados
  plazosCredito = [];

  // Fechas minimo y maximo permitidas
  primerVencimientoMinimo: Date;
  primerVencimientoMaximo: Date;

  // Objeto para manejar el componente Loading interno de la pagina
  // en la seccion de deudas.
  localLoadingBehavior: BehaviorSubject<LoadingInfo>;

  constructor(private router: Router, private ctxSrv: ContextoService,
              private of01Srv: Of01Service, private of02Srv: Of02Service,
              private datosCampanaSrv: DatosCampanaService,
              private documentosSrv: DocumentosService, private siccSrv: SiccService,
              private datePipe: DatePipe,
              private rutPipe: FormatoRutPipe,
              private loadingSrv: LoadingService,
              private errorSrv: ErrorService,
              private cancelarVisualSrv: CancelarVisualService) {

    if (!this.validarDatosRequeridos()) {
      this.errorSrv.irPaginaHome();
      return;
    }

    this.localLoadingBehavior = new BehaviorSubject({ status: false });
    this.loadingSrv.setHttpStatus(true, 'Estamos cargando tu oferta.');

    this.setupFechaPrimerVencimiento();
    this.setupFormGroup();

    if (this.ctxSrv.of00Response != null) {
      this.iniciarPaginaDesdeOF00();
    } else {
      this.iniciarPagina();
    }
  }

  ngOnInit() { }

  private validarDatosRequeridos(): boolean {
    let token = this.ctxSrv.token;
    let codCPN = this.ctxSrv.codCPN;
    let rutCliente =  this.ctxSrv.rutCliente;

    return (token && token.trim().length > 0 && codCPN && codCPN.trim().length > 0 && rutCliente && rutCliente.trim().length > 0);
  }

  ngOnDestroy() {
    // Si se ingreso mediante OF00, nos aseguramos de hacer reset del flag
    this.ctxSrv.of00Response = null;
  }

  /* Se habilitan los 45 dias a partir de mañana (inclusive) */
  private setupFechaPrimerVencimiento() {
    this.primerVencimientoMinimo = new Date();
    this.primerVencimientoMinimo.setDate(this.primerVencimientoMinimo.getDate() + 1);

    this.primerVencimientoMaximo = new Date();
    this.primerVencimientoMaximo.setDate(this.primerVencimientoMaximo.getDate() + 45);
  }

  /* A partir de la fecha desde busca el primer 5 disponible */
  private getFechaDefault(desde: Date): Date {
    const fechaDefault = new Date(desde.getTime());

    if (fechaDefault.getDate() <= 5) {
      fechaDefault.setDate(5);
    } else {
      fechaDefault.setDate(5);
      fechaDefault.setMonth(fechaDefault.getMonth() + 1);
    }

    return fechaDefault;
  }

  private manejarErrorServicio(ocultarBotonSimular: boolean = false, detalle = MensajesErrores.ERROR_GENERICO) {
    // Se desactivan ambos loading
    this.localLoadingBehavior.next({status: false});
    this.loadingSrv.setHttpStatus(false);

    this.dialogoError.detalle = detalle;
    this.dialogoError.ver = true;

    // oculta el boton simular si el error lo amerita
    this.verBotonSimular = !ocultarBotonSimular;
  }

  /*
   * Invoca al servicio datosCampCliAsociado para obtener la informacion de listaContratoCompra
   * requerida para OF01. Si todo sale bien invoca a OF01.
   */
  private iniciarPagina() {
    const rutSinCeros = FormateadorBackend.rutFromBackend(this.ctxSrv.rutCliente);

    const datosCampanaReq: DatosCampanaRequest = {
      RutUsuario: this.ctxSrv.rutCliente,
      cod_cpn: this.ctxSrv.codCPN, // '5363'
      nro_doc_psn: rutSinCeros
    };

    this.datosCampanaSrv.getDatosCampanaResponse(datosCampanaReq)
      .subscribe(r => this.invocarOF01(r), (_: ResponseError) => this.errorSrv.irPaginaHome());
  }

  private invocarOF01(datosCampana: DatosCampanaResponse): void {
    // Consulta el servicio OF01 para verificar si cliente es Ofertable como tambien si es retoma.
    this.of01Srv.getObtenerServicioOF01({
      canalLogico: this.ctxSrv.canalLogico,
      usuarioAltair: this.ctxSrv.usuarioAltair,
      idOrigen: this.ctxSrv.idOrigen,
      tipoGestion: datosCampana.tipoGestion,
      entidad: this.ctxSrv.entidad,
      centro: this.ctxSrv.centro,
      rutCliente: this.ctxSrv.rutCliente,
      cuentaCorrienteActiva: datosCampana.cuentaCorrienteActiva,
      cuentaCorrienteSobregiro: '',
      indAbonoRealizado: datosCampana.indAbonoRealizado,
      ListaContratoCompra: datosCampana.ListaContratos,
      Tasa: datosCampana.Tasa,
      plazoMinimaNuevoConsumo: datosCampana.plazoMinimaNuevoConsumo,
      plazoMaximoNuevoConsumo: datosCampana.plazoMaximoNuevoConsumo,
      productoDestino: datosCampana.productoDestino,
      subproductoDestino: datosCampana.subproductoDestino,
      fechaConsulta: '',
    }).subscribe(resp => this.procesarOF01(resp), _ => this.errorSrv.irPaginaHome());
  }

  /*
   * Carga la pagina a partir del resultado de OF00 cargado en el contexto.
   * A partir de la respuesta obtenida por OF00 se carga en contexto of02Response para
   * simular la respuesta de OF02 con detalle.
   */
  private iniciarPaginaDesdeOF00() {
    const of00Resp = this.ctxSrv.of00Response;

    if (of00Resp.indOfertable.trim() !== 'S') {
      this.ofertable = false;
      this.manejarMotivoNoOfertable(of00Resp.motivoNoOfertable.substring(0, 3).trim());
      return;
    }

    const of02Resp = new OF02Response();
    of02Resp.indOfertable = of00Resp.indOfertable;
    of02Resp.motivoNoOfertable = of00Resp.motivoNoOfertable;
    of02Resp.valorUF = of00Resp.valorUF;
    of02Resp.indCompraExterna = of00Resp.indCompraExterna;
    of02Resp.indSeguroDesgravamen = of00Resp.indSeguroDesgravamen;
    of02Resp.indSeguroCesantia = of00Resp.indSeguroCesantia;
    of02Resp.indSeguroVida = of00Resp.indSeguroVida;
    of02Resp.plazoMinimo = of00Resp.plazoMinimo;
    of02Resp.plazoMaximo = of00Resp.plazoMaximo;
    of02Resp.ListasUG = of00Resp.ListasUG;
    of02Resp.ListasBG = of00Resp.ListasBG;
    of02Resp.ListasMP = of00Resp.ListasMP;
    of02Resp.TotalesDeudaProducto = of00Resp.TotalesDeudaProducto;
    of02Resp.TotalesPorDetalle = of00Resp.TotalesPorDetalle;

    this.ctxSrv.detalleOF02Cargado = true;
    this.cargaInicial = false;
    this.ofertable = true;

    this.procesarOF02(of02Resp);
  }

  private setupFormGroup() {
    let primerVencimiento = this.getFechaDefault(this.primerVencimientoMinimo);

    let seguroCesantia = false;
    let seguroDesgravamen = false;
    let seguroVida = false;
    let plazoCredito = null;

    if (this.ctxSrv.ctx.iniciado) {
      plazoCredito = this.ctxSrv.ctx.oferta.plazoCredito;
      primerVencimiento = this.ctxSrv.ctx.oferta.primerVencimiento;
      seguroCesantia = this.ctxSrv.ctx.oferta.seguroCesantia;
      seguroDesgravamen = this.ctxSrv.ctx.oferta.seguroDesgravamen;
    }

    // Plazo
    this.formGroup.get('plazoSeleccionado').setValue(plazoCredito);
    this.formGroup.get('plazoSeleccionado').setValidators([OfertaValidators.plazoValidator]);

    // Primer vencimiento
    this.formGroup.get('primerVencimiento').setValue(primerVencimiento);
    this.formGroup.get('primerVencimiento').setValidators([OfertaValidators.primerVencimientoValidator]);

    // Seguros
    this.formGroup.get('seguroCesantia').setValue(seguroCesantia);
    this.formGroup.get('seguroDesgravamen').setValue(seguroDesgravamen);
    this.formGroup.get('seguroVida').setValue(seguroVida);
  }

  private esRetoma(codigoSiguienteTarea: string): boolean {
    return (codigoSiguienteTarea === this.RETOMA_SIMULACION || codigoSiguienteTarea === this.RETOMA_CONFIRMACION
        || codigoSiguienteTarea === this.RETOMA_AUTORIZACION);
  }

  /*
   * Verifica si el flujo debe continuar por retoma o flujo normal.
   */
  private procesarOF01(of01Response: OF01Response) {
    this.ctxSrv.idSolicitud = of01Response.idSolicitud;

    if (this.esRetoma(of01Response.codigoSiguienteTarea)) {
      this.procesarRetoma(of01Response);
    } else {
      this.procesarFlujoNormal(of01Response);
    }
  }

  /*
   * Gestiona el proceso de retoma.
   */
  private procesarRetoma(of01Response: OF01Response): void {
    this.ctxSrv.esRetoma = true;
    this.ctxSrv.selSegCesantia = of01Response.selSegCesantia;
    this.ctxSrv.selSegDesgravamen = of01Response.selSegDesgravamen;
    this.ctxSrv.indContratoMarcoFirmado = of01Response.ind_ContratoMarcoFirmado;

    switch (of01Response.codigoSiguienteTarea) {
      case this.RETOMA_SIMULACION:
        this.retomarSimulacion(of01Response);
        break;
      case this.RETOMA_CONFIRMACION:
        this.retomarConfirmacion(of01Response);
        break;
      case this.RETOMA_AUTORIZACION:
        this.retomarAutorizacion(of01Response);
        break;
    }
  }

  /**
   * Continua el flujo normal de la aplicacion (cuando no es retoma).
   */
  private procesarFlujoNormal(of01Response: OF01Response): void {
    if (of01Response.indOfertable === 'N') {
      this.ofertable = false;
      this.errorSrv.irPaginaHome();
      return;
    }

    this.ctxSrv.esRetoma = false;
    this.ofertable = true;

    this.consultarOF02(false, resp => {
      if (resp.indOfertable === 'N') {
        this.loadingSrv.setHttpStatus(false);
        this.errorSrv.irPaginaHome();
        return;
      }
      this.procesarOF02(resp);
    });
  }

  /*
   * Invoca a SICC con los datos de entrada obtenidos de la retoma y si todo salio bien
   * envia al usuario a la pagina de simulacion.
   */
  private retomarSimulacion(of01Response: OF01Response): void {
    this.loadingSrv.setHttpStatus(false);

    // se crea request para invocar SICC para retoma
    const siccRequest = this.getNewSICCRequest();
    const primerVctoBackend = this.getDateFromBackend(of01Response.fechaPrimerVencimiento);

    siccRequest.fechaPrimerVencimiento = this.datePipe.transform(primerVctoBackend, 'yyyy-MM-dd');
    siccRequest.cuotasCredito = of01Response.cuotasCredito;
    siccRequest.mesesCarencia = of01Response.mesesCarencia ? of01Response.mesesCarencia.trim() : "";
    siccRequest.selSegCesantia = this.getFlagSiNo(of01Response.selSegCesantia);
    siccRequest.selSegDesgravamen = this.getFlagSiNo(of01Response.selSegDesgravamen);
    siccRequest.selSegVida = 'N';
    siccRequest.indCompraExterna = of01Response.indCompraExterna;

    siccRequest.listaCotratoCompra = of01Response.listaContratoCompra.map(registro => {
      const prod = (registro.producto ? registro.producto.trim() : '');
      const subProd = (registro.subproducto ? registro.subproducto.trim() : '');

      return {
        indCompraCartera: this.getFlagSiNo(registro.indCompraCartera),
        numeroContrato: registro.numeroContrato,
        sistemaOrigen: registro.sistemaOrigen,
        ProductoySubproducto: prod + subProd,
        indTCDEUFACT: this.getFlagSiNo(registro.indTCDEUFACT, false),
        indDEUCOMPRSIN: this.getFlagSiNo(registro.indDEUCOMPRSIN, false),
        indTCDEUCOMPRCON: this.getFlagSiNo(registro.indDEUCOMPRCON, false),
        indTCDEUAVANCE: this.getFlagSiNo(registro.indTCDEUAVANCE, false),
        indDEUAVANCEEFE: this.getFlagSiNo(registro.indDEUAVANCEEFE, false),
        IndDEUSUPERC: this.getFlagSiNo(registro.indDEUSUPERC, false),
        indOTRCOM: this.getFlagSiNo(registro.indOTRCOM, false),
        indDEUTOTALUSD: this.getFlagSiNo(registro.indDEUTOTALUSD, false)
      };
    });

    this.irSimular(siccRequest);
  }

  /*
   * Carga la informacion de Confirmacion Paso 1 para retoma.
   */
  private retomarConfirmacion(of01Response: OF01Response): void {
    this.loadingSrv.setHttpStatus(false);

    // campos comunes
    this.ctxSrv.selSegCesantia = of01Response.selSegCesantia;
    this.ctxSrv.selSegDesgravamen = of01Response.selSegDesgravamen;
    this.ctxSrv.indContratoMarcoFirmado = of01Response.ind_ContratoMarcoFirmado;

    // campos requeridos por la pagina
    const dataConfirmacion = this.ctxSrv.ctx.confirmacion;
    dataConfirmacion.telefono = FormateadorBackend.telefonoFromBackend(of01Response.telefonoMovil);
    dataConfirmacion.email = of01Response.email;
    dataConfirmacion.autorizacion = true;
    dataConfirmacion.participaSociedades = (of01Response.participacionSociedades === 'S');
    dataConfirmacion.esAvalFiador = (of01Response.avaloFiador === 'S');
    dataConfirmacion.tienePreExistencias = (of01Response.indDPS === 'S');
    dataConfirmacion.preExistencias = of01Response.descripcionDPS;
    dataConfirmacion.cuentaCorrienteCargo = of01Response.cuentaCorrienteCargo;

    if (dataConfirmacion.participaSociedades && of01Response.listadoSociedades) {
      dataConfirmacion.listadoSociedades = of01Response.listadoSociedades.map(sociedad => {
        sociedad.rutSociedad = this.rutPipe.transform(sociedad.rutSociedad);
        sociedad.capital = FormateadorBackend.porcentajeFromBackend(sociedad.capital);
        sociedad.utilidad = FormateadorBackend.porcentajeFromBackend(sociedad.utilidad);
        sociedad.tipoSociedad = sociedad.tipoSociedad.trim();
        return sociedad;
      });
    }

    if (dataConfirmacion.esAvalFiador && of01Response.listadoAvaloFiador) {
      dataConfirmacion.listadoAvaloFiador = of01Response.listadoAvaloFiador.map(sociedad => {
        sociedad.rutSociedad = this.rutPipe.transform(sociedad.rutSociedad);
        sociedad.utilidad = FormateadorBackend.porcentajeFromBackend(sociedad.utilidad);
        sociedad.tipoSociedad = sociedad.tipoSociedad.trim();
        return sociedad;
      });
    }

    this.router.navigateByUrl('/confirmacion');
  }

  private retomarAutorizacion(of01Response: OF01Response): void {
    this.documentosSrv.obtenerDocumentosAutorizacion().subscribe(archivos => {
      this.loadingSrv.setHttpStatus(false);

      this.ctxSrv.ctx.autorizacion.documentos = archivos;
      this.router.navigateByUrl('/autorizacion');
    }, (_: ResponseError)  => {
      this.errorSrv.irPaginaHome();
    });
  }

  /*
   * Realiza la ejecucion del servicio OF02 de manera resumida o detallada.
   */
  private consultarOF02(detalle: boolean = false, callback: (resp) => void) {
    this.of02Srv.getObtenerServicioOF02({
      canalLogico: this.ctxSrv.canalLogico,
      usuarioAltair: this.ctxSrv.usuarioAltair,
      entidad: this.ctxSrv.entidad,
      idOrigen: this.ctxSrv.idOrigen,
      indDetalleDeuda: (detalle ? 'S' : 'N'),
      valorUF: '',
      fechaConsulta: '',
      idSolicitud: this.ctxSrv.idSolicitud
    }).subscribe(resp => {
      this.ctxSrv.detalleOF02Cargado = detalle;
      callback(resp);
    }, (_: ResponseError) => {
      this.ctxSrv.detalleOF02Cargado = false;

      if (detalle) {
        // Se obtuvo error desde OF02 con detalle
        this.errorSrv.irPaginaErrorConDetalle({ titulo: LABELS_ALERTA_DEFAULT1.titulo, detalle: MensajesErrores.ERROR_GENERICO });
      } else {
        // Se obtuvo error desde OF02 sin detalle
        this.errorSrv.irPaginaHome();
      }
    });
  }

  /* Carga la informacion de la pagina de oferta a partir de OF02 */
  private procesarOF02(of02Response: OF02Response, inicializarOF02Response = true) {
    this.loadingSrv.setHttpStatus(false);

    // Esta informacion sera cargada solo cuando se invoca OF02 sin detalle la primera vez
    if (inicializarOF02Response) {
      this.ctxSrv.of02Response = new OF02Response();
      this.ctxSrv.of02Response.indOfertable = of02Response.indOfertable;
      this.ctxSrv.of02Response.motivoNoOfertable = of02Response.motivoNoOfertable;
      this.ctxSrv.of02Response.valorUF = of02Response.valorUF;
      this.ctxSrv.of02Response.indCompraExterna = of02Response.indCompraExterna;
      this.ctxSrv.of02Response.indSeguroDesgravamen = of02Response.indSeguroDesgravamen;
      this.ctxSrv.of02Response.indSeguroCesantia = of02Response.indSeguroCesantia;
      this.ctxSrv.of02Response.indSeguroVida = of02Response.indSeguroVida;
      this.ctxSrv.of02Response.plazoMinimo = of02Response.plazoMinimo;
      this.ctxSrv.of02Response.plazoMaximo = of02Response.plazoMaximo;
    }

    this.ctxSrv.of02Response.ListasUG = of02Response.ListasUG;
    this.ctxSrv.of02Response.ListasBG = of02Response.ListasBG;
    this.ctxSrv.of02Response.ListasMP = of02Response.ListasMP;
    this.ctxSrv.of02Response.TotalesDeudaProducto = of02Response.TotalesDeudaProducto;
    this.ctxSrv.of02Response.TotalesPorDetalle = of02Response.TotalesPorDetalle;

    this.cargarPlazosCredito();
    this.cargarSeguros();
    this.cargarTotales();

    if (this.ctxSrv.detalleOF02Cargado) {
      this.cargarTotalesPorDetalle();
      this.cargarCreditosConsumo();
      this.cargarTarjetasCreditos();
      this.cargarLineasCredito();
    }

    this.tieneAlgunaDeuda = this.tieneAlMenosUnaDeuda();
  }

  private abrirCerrarAcordeon(id: string, abrir = true) {
    let eventoAbrir: Subject<boolean>;

    // Se abre el acordeon una vez cargada la data.
    switch (id) {
      case 'CC':
        eventoAbrir = this.eventoAbrirCreditos;
        break;
      case 'LC':
        eventoAbrir = this.eventoAbrirLineas;
        break;
      case 'TC':
        eventoAbrir = this.eventoAbrirTarjetas;
        break;
      default:
        throw new Error('Tipo de Acordeon no soportado');
    }

    setTimeout(() => {
      eventoAbrir.next(abrir);

      // Si se abre el acordeon, ya no se esta mostrando la carga inicial sino que el detalle
      this.cargaInicial = !abrir;
    }, 200);
  }

  /* Carga solo los totales de las deudas que tiene el cliente */
  private cargarTotales() {
    const totalesDeudaProducto =  this.ctxSrv.of02Response.TotalesDeudaProducto;

    // total creditos de consumo
    this.deudas.creditosConsumo.total = totalesDeudaProducto.MONCLP_UG;

    // total tarjetas de credito
    this.deudas.tarjetasCredito.totalCLP = totalesDeudaProducto.MONCLP_MP;
    this.deudas.tarjetasCredito.totalUSD = totalesDeudaProducto.MONUSD_MP;

    // total lineas de credito
    this.deudas.lineasCredito.totalCLP = totalesDeudaProducto.MONCLP_LCA;

    // deuda total
    this.deudas.deudaTotal = totalesDeudaProducto.TOTAL_DEUDA;
    this.deudas.deudaTotalUSD = totalesDeudaProducto.MONUSD_MP;
  }

  /* Carga totales actualizados al dia que se obtienen desde el OF02 con detalle */
  private cargarTotalesPorDetalle() {
    const totalesPorDetalle = this.ctxSrv.of02Response.TotalesPorDetalle;

    // total creditos de consumo
    this.deudas.creditosConsumo.totalAlDia = totalesPorDetalle.TOTPREML;

    // total tarjetas de credito
    this.deudas.tarjetasCredito.totalCLPAlDia = totalesPorDetalle.TOTPAMML;
    this.deudas.tarjetasCredito.totalUSDAlDia = totalesPorDetalle.TOTPAMMO;

    // total lineas de credito
    this.deudas.lineasCredito.totalCLPAlDia = totalesPorDetalle.TOTLCAML;

    // deuda total
    this.deudas.deudaTotalAlDia = totalesPorDetalle.TOTDEUDAML;
    this.deudas.deudaTotalUSDAlDia = totalesPorDetalle.TOTPAMMO;
  }

  /*
   * Carga los plazos desde el minimo al maximo informado en el servicio OF02.
   * Los codigos y valores se completan con ceros a la izquierda.
   */
  private cargarPlazosCredito() {
    this.plazosCredito = this.generarLstPlazos(this.ctxSrv.of02Response.plazoMinimo, this.ctxSrv.of02Response.plazoMaximo);

    const plazoSeleccionadoActual = this.formGroup.get('plazoSeleccionado').value;

    if (plazoSeleccionadoActual === null) {
      this.formGroup.get('plazoSeleccionado').setValue(this.plazosCredito[this.plazosCredito.length - 1].codigo);
    }
  }

  /* Genera un arreglo con los plazos que deben ir en el combo box de plazos */
  private generarLstPlazos(minimoBackend: string = '2001', maximoBackend: string): string[] {
    // no se considera el primer digito de la izquierda
    const pzoMinimo = Number(minimoBackend);
    const pzoMaximo = Number(maximoBackend);

    const plazosCredito: any[] = [];
    for (let i = pzoMinimo; i <= pzoMaximo; i++) {
      plazosCredito.push({ codigo: i, label: Number(String(i).substring(1)) });
    }

    return plazosCredito;
  }

  private cargarSeguros() {
    this.segurosVisibles.cesantia = (this.ctxSrv.of02Response.indSeguroCesantia === 'S');
    this.segurosVisibles.desgravamen = (this.ctxSrv.of02Response.indSeguroDesgravamen === 'S');
  }

  private cargarCreditosConsumo() {
    const creditos = this.ctxSrv.of02Response.ListasUG;

    if (!creditos) {
      return;
    }

    this.deudas.creditosConsumo.listado = creditos.map(credito => {
      return {
        contrato: credito.contrato,
        descripcion: credito.descripcionProducto,
        deudaTotal: credito.montoDeudaPrepago,
        descripcionEstado: credito.estado,
        alDia: credito.estado && credito.estado.trim() === 'Al dia' ? true : false
      };
    });
  }

  private cargarTarjetasCreditos() {
    const tarjetas = this.ctxSrv.of02Response.ListasMP;

    if (!tarjetas) {
      return;
    }

    this.deudas.tarjetasCredito.listado = tarjetas.map(tarjeta => {
      return {
        contrato: tarjeta.contrato,
        descripcion: tarjeta.descripcionProducto,
        nroTarjeta: tarjeta.numeroTarjeta,
        deudaCLP: tarjeta.prepagoDeudaTotalPesos,
        deudaUSD: tarjeta.deudaUSD,
        descripcionEstado: tarjeta.estadoTC
      };
    });
  }

  private cargarLineasCredito() {
    const lnsCredito = this.ctxSrv.of02Response.ListasBG;

    if (!lnsCredito) {
      return;
    }

    this.deudas.lineasCredito.listado = lnsCredito.map(linea => {
      return {
        contrato: linea.contrato,
        descripcionEstado: linea.descripcionEstado,
        descripcion: linea.descripcionProducto,
        deudaTotal: linea.deudaTotal,
        mondeda: linea.moneda
      };
    });
  }

  /*
   * Se utiliza para retornar el flag correspondiente considerando la incosistencia de datos
   * entregada por el backend.
   */
  private getFlagSiNo(backendFlag: string, replaceNull = true): string {
    return (backendFlag && backendFlag !== null ? backendFlag.trim() : (replaceNull ? 'N' : null));
  }

  /*
   * La fecha que devuelve el backend es en formato dd-MM-YYYY.
   */
  private getDateFromBackend(backendDate: string): Date {
    const fecha = backendDate.split('-');
    const ano = parseInt(fecha[2], 10);
    const mes = parseInt(fecha[1], 10) - 1;
    const dia = parseInt(fecha[0], 10);

    return new Date(ano, mes, dia);
  }

  /* Verifica que un monto exista */
  mostrarMonto(monto: string): boolean {
    return (monto !== null && monto !== undefined);
  }

  /*
   * Verifica si el monto existe y es mayor a 0.00.
   * Esta validacion es aplicada solo cuando OF02 sin detalle ha sido invocado.
   */
  tieneDeudas(monto: string, detalleDeudas: any[], useSign = false): boolean {
    // detalle de OF02 cargado, por lo que se evalua la deuda a partir de los detalles
    if (this.ctxSrv.detalleOF02Cargado) {
      return detalleDeudas && detalleDeudas !== null && detalleDeudas.length > 0;
    }

    return (monto !== undefined
      && monto !== null
      && (useSign && monto.endsWith('-') ? -1 * Number(monto.substring(0, monto.length - 1)) : Number(monto.substring(0, monto.length - 1))) > 0.00);


  }

  /* Verifica que exista almenos un producto con deuda */
  private tieneAlMenosUnaDeuda(): boolean {
    return (this.tieneDeudas(this.deudas.creditosConsumo.total, this.deudas.creditosConsumo.listado))
        || (this.tieneDeudas(this.deudas.tarjetasCredito.totalCLP, this.deudas.tarjetasCredito.listado))
        || (this.tieneDeudas(this.deudas.tarjetasCredito.totalUSD, this.deudas.tarjetasCredito.listado))
        || (this.tieneDeudas(this.deudas.lineasCredito.totalCLP, this.deudas.lineasCredito.listado));
  }

  /**
   * Abre el cuadro de dialogo con informacion detallada de una deuda.
   * La informacion se obtiene de la respuesta de OF02 cargada en contexto.
   * @param detalle tipo del detalle que se desea abrir
   * @param contrato id del contrato que se quiere abrir
   */
  abrirDetalle(detalle: string, contrato: string) {
    const resp = this.ctxSrv.of02Response;

    switch (detalle) {
      case 'CC':
        this.detalleCreditoCsmoData = resp.ListasUG.filter((credito) => credito.contrato === contrato)[0];
        this.verDetalleCreditoCsmo = true;
        break;
      case 'LC':
        this.detalleCuentaCteData = resp.ListasBG.filter((cuenta) => cuenta.contrato === contrato)[0];
        this.verDetalleCtaCte = true;
        break;
      case 'TC':
        this.detalleTarjetasData = resp.ListasMP.filter((tarjeta) => tarjeta.contrato === contrato)[0];
        this.verDetalleTarjetas = true;
        break;
      default:
    }
  }

  cerrarDetalle(id: string) {
    switch (id) {
      case 'CC':
        this.verDetalleCreditoCsmo = false;
        break;
      case 'LC':
        this.verDetalleCtaCte = false;
        break;
      case 'TC':
        this.verDetalleTarjetas = false;
        break;
      default:
    }
  }

  onClickAcordeon(id: string) {
    // Si aun no se invoca a OF02 con detalle, se invoca una unica vez
    if (!this.ctxSrv.detalleOF02Cargado) {
      // Se levanta el loading en la seccion de deudas
      this.localLoadingBehavior.next({ status: true, titulo: 'Actualizando tu deuda en línea.' });

      this.consultarOF02(true, (resp: any) => {
        // Se verifica si cliente sigue siendo ofertable
        if (resp.indOfertable === 'N') {
          this.ctxSrv.detalleOF02Cargado = false;
          const motivo = resp.motivoNoOfertable.substring(0, 3).trim();

          this.manejarMotivoNoOfertable(motivo);
          this.abrirCerrarAcordeon(id, false);
        } else {
          this.procesarOF02(resp, false);
          this.abrirCerrarAcordeon(id);
        }

        // Se oculta loading...
        this.localLoadingBehavior.next({ status: false });
      });
    }
  }

  private manejarMotivoNoOfertable(motivo: string) {
    switch (motivo) {
      case '008':
        this.errorSrv.irPaginaErrorConDetalle({
          titulo: LABELS_ALERTA_DEFAULT1.titulo,
          detalle: ValidadorTIBCODataPower.validarMotivoNoOfertable(motivo)
        });
        break;
      case '021':
      case '022':
        this.cancelarVisualYEjecutar(() => {
          this.errorSrv.irPaginaErrorConDetalle({
            titulo: LABELS_ALERTA_DEFAULT1.titulo,
            detalle: ValidadorTIBCODataPower.validarMotivoNoOfertable(motivo)
          });
        });
        break;
      default:
        this.errorSrv.irPaginaErrorConDetalle({
          titulo: LABELS_ALERTA_DEFAULT1.titulo,
          detalle: ValidadorTIBCODataPower.validarMotivoNoOfertable(motivo)
        });
        break;
    }
  }

  private cancelarVisualYEjecutar(callback: () => void) {
    return this.cancelarVisualSrv.getCancelarVisualResponse({
      RutUsuario: this.ctxSrv.rutCliente,
      cod_cpn: this.ctxSrv.codCPN,
      nro_doc_psn: FormateadorBackend.rutFromBackend(this.ctxSrv.rutCliente),
      v_error: '0'
    }).subscribe(_ => callback(), _ => this.manejarErrorServicio(true));
  }

  onClickSimular() {
    // Se guarda la informacion ingresada por el usuario en el contexto
    this.ctxSrv.ctx.oferta.plazoCredito = this.formGroup.get('plazoSeleccionado').value;
    this.ctxSrv.ctx.oferta.primerVencimiento = this.formGroup.get('primerVencimiento').value;
    this.ctxSrv.ctx.oferta.seguroCesantia = this.formGroup.get('seguroCesantia').value;
    this.ctxSrv.ctx.oferta.seguroDesgravamen = this.formGroup.get('seguroDesgravamen').value;
    this.ctxSrv.ctx.oferta.seguroVida = this.formGroup.get('seguroVida').value;
    this.ctxSrv.ctx.iniciado = true;

    // se crea la request para SICC y se configura con lo requerido (flujo normal)
    const siccRequest = this.getNewSICCRequestFlujoNormal();

    this.irSimular(siccRequest);
  }

  /*
   * Invoca al servicio SICC y si todo sale bien redirige a la pagina de simulacion.
   */
  private irSimular(siccRequest: SICCRequest): void {
    this.loadingSrv.setHttpStatus(true, 'Actualizando tu oferta con deuda en línea.');
    this.btnEnEjecucion = true;

    this.siccSrv.getObtenerServicioSICC(siccRequest)
      .subscribe(resp => this.procesarRespuestaSICC(resp), (err: ResponseError) => this.procesarErrorSICC(err));
  }

  private procesarRespuestaSICC(resp: SICCResponse) {
    this.loadingSrv.setHttpStatus(false);
    this.ctxSrv.siccResponse = resp;
    this.router.navigateByUrl('/simulacion');
  }

  private procesarErrorSICC(err: ResponseError) {
    const detalle = { titulo: LABELS_ALERTA_DEFAULT1.titulo, detalle: err.mensaje };

    switch (err.codigo) {
      case '021':
      case '022':
        // En este caso se ejecuta servicio y luego se envia a pagina de error
        this.cancelarVisualYEjecutar(() => { this.errorSrv.irPaginaErrorConDetalle(detalle); });
        break;
      default:
        this.errorSrv.irPaginaErrorConDetalle(detalle);
        break;
    }
  }

  /*
   * Crea una nueva instancia de SICCRequest cargada con lo minimo requerido y valores por defecto.
   */
  private getNewSICCRequest(): SICCRequest {
    const request = new SICCRequest();
    request.canalFisico = this.ctxSrv.canalFisico;
    request.usuarioAltair = this.ctxSrv.usuarioAltair;
    request.idOrigen = this.ctxSrv.idOrigen;
    request.entidad = this.ctxSrv.entidad;
    request.rutCliente = this.ctxSrv.rutCliente;
    request.idSolicitud = this.ctxSrv.idSolicitud;
    request.indCompraExterna = 'N';
    request.fechaConsulta = '';

    return request;
  }

  /*
   * Genera una nueva SICCRequest a partir de la informacion ingresada por el usuario
   * y la obtenida de OF02 (con detalle).
   */
  private getNewSICCRequestFlujoNormal(): SICCRequest {
    // se crea la request para SICC y se configura con lo requerido (flujo normal)
    const siccRequest = this.getNewSICCRequest();
    siccRequest.fechaPrimerVencimiento = this.datePipe.transform(this.ctxSrv.ctx.oferta.primerVencimiento, 'yyyy-MM-dd'),
    siccRequest.cuotasCredito = this.ctxSrv.ctx.oferta.plazoCredito.toString().substring(1),
    siccRequest.mesesCarencia = '';
    siccRequest.selSegCesantia = (this.ctxSrv.ctx.oferta.seguroCesantia ? 'S' : 'N'),
    siccRequest.selSegDesgravamen = (this.ctxSrv.ctx.oferta.seguroDesgravamen ? 'S' : 'N');
    siccRequest.selSegVida = 'N';

    // funcion interna para crear las listas requeridas en la request
    const crearEstructura = (lista, sistemaOrigen, indicador = 'N') => {
      if (!lista || lista.length === 0) {
        return [];
      }

      return lista.map(r => {
        return {
          indCompraCartera: 'S',
          numeroContrato: r.contrato,
          sistemaOrigen,
          ProductoySubproducto: '',
          indTCDEUFACT: indicador,
          indDEUCOMPRSIN: indicador,
          indTCDEUCOMPRCON: indicador,
          indTCDEUAVANCE: indicador,
          indDEUAVANCEEFE: indicador,
          IndDEUSUPERC: indicador,
          indOTRCOM: indicador,
          indDEUTOTALUSD: indicador
        };
      });
    };

    // se carga la lista en la request
    siccRequest.listaCotratoCompra = [];
    siccRequest.listaCotratoCompra = siccRequest.listaCotratoCompra.concat(
      crearEstructura(this.ctxSrv.of02Response.ListasUG, 'UG'),
      crearEstructura(this.ctxSrv.of02Response.ListasBG, 'BG'),
      crearEstructura(this.ctxSrv.of02Response.ListasMP, 'MP', 'S')
    );

    return siccRequest;
  }
}
