import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Validador } from './utils/validador';
import { TelefonoDirective } from '../directives/telefono.directive';

export class CustomComponentValidators {

  /**
   * Verifica si el rut ingresado es valido.
   * @param control FormControl al que se aplica la validacion
   */
  static validarRut(control: AbstractControl): ValidationErrors {
    const value = control.value;

    if (Validador.validarRut(value)) {
      return null;
    }

    return { rutInvalido: true };
  }

  /**
   * Verifica si el numero de telefono móvil es valido.
   * @param control FormControl al que se aplica la validacion
   */
  static validarTelefono(control: AbstractControl): ValidationErrors {
    const value = control.value;

    if (!value || value.trim().length === 0
        || !value.replace(/ /g, '').match(TelefonoDirective.TELEFONO_COMPLETO_REGEXP)) {
      return { telefonoInvalido: true };
    }

    return null;
  }

  /**
   * Verifica si el numero de telefono fijo es valido.
   * @param control FormControl al que se aplica la validacion
   */
  static validarTelefonoFijo(control: AbstractControl): ValidationErrors {
    const value = control.value;

    if (!value || value.trim().length === 0) {
      return null;
    }

    if (!value.replace(/ /g, '').match(TelefonoDirective.TELEFONO_FIJO_COMPLETO_REGEXP)) {
      return { telefonoFijoInvalido: true };
    }

    return null;
  }
}
