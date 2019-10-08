import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CrudUtils } from './utils/CrudUtils';
import { FormatCurrencyPipe } from '../../../shared/pipes/format-currency.pipe';
import { ConfigService } from '../../../services/config.service';
import { DecimalPipe } from '@angular/common';
import { FormatoRutPipe } from 'src/app/renegociado/shared/pipes/formato-rut.pipe';
import { Validador } from '../../../shared/validators/utils/validador';
import { Ze68Service } from '../../../services/ze68.service';
import { ContextoService } from 'src/app/renegociado/services/contexto.service';
import { FormateadorBackend } from '../../../shared/utilities/formateador-backend';

export class UiValidator {
  rsLock = false;
  errores = {
    rut: {},
    razonSocial: {},
    capital: {},
    utilidad: {},
    tipoSociedad: {}
  };
}
export interface FilaCrudSociedad {
  modo: string;
  rut: string;
  razonSocial: string;
  capital: string;
  fianzaSolidaria: boolean;
  utilidad: string;
  tipoSociedad: string;
  uiValidators?: UiValidator;
}

@Component({
  selector: 'app-crud-participacion',
  templateUrl: './crud-sociedades.component.html',
  styleUrls: ['./crud-sociedades.component.css']
})
export class CrudSociedadesComponent implements OnInit {

  private configModalidades = {
    participacion: {
      columnas: ['RUT Sociedad', 'Razón Social', '% Capital', '% Utilidad', 'Tipo sociedad']
    },
    aval: {
      columnas: ['RUT Sociedad', 'Razón Social', 'Fianza solidaria', '% Utilidad', 'Tipo sociedad']
    }
  };

  private crudUtils: CrudUtils;

  modalidadSel: any;
  sociedades: any[];
  avales: any[];

  // Parametros de entrada/salidada
  @Input() data: FilaCrudSociedad[] = [];
  @Input() modo;
  @Input() disabled = true;
  @Input() maximoFilas = 10;
  @Output() dataModificada = new EventEmitter<FilaCrudSociedad[]>();

  constructor(fmtCurrencyPipe: FormatCurrencyPipe,
              private decimalPipe: DecimalPipe,
              private rutPipe: FormatoRutPipe,
              private confSrv: ConfigService,
              private ctxSrv: ContextoService,
              private ze68Srv: Ze68Service) {
    this.crudUtils = new CrudUtils(fmtCurrencyPipe);
  }

  ngOnInit() {
    switch (this.modo) {
      case CrudUtils.MODO_PARTICIPACION:
        this.modalidadSel = this.configModalidades.participacion;

        // se cargan tipos de sociedades para sociedades en las que participa
        const todasSociedades = this.confSrv.getDataConfig('tipoSociedades');
        this.sociedades = todasSociedades.sociedades;
        break;
      case CrudUtils.MODO_AVAL:
        this.modalidadSel = this.configModalidades.aval;

        // se cargan tipos de sociedades para avales
        const todosAvales = this.confSrv.getDataConfig('tipoSociedades');
        this.sociedades = todosAvales.avales;
        break;
      default:
        throw new Error('Modalidad de tabla no conocida');
    }

    // Es una retoma que viene con datos cargados o se volvio de la pagina siguiente.
    if (this.data && this.data.length > 0) {
      this.validarSociedadesAvales();
    }
  }

  /*
   * Ejecuta las validaciones de cada campo de las tablas de sociedades para detectar errores.
   */
  validarSociedadesAvales(): void {
    this.data.forEach(f => {
      const esModoParticipacion = (f.modo === CrudUtils.MODO_PARTICIPACION);

      this.validarRut(f.rut, f.modo, f);

      if (esModoParticipacion) {
        // Se encontro algun error en el rut de Sociedad/Empresa
        if (f.uiValidators.errores.rut['hayErrores']) {
          this.resetCampoRazonSocial(f, true);
        }
      }

      this.validarRazonSocial(f.razonSocial, f);

      if (esModoParticipacion) {
        this.validarPorcentaje(f.capital, 'capital', f);
      }

      this.validarPorcentaje(f.utilidad, f.modo, f);
      this.validarTipoSociedad(f.tipoSociedad, f);
    });
  }

