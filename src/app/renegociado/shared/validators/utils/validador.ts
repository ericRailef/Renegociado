
/**
 * Contiene metodos estaticos para validar datos.
 */
export class Validador {

  static EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /**
   * Verifica que el rut sea valido basado en el digito verificador.
   * @param rut rut en el formato xxxxxxx-x ó xxxxxxxx
   */
  static validarRut(rut: string): boolean {

    if (!rut || rut.trim().length < 2) {
      return false;
    }

    const arrRut = this.getRutSeparado(rut);

    let suma = 0;
    let rutSolo = Number(arrRut[0]);
    let continuar = true;
     for (let i = 2; continuar; i++) {
        suma += (rutSolo % 10) * i;
        rutSolo = parseInt((rutSolo / 10).toString(), 10);
        i = (i === 7) ? 1 : i;

        continuar = (rutSolo === 0) ? false : true;
     }

    const resto = suma % 11;
    const dv = 11 - resto;
    const verif = arrRut[1].toUpperCase();
    if (dv === 10) {
      if (verif.toUpperCase() === 'K') {
        return true;
      }
    } else if (dv === 11 && verif === '0') {
      return true;
    } else if (String(dv) === verif) {
      return true;
    } else {
      return false;
    }

    return false;
  }

  private static getRutSeparado(rut: string): string[] {
    let arrRut: string[] = [];

    if (rut.trim().indexOf('-') >= 0) {
      arrRut = rut.split("-");
    } else {
      arrRut.push(rut.substring(0, rut.length - 1));
      arrRut.push(rut.substring(rut.length - 1));
    }

    return arrRut;
  }
}
