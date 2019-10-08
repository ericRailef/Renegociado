import { Directive, OnInit, ElementRef, HostListener, Input } from '@angular/core';
import { EnvironmentUtilities } from '../utilities/navigator.utilities';
import { FormControl } from '@angular/forms';

/**
 * Realiza el formato de un numero telefonico fijo o de celular chileno,
 * los formatos son +56 XXXXXXXXX o +569 XXXXXXXX respectivamente.
 */
@Directive({
  selector: '[appTelefono]'
})
export class TelefonoDirective implements OnInit {

  static readonly TELEFONO_COMPLETO_REGEXP = new RegExp(/^[+56]+\d{11}$/g);

  static readonly TELEFONO_FIJO_COMPLETO_REGEXP = new RegExp(/^[+56]+d{0}$|^[+56]+\d{11}$/g);

  private el: HTMLInputElement;

  // El tipo de telefono puede ser F: Fijo o C: Celular.
  // tslint:disable-next-line:no-input-rename
  @Input('appTelefono') param: {
    tipoTelefono: string;
    formControl: FormControl;
  };

  // Prefijo para telefonos celulares
  private readonly PREFIJO = '+569';

  // Prefijo para telefonos fijos
  private readonly PREFIJO_FIJO = '+56';

  // Formato valido para telefonos celulares
  private readonly TELEFONO_REGEXP = new RegExp(/^[+569]{1}\d{0,11}$/g);

  // Formato valido para telefonos fijos
  private readonly TELEFONO_FIJO_REGEXP = new RegExp(/^[+56]{1}\d{0,11}$/g);

  private readonly specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home'];

  private isAndroid = false;
  private prefijoSeleccionado;
  private expRegulaSeleccionada;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.el.value = this.format(this.el.value);
    this.isAndroid = EnvironmentUtilities.isAndroid();
    this.prefijoSeleccionado = (this.param.tipoTelefono === 'C' ? this.PREFIJO : this.PREFIJO_FIJO);
    this.expRegulaSeleccionada = (this.param.tipoTelefono === 'C' ? this.TELEFONO_REGEXP : this.TELEFONO_FIJO_REGEXP);
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
        if (event.key === 'Backspace' && this.el.value === this.prefijoSeleccionado) {
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();

      if (this.isInvalid(this.el.value.concat(event.key))) {
        return;
      }

      this.param.formControl.setValue(this.el.value.concat(event.key));
    }
  }

  private isInvalid(value: string): boolean {
    return (value && (value.length > 12 || !String(value).match(this.expRegulaSeleccionada)));
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value) {
    const valorSinFormato = this.unformat(value);

    if (this.isAndroid) {
      this.el.value = valorSinFormato;
    } else {
      this.el.value = (!valorSinFormato.startsWith(this.prefijoSeleccionado) ? `${this.prefijoSeleccionado}${valorSinFormato}` : valorSinFormato);
    }

    // Linea requerida para corregir comportamiento en IE.
    this.el.selectionStart = this.el.value.length;
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    const valorConFormato = this.format(value);
    this.el.value = (valorConFormato.trim() === this.prefijoSeleccionado ? '' : valorConFormato);
  }

  private format(value: string): string {
    if (!value || value.trim().length === 0) {
      return value;
    }

    return (this.param.tipoTelefono === 'C'
            ? `${value.substring(0, 3)} ${value.substring(3, 4)} ${value.substring(4)}`
            : `${value.substring(0, 3)} ${value.substring(3)}`);
  }

  private unformat(value: string): string {
    if (!value || value.trim().length === 0) {
      return value;
    }

    return `${value.replace(/ /g, '')}`;
  }
}
