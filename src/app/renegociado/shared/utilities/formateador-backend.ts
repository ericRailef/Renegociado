
/**
 * Clase utilitaria para poder dar formato o parsear datos desde/hacia el backend.
 */
export class FormateadorBackend {

  /**
   * Le da el formato esperado por el backend al parametro telefono.
   * Formato esperado por backend string de 9 caracteres. No se debe
   * considerar '+569'.
   * @param telefono telefono con formato ingresado por usuario.
   */
  static telefonoToBackend(telefono: string): string {
    if (!telefono) {
      return '';
    }

    const inicio = telefono.length - 8;
    if (inicio < 0) {
      return telefono;
    }

    return telefono.substring(inicio);
  }

  static telefonoFromBackend(telefono: string): string {
    if (!telefono) {
      return '';
    }

    if (telefono.startsWith('+569')) {
      return telefono;
    }

    return '+569'.concat(telefono);
  }

  /**
   * Le da el formato esperado por el backend.
   * Formato esperado por el backend es un string de 11 caracteres sin separador
   * de miles ni separador de DV. Se completa con 0 a la derecha.
   * @param rut rut en formato soportado por la aplicacion.
   */
  static rutToBackend(rut: string): string {
    const MAX_LENGTH = 11;

    if (!rut) {
      return '00000000000';
    }

    const rutFormato = rut.replace(/\./g, '').replace(/-/g, '');

    return this.padRight(rutFormato, 11);
  }

  /**
   * Toma el rut con el formato backend (11 digitos completado con ceros a la izq.) le quita
   * los ceros a la izq.
   * @param rut con formato entregado por el backend.
   */
  static rutFromBackend(rut: string): string {
    if (!rut) {
      return '';
    }

    return rut.replace(/^0+/, '').replace(/\./g, '').replace(/-/g, '');
  }

  /**
   * Le da formato esperado por el backend. Si tiene decimales se debe enviar con puntos y
   * dos decimales.
   * @param valor monto con el formato ingresado por la aplicacion (XX,DD)
   */
  static porcentajeToBackend(valor: string): string {
    const MAX_LENGTH_ENTERO = 5;
    const MAX_LENGTH_DECIMAL = 2;

    if (!valor) {
      return '0.00';
    }

    // retorna la parte decimal con un largo de 2 y completado con 0 a la izquierda
    const getParteDecimal = (param: string = '00') => {
      if (param.length === MAX_LENGTH_DECIMAL) {
        return param;
      }

      if (param.length > MAX_LENGTH_DECIMAL) {
        return param.substring(0, MAX_LENGTH_DECIMAL);
      }

      let decimalFinal = param;
      for (let i = param.length; i < MAX_LENGTH_DECIMAL; i++) {
        decimalFinal = decimalFinal.concat('0');
      }

      return decimalFinal;
    };

    // separamos la parte entera y la decimal
    const partesNumero: string[] = valor.split(',');

    // se obtiene la parte decimal XXXXX,DD -> DD
    const decimal = getParteDecimal(partesNumero[1]);

    // se obtiene la parte entera sin puntos
    const entero = partesNumero[0].replace(/\./g, '');

    return entero.concat('.').concat(decimal);
  }

  /**
   * Convierte el porcentaje en formato entregado por el backend al formato
   * soportado por la aplicacion.
   * Formato backend: XXXXX.DD
   * Formato app: XXX,DD
   * @param valor monto con el formato del backend XXXXX.DD
   */
  static porcentajeFromBackend(valor: string): string {
    if (!valor) {
      return valor;
    }

    const partesNumero = valor.split('.');
    const parteEntera = Number(partesNumero[0]);
    const parteDecimal = (partesNumero.length === 2 ? partesNumero[1] : '00');

    return parteEntera.toString().concat(',').concat(parteDecimal);
  }

  /*
   * Rellena a la derecha el valor para completar la maxima longitud.
   */
  private static padRight(valor: string, maxLength: number, relleno: string = '0'): string {
    const padLength = maxLength - valor.length;
    let pad = '';

    for (let i = 0; i < padLength; i++) {
      pad = pad.concat(relleno);
    }

    return pad.concat(valor);
  }
}
