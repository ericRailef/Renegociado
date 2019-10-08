import { Pipe, PipeTransform } from '@angular/core';
import { FormatCurrencyPipe } from './format-currency.pipe';

/**
 * Pipe que permite transformar o dar formato a los montos que llegan desde el backend como string
 * y longitud 17.
 *
 * El pipe por defecto utiliza la configuracion para CLP, sin decimales y mostrando el simbolo de $.
 * En caso de querer utilizar el pipe con dolares se informa la moneda 'USD'.
 */
@Pipe({
  name: 'backendCurrencyFormat'
})
export class BackendCurrencyFormatPipe implements PipeTransform {

  private readonly MONEDA_CLP = 'CLP';
  private readonly MONEDA_USD = 'USD';

  constructor(private currencyFmtPipe: FormatCurrencyPipe) {}

  transform(value: string, moneda = 'CLP', showPrefijo = true, useSign = false): string {

    if (!value) {
      return this.currencyFmtPipe.transform(Number(value), moneda, (moneda === this.MONEDA_USD), showPrefijo);
    }

    switch (moneda) {
      case this.MONEDA_USD:
        return this.tranformUSD(value, showPrefijo, useSign);
      case this.MONEDA_CLP:
      default:
        return this.transformCLP(value, showPrefijo, useSign);
    }
  }

  /*
   * Transforma un monto que viene con el formato XXXXXXXXXXXXXDDDD.
   */
  private tranformUSD(value: string, showPrefijo = true, useSign = false): string {
    if (!value || value.length === 0) {
      return this.currencyFmtPipe.transform(Number(0), this.MONEDA_USD, true, showPrefijo);
    }

    const largoSinDecimales = value.length - 4;

    // Se genera XXXXXXXXXXXXX.DD
    const parteEntera = value.substring(0, largoSinDecimales);
    const parteDecimal = value.substring(largoSinDecimales, largoSinDecimales + 2);
    const valorFinal = parteEntera.concat('.').concat(parteDecimal);

    return this.currencyFmtPipe.transform(
      this.negate(value, useSign, Number(valorFinal)),
      this.MONEDA_USD,
      true,
      showPrefijo);
  }

  /*
   * Transforma un string que viene con formato XXXXXXXXXXXXXDDDD.
   */
  private transformCLP(value: string, showPrefijo = true, useSign = false): string {
    if (value.length <= 4) {
      return this.currencyFmtPipe.transform(Number(0), this.MONEDA_CLP, false, showPrefijo);
    }

    const largoSinDecimales = value.length - 4;

    return this.currencyFmtPipe.transform(
      this.negate(value, useSign, Number(value.substring(0, largoSinDecimales))),
      this.MONEDA_CLP,
      false,
      showPrefijo);
  }

  private negate(value: string, useSign: boolean, numValue: number): number {
    return (useSign && value.endsWith('-')) ? numValue * -1 : numValue;
  }

  /**
   * Permite transformar un string de 17 caracteres en un numero.
   * Si el valor no cumple con la longitud de 17 caracteres correspondiente al formato
   * entregado por los servicios, el valor es transformado sin consideraciones (4 ultimos digitos son decimales, etc...)
   */
  parse(value: string, moneda: string = 'CLP'): number {
    if (!value) {
      return 0;
    }

    if (value.length !== 17) {
      return Number(value);
    }

    switch (moneda) {
      case this.MONEDA_USD:
        const valorFinal = value.substring(0, 13) + '.' + value.substring(13, 14);
        return Number(valorFinal);
      case this.MONEDA_CLP:
      default:
        return Number(value.substring(0, 13));
    }
  }

}
