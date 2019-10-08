import { FilaCrudSociedad } from '../crud-sociedades.component';
import { FormatCurrencyPipe } from '../../../../shared/pipes/format-currency.pipe';

export class CrudUtils {

  static readonly MODO_PARTICIPACION = 'participacion';
  static readonly MODO_AVAL = 'aval';

  private readonly RUT_EMPRESA: Number = 50_000_001;
  private readonly CAPITAL_MINIMO = 2.01;
  private readonly UTILIDAD_SOCIEDADES_MINIMO = 2.01;

  constructor(private fmtCurrencyPipe: FormatCurrencyPipe) {}

  validarFila(fila: FilaCrudSociedad): boolean {
    switch (fila.modo) {
      case CrudUtils.MODO_PARTICIPACION:
        return (fila.uiValidators.errores.rut['fueTocado'] && !fila.uiValidators.errores.rut['hayErrores'] &&
                fila.uiValidators.errores.razonSocial['fueTocado'] && !fila.uiValidators.errores.razonSocial['hayErrores'] &&
                fila.uiValidators.errores.capital['fueTocado'] && !fila.uiValidators.errores.capital['hayErrores'] &&
                fila.uiValidators.errores.utilidad['fueTocado'] && !fila.uiValidators.errores.utilidad['hayErrores'] &&
                fila.uiValidators.errores.tipoSociedad['fueTocado'] && !fila.uiValidators.errores.tipoSociedad['hayErrores']);
      case CrudUtils.MODO_AVAL:
        return (fila.uiValidators.errores.rut['fueTocado'] && !fila.uiValidators.errores.rut['hayErrores'] &&
                fila.uiValidators.errores.razonSocial['fueTocado'] && !fila.uiValidators.errores.razonSocial['hayErrores'] &&
                fila.uiValidators.errores.utilidad['fueTocado'] && !fila.uiValidators.errores.utilidad['hayErrores'] &&
                fila.uiValidators.errores.tipoSociedad['fueTocado'] && !fila.uiValidators.errores.tipoSociedad['hayErrores']);
      default:
        throw new Error('Modo de FilaCrudSociedad no permitido');

    }
  }

  /**
   * Valida que sea un valor distinto de undefined.
   * @param value string con el tipo de sociedad.
   */
  validarTipoSociedad(value: string): boolean {
    return (value && value !== 'null');
  }

  /**
   * Valida que al menos tengra 3 letras.
   */
  validarRazonSocial(value: string): boolean {
    return (value && value.length > 3);
  }

  /**
   * Verifica que el rut sea mayor a 50 millones.
   * @param value rut en el formato XXXXXXXX-X o XX.XXX.XXX-X.
   */
  validarRutEmpresa(value: string): boolean {
    if (!value) {
      return false;
    }

    const rut = Number(value.split('-')[0].replace(/\./, ''));
    return rut >= this.RUT_EMPRESA;
  }

  /**
   * Valida que el capital sea mayor a 2.
   * @param value string a validar con el formato XXX,XX
   */
  validarCapital(value: string): boolean {
    if (!value) {
      return false;
    }

    const capital = this.fmtCurrencyPipe.parseToNumber(value, 'CLP');
    return (capital >= this.CAPITAL_MINIMO);
  }

  /**
   * Valida que el porcentaje de utilidades de la sociedades sea mayor a 2.
   * @param value string a validar con el formato XXX,XX
   */
  validarUtilidadSociedades(value: string): boolean {
    if (!value) {
      return false;
    }

    const utilidad = this.fmtCurrencyPipe.parseToNumber(value, 'CLP');
    return (utilidad >= this.UTILIDAD_SOCIEDADES_MINIMO);
  }

  /**
   * Valida que el porcentaje de utilidades para avales sea mayor a 0.00.
   * @param value string a validar con el formato XXX,XX
   */
  validarUtilidadAvales(value: string): boolean {
    if (!value) {
      return false;
    }

    const utilidad = this.fmtCurrencyPipe.parseToNumber(value, 'CLP');
    return (utilidad > 0.00);
  }
}
