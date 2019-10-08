import { Pipe, PipeTransform } from '@angular/core';
import { FormatCurrencyPipe } from './format-currency.pipe';

/**
 * Pipe para dar formato al valor del dolar que viene desde backend en formato XXXXXXDDDDD.
 */
@Pipe({
  name: 'backendDolar'
})
export class BackendDolarPipe implements PipeTransform {

  constructor(private currencyFmtPipe: FormatCurrencyPipe) {}

  transform(value: string, moneda: string = 'CLP'): string {
    if (!value || value.trim().length < 11) {
      return this.currencyFmtPipe.transform(Number(value), moneda, true, true);
    }

    const inicio = value.length - 11;
    const finParteEntera = inicio + 6;

    // Se genera XXXXX.DD
    const valorFinal = value.substring(inicio, finParteEntera) + '.' + value.substring(finParteEntera, finParteEntera + 2);

    return this.currencyFmtPipe.transform(Number(valorFinal), moneda, true, true);
  }

}
