import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que cambia el formato de las fechas entregadas por los servicio backend.
 * Origen: YYYY-MM-DD
 * Destino por Defecto: DD/MM/YYYY
 */
@Pipe({
  name: 'backendFecha'
})
export class BackendFechaPipe implements PipeTransform {

  transform(value: string, formatoDestino: string = 'dd/MM/YYYY'): string {

    if (!value || value.trim().length < 10) {
      return value;
    }

    return `${value.substring(8, 10)}/${value.substring(5, 7)}/${value.substring(0, 4)}`;
  }

}
