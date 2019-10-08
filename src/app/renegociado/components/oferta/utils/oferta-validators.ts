import { AbstractControl } from '@angular/forms';

export class OfertaValidators {

  /**
   * Verifica que la fecha seleccionada este entre el dia actual y 45 dias posteriores.
   * @param control control que invoca validacion.
   */
  static primerVencimientoValidator(control: AbstractControl) {
    const fechaSeleccionada: Date = control.value;
    fechaSeleccionada.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limiteFecha = new Date();
    limiteFecha.setDate(limiteFecha.getDate() + 45);
    limiteFecha.setHours(0, 0, 0, 0);

    if (hoy.getTime() > fechaSeleccionada.getTime() || fechaSeleccionada.getTime() > limiteFecha.getTime()) {
      return { 'fechaInvalida': true };
    }

    return null;
  }

  /* Valida que el plazo seleccionado por el usuario sea valido */
  static plazoValidator(control: AbstractControl) {
    const plazoSeleccionado = control.value;

    if (plazoSeleccionado === null || plazoSeleccionado === 'null') {
      return { 'plazoInvalido': true };
    }

    return null;
  }
}
