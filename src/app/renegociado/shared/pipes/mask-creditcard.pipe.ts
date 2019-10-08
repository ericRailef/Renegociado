import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCreditcard'
})
export class MaskCreditcardPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if (!value) {
      return value;
    }

    const nroTarjeta = value.replace(/ /g, '');
    const mask = Array.from(nroTarjeta)
      .map((digito, idx, arr) => {
        if (idx > 11) {
          return digito;
        } else {
          return '*';
        }
      }).reduce((act, sig, idx, arr) => {
        if (idx === 4 || idx === 8 || idx === 12) {
          return act + ' ' + sig;
        }

        return act + sig;
      });

    return mask;
  }
}