  // Se utiliza desde la vista para actualizar el campo en el front.
  validarRutYActualizarFront(target: any, tipo: string, fila: FilaCrudSociedad): void {
    this.validarRut(target.value, tipo, fila);

    // Si se ingreso un rut de una Sociedad/Empresa
    if (tipo === CrudUtils.MODO_PARTICIPACION) {
      // Si el rut no es valido por algun motivo, se hace reset de la razon social
      if (fila.uiValidators.errores.rut['hayErrores']) {
        this.resetCampoRazonSocial(fila, true);
      } else {
        // Si el rut es correcto se intenta obtener la razon social desde el servicio
        const rutSinFormato = fila.rut.replace(/\./g, '').replace(/-/g, '');
        this.buscarRazonSocial(rutSinFormato, fila);
      }
    }

    target.value = fila.rut;
  }

  /*
   * Valida que el rut sea valido, dependiendo de si es un rut para la tabla de Participacion en sociedades
   * si es para la tabla de Avales.
   */
  validarRut(value: any, tipo: string, fila: FilaCrudSociedad): void {
    // Se da el formato con puntos y separador de dv
    fila.rut = this.rutPipe.transform(value);

    const sinPuntos = fila.rut.replace(/\./g, '');
    const esModoParticipacion = (tipo === CrudUtils.MODO_PARTICIPACION);

    // Configuracion de los tipos de error
    const errores = fila.uiValidators.errores;
    errores['rut'] = {
      hayErrores: false,
      fueTocado: true,
      invalido: false,
      empresa: false,
      duplicado: false
    };

    if (!Validador.validarRut(sinPuntos)) {
      errores.rut['hayErrores'] = true;
      errores.rut['invalido'] = true;
    } else if (this.duplicado(value)) {
      errores.rut['hayErrores'] = true;
      errores.rut['duplicado'] = true;
    } else {
      // estamos validando sociedades en las que participa
      if (esModoParticipacion) {
        if (!this.crudUtils.validarRutEmpresa(sinPuntos)) {
          errores.rut['hayErrores'] = true;
          errores.rut['empresa'] = true;
        }
      }
    }
  }

  /*
   * Ejecuta el servicio ZE68 para obtener la razon social a partir de un rut.
   */
  private buscarRazonSocial(rut: string, fila: FilaCrudSociedad): void {
    this.ze68Srv.getObtenerServicioZE68({
      'USUARIO-ALT': this.ctxSrv.usuarioAltair,
      'TERMINAL-ALT': '',
      'CANAL-ID': '',
      FILLER: '',
      PENUMPE: '',
      PETIPDO: 'R',
      PENUMDO: FormateadorBackend.rutToBackend(rut),
      PESECDO: '',
      PENOMFA: '',
      PEPRIAP: '',
      PESEGAP: '',
      PENOMPE: '',
      PEFECIN: '',
      PESUCAD: '',
      PEESTCI: '',
      PESEXPE: '',
      PETIPPE: '',
      PEFECNA: '',
      EFECINI: '',
      PECANVE: '',
      PECANCA: '',
      PEPAIOR: '',
      PECODCA: '',
      PEAGOFI: '',
      PENACPE: '',
      PEPAIRE: '',
      PESECPE: '',
      PETIPOC: '',
      PECODAC: '',
      PETIERE: '',
      PEFORJU: '',
      PENATJU: '',
      PEARENE: '',
      PECODSU: '',
      PEBANPR: '',
      PENIVAC: '',
      PEESTPE: '',
      PECONPE: '',
      PEINDIC: '',
      PEACTRI: '',
      PESUBSE: '',
      PEIDIOM: '',
      PESTAM1: '',
      PEEXPPO: '',
      PEFECVE: '',
      PEMARVE: '',
      PECONDO: '',
      PECODPA: '',
      PEFECEX: '',
      PELUGEX: '',
      PESTAM2: '',
      PEDOMR1: '',
      PEDOMR2: '',
      PERUTCA: '',
      PEDOMR3: '',
      EFECRER: '',
      PEDOMR4: '',
      OBSER1: '',
      OBSER2: '',
      PESTAM3: '',
      ESECDOM: '',
      PETELRE: '',
      PESTAM4: ''
    }).subscribe(resp => {
      if (!resp) {
        this.resetCampoRazonSocial(fila);
        return;
      }

      if (resp && resp !== null && resp.PENOMPE && resp.PENOMPE !== null && resp.PENOMPE !== '') {
        fila.razonSocial = resp.PENOMPE;
        fila.uiValidators.rsLock = true;
        this.validarRazonSocial(fila.razonSocial, fila);
      } else {
        fila.uiValidators.rsLock = false;
      }
    }, err => this.resetCampoRazonSocial(fila));
  }

