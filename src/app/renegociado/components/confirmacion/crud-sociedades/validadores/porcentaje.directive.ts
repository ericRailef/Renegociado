import { Directive, OnInit, ElementRef, HostListener, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EnvironmentUtilities } from '../../../../shared/utilities/navigator.utilities';
import { CrudUtils } from '../utils/CrudUtils';
import { FormatCurrencyPipe } from '../../../../shared/pipes/format-currency.pipe';

@Directive({
  selector: '[appPorcentaje]'
})
export class PorcentajeDirective implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('appPorcentaje') param: any;

  private el: HTMLInputElement;
  private readonly specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home'];
  private readonly PORCENTAJE_REGEX = new RegExp(/^100$|^[0-9]{1,2}$|^[0-9]{1,2}\,[0-9]{0,2}$/g);

  private isAndroid = false;

  private crudUtils: CrudUtils;

  constructor(private elementRef: ElementRef, private decimalPipe: DecimalPipe, fmtCurrencyPipe: FormatCurrencyPipe) {
    this.el = this.elementRef.nativeElement;
    this.crudUtils = new CrudUtils(fmtCurrencyPipe);
  }

  ngOnInit(): void {
    this.el.value = this.decimalPipe.transform(this.el.value, '1.2-2');
    this.isAndroid = EnvironmentUtilities.isAndroid();
  }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    if (this.isAndroid) {
      // caracteres no imprimibles
      if (!event.data) {
        return;
      }

      const current = this.el.value;
      if (this.isInvalid(current)) {
        this.el.value = current.substring(0, current.length - 1);
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isAndroid) {
      if (this.specialKeys.indexOf(event.key) !== -1) {
        return;
      }

      const current = this.el.value;
      const next = current.concat(event.key);
      if (this.isInvalid(next)) {
        event.preventDefault();
      }
    }
  }

  private isInvalid(value: string): boolean {
    return value && !String(value).match(this.PORCENTAJE_REGEX);
  }

  // @HostListener('blur', ['$event.target.value'])
  // onBlur(value) {
  //   const errores = this.param.fila.uiValidators.errores;

  //   if (this.param.tipo === 'participacion') {
  //     errores.utilidad.hayErrores = !this.crudUtils.validarUtilidadSociedades(value);
  //     errores.utilidad.fueTocado = true;
  //   }
  //   if (this.param.tipo === 'aval') {
  //     errores.utilidad.hayErrores = !this.crudUtils.validarUtilidadAvales(value);
  //     errores.utilidad.fueTocado = true;
  //   }
  //   if (this.param.tipo === 'capital') {
  //     errores.capital.hayErrores = !this.crudUtils.validarCapital(value);
  //     errores.capital.fueTocado = true;
  //   }

  //   this.el.value = this.decimalPipe.transform(value.replace(/\,/g, '.'), '1.2-2');
  // }

}
