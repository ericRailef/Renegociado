import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

/**
 * Pipe para dar formato a porcentajes entregados por el backend.
 * Formato esperado: XXXDDDDDD
 * Formato que retorna el pipe: XXX,DD%
 */
@Pipe({
  name: 'backendTax'
})
export class BackendTaxPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: string, verSimbolo: boolean = true): string {
    if (!value) {
      return value;
    }

    let vValue = value.substring(0);

    // Si la longitud del numero es menor a 9 digitos se completa a la izq.
    if (vValue.length < 9) {
      vValue = this.completarCerosIzq(vValue);
    }

    const valorFinal = vValue.substring(0, 3) + '.' + vValue.substring(3, 5);
    const simbolo = (verSimbolo ? '%' : '');

    return `${this.decimalPipe.transform(Number(valorFinal), '1.2-2')}${simbolo}`;
  }

  // Agrega los ceros a la izquierda necesarios hasta
  // cumplir con la longitud de 9.
  private completarCerosIzq(origen: string): string {
    const n = (9 - origen.length);

    if (n === 1) { return '0'.concat(origen); }

    for (let i = 0; i < n; i++) { origen = '0'.concat(origen); }

    return origen;
  }
}
