import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que entrega solo la descripcion de la tarjeta sin considerar codigo
 * de producto y subproducto entregado por el backend.
 */
@Pipe({
  name: 'backendDescripcionTarjeta'
})
export class BackendDescripcionTarjetaPipe implements PipeTransform {

  transform(value: string, args?: any): string {
    if (!value || value.trim().length < 7) {
      return '';
    }

    return value.substring(6);
  }

}
