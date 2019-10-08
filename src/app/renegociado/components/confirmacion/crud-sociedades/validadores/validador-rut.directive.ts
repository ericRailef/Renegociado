import { Directive, ElementRef, OnInit, HostListener, Input } from '@angular/core';
import { FormatoRutPipe } from '../../../../shared/pipes/formato-rut.pipe';
import { EnvironmentUtilities } from '../../../../shared/utilities/navigator.utilities';

@Directive({
  selector: '[appValidadorRut]'
})
export class ValidadorRutDirective implements OnInit {

  // tslint:disable-next-line:no-input-rename
  @Input('appValidadorRut') param: any;

  private el: HTMLInputElement;
  private readonly specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home'];
  private readonly RUT_REGEXP = new RegExp(/^[0-9k]*$/g);

  private isAndroid = false;

  constructor(private elementRef: ElementRef,
              private rutPipe: FormatoRutPipe) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.el.value = this.rutPipe.transform(this.el.value);
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
    return (value && !String(value).match(this.RUT_REGEXP));
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value) {
    this.el.value = this.rutPipe.parse(value);

    // Permite que IE el cursor quede al final del texto
    this.el.selectionStart = this.el.value.length;
  }
}
