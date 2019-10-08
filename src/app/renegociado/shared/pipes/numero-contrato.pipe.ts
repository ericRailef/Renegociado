import { Pipe, PipeTransform } from '@angular/core';

/**
 * Da formato a los numero de contrato de Creditos de consumo.
 *
 * El pipe considera los 12 ultimos caracteres del string para dar el formato
 * X-XXX-XX-XXXXX-X.
 */
@Pipe({
  name: 'numeroContrato'
})
export class NumeroContratoPipe implements PipeTransform {

  transform(value: string, args?: any): any {

    if (!value || value.trim().length < 12) {
      return value;
    }

    const nro = value.substring(8);

    return `${nro.charAt(0)}-${nro.substring(1, 4)}-${nro.substring(4, 6)}-${nro.substring(6, 11)}-${nro.charAt(11)}`;
  }

}
