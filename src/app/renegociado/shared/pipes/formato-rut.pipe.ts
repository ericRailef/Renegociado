import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoRut'
})
export class FormatoRutPipe implements PipeTransform {

  transform(rut: any, args?: any): any {
    const actual = rut.replace(/^0+/, '');
    if (actual !== '' && actual.length > 1) {
        const sinPuntos = actual.replace(/\./g, '');
        const actualLimpio = sinPuntos.replace(/-/g, '');
        const inicio = actualLimpio.substring(0, actualLimpio.length - 1);

        let rutPuntos = '';
        let i = 0;
        let j = 1;
        for (i = inicio.length - 1; i >= 0; i--) {
            const letra = inicio.charAt(i);
            rutPuntos = letra + rutPuntos;
            if (j % 3 === 0 && j <= inicio.length - 1) {
                rutPuntos = '.' + rutPuntos;
            }
            j++;
        }
        const dv = actualLimpio.substring(actualLimpio.length - 1);
        rutPuntos = rutPuntos + '-' + dv;
        return rutPuntos;
    }

    return rut;
  }

  parse(rutFormato: string): string {
    return rutFormato.replace(/\./g, '').replace(/-/g, '');
  }

}