  private resetCampoRazonSocial(fila: FilaCrudSociedad, bloquear: boolean = false): void {
    fila.razonSocial = '';
    fila.uiValidators.rsLock = bloquear;
  }

  private duplicado(value: string): boolean {
    return this.data.filter(data => data.rut.replace(/\./g, '').replace(/-/g, '') === value).length > 1;
  }

  validarPorcentaje(value: any, tipo: string, fila: FilaCrudSociedad): void {
    const errores = fila.uiValidators.errores;

    if (tipo === 'participacion') {
      errores.utilidad['hayErrores'] = !this.crudUtils.validarUtilidadSociedades(value);
      errores.utilidad['fueTocado'] = true;
      fila.utilidad = this.decimalPipe.transform(value.replace(/\,/g, '.'), '1.2-2');
    }
    if (tipo === 'aval') {
      errores.utilidad['hayErrores'] = !this.crudUtils.validarUtilidadAvales(value);
      errores.utilidad['fueTocado'] = true;
      fila.utilidad = this.decimalPipe.transform(value.replace(/\,/g, '.'), '1.2-2');
    }
    if (tipo === 'capital') {
      errores.capital['hayErrores'] = !this.crudUtils.validarCapital(value);
      errores.capital['fueTocado'] = true;
      fila.capital = this.decimalPipe.transform(value.replace(/\,/g, '.'), '1.2-2');
    }
  }

  validarRazonSocial(value: any, fila: FilaCrudSociedad): void {
    fila.uiValidators.errores.razonSocial['hayErrores'] = false;
    fila.uiValidators.errores.razonSocial['fueTocado'] = true;

    if (!value || value.trim() === '') {
      fila.uiValidators.errores.razonSocial['hayErrores'] = true;
    }
  }

  validarTipoSociedad(value: string, fila: FilaCrudSociedad): void {
    fila.uiValidators.errores.tipoSociedad['hayErrores'] = false;
    fila.uiValidators.errores.tipoSociedad['fueTocado'] = true;

    if (!value || value.trim() === '') {
      fila.uiValidators.errores.tipoSociedad['hayErrores'] = true;
    }
  }

  onChangeRow() {
    this.dataModificada.emit(this.data);
  }

  eliminar(idx: number) {
    // si se encuentra deshabilitada no permite eliminar
    if (this.disabled) {
      return;
    }

    if (this.data.length === 0) {
      return;
    }

    this.data = this.data.filter((fila, index) => index !== idx);
    this.onChangeRow();
  }

  agregar() {
    // si se encuentra deshabilitada no permite agregar o eliminar
    if (this.disabled || this.data.length === this.maximoFilas) {
      return;
    }

    // Se quiere agregar el primero
    if (this.data.length === 0) {
      this.agregarNuevaFila();
      return;
    }

    const ultimaFila = this.data[this.data.length - 1];

    if (this.crudUtils.validarFila(ultimaFila)) {
      this.agregarNuevaFila();
    }
  }

  private agregarNuevaFila() {
    this.data.push({
      modo: this.modo,
      rut: '',
      razonSocial: '',
      capital: null,
      utilidad: null,
      tipoSociedad: '',
      fianzaSolidaria: false,
      uiValidators: {
        rsLock: (this.modo === CrudUtils.MODO_PARTICIPACION),
        errores: {
          rut: {},
          razonSocial: {},
          capital: {},
          utilidad: {},
          tipoSociedad: {}
        }
      }
    });

    this.onChangeRow();
  }
}
