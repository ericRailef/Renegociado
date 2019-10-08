
export class EnvironmentUtilities {

  /**
   * Verifica si la aplicacion esta corriendo desde un browser en ambiente Android.
   */
  static isAndroid(): boolean {
    return navigator.userAgent.match(/Android/i) ? true : false;
  }
}
