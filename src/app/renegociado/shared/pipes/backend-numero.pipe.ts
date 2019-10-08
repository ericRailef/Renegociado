import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte un string de longitud 17 donde los 4 primeros digitos de derecha a izquierda
 * representan los decimales a un numero.
 */
@Pipe({
  name: 'backendNumero'
})
export class BackendNumeroPipe implements PipeTransform {

  constructor() {}

  transform(value: string): Number {
    if (!value) {
      return 0;
    }

    if (value.trim().length < 17) {
      return Number(value);
    }

    return Number(`${value.substring(0, 13)}.${value.substring(13, 17)}`);
  }

}
