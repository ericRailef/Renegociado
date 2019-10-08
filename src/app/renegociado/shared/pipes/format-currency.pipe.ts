import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

const PADDING = '000000';

@Pipe({
  name: 'formatCurrency'
})
export class FormatCurrencyPipe implements PipeTransform {

  private readonly SEPARADOR_COMA = ',';
  private readonly SEPARADOR_PUNTO = '.';
  private readonly PREFIJO_USD = 'USD ';
  private readonly PREFIJO_EUR = 'EUR ';
  private readonly PREFIJO_CLP = '$';
  private readonly PREFIJO_UNKNOWN = '$';

  constructor(private decimalPipe: DecimalPipe) {}

  transform(amount: any, moneda: string, decimales: boolean = false, showPrefijo: boolean = true): string {
    if (amount === undefined || amount.toString().trim().length === 0) {
      return '';
    }

    let prefijo = '';
    const formato = decimales ? '1.2-2' : '1.0-0';

    if (showPrefijo) {
      prefijo = this.getPrefijo(moneda);
    }

    return `${prefijo}${this.decimalPipe.transform((!amount ? 0 : amount), formato)}`;
  }

  parse(value: string, moneda: string, fractionSize: number = 2): string {
    if (!value || value.trim().length === 0) {
      return '';
    }

    let [integer, fraction = ''] = (value || '').split(this.SEPARADOR_COMA);
    const prefijo = this.getPrefijo(moneda);

    integer = integer.replace(prefijo, '');
    integer = integer.replace(this.SEPARADOR_PUNTO, '');

    fraction = parseInt(fraction, 10) > 0 && fractionSize > 0
      ? this.SEPARADOR_COMA + (fraction + PADDING).substring(0, fractionSize)
      : '';

    return (integer.trim().length === 0 ? '0' : integer) + fraction;
  }

  parseToNumber(value: string, moneda: string, fractionSize: number = 2): Number {
    const valor = this.parse(value, moneda, fractionSize);

    if (valor === '') {
      return 0;
    }

    return Number(valor.replace(this.SEPARADOR_COMA, this.SEPARADOR_PUNTO));
  }

  private getPrefijo(tipoMoneda: string): string {
    let prefijo = '';

    switch (tipoMoneda) {
      case 'USD': {
        prefijo = this.PREFIJO_USD;
        break;
      }
      case 'EUR': {
        prefijo = this.PREFIJO_EUR;
        break;
      }
      case 'CLP': {
        prefijo = this.PREFIJO_CLP;
        break;
      }
      default: {
        prefijo = this.PREFIJO_UNKNOWN;
      }
    }

    return prefijo;
  }

}
