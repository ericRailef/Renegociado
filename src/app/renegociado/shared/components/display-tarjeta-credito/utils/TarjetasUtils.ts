import { MaskCreditcardPipe } from '../../../pipes/mask-creditcard.pipe';
export class TarjetasUtils {

  private static mastercards = [
    "1016", "1017", "1018", "1019", "1020", "1021", "1022", "1023", "1030", "1035", "1036", "1037", "1038", "1039",
    "1040", "1041", "1042", "1044", "1047", "1048", "1049", "1053", "1054", "1055", "1056", "1067", "1068", "1070",
    "1071", "1072", "1073", "1074", "1075", "1076", "1077", "1078", "1084", "1085", "1086", "1087", "1090", "2000",
    "8004", "8005", "8006", "8007", "8009", "8011", "8012", "8013", "8016", "8017", "8018", "8019", "8021", "8022",
    "8023", "8024", "8025", "1900", "1089", "1092", "8026", "1093", "1094", "1095"];

  private static visas = [
    "1010", "1011", "1012", "1013", "1014", "1015", "1034", "1046", "1050", "1051", "1052", "1057", "1058",
    "1059", "1065", "1066", "1079", "8000", "8001", "8002", "8003", "8010", "1060", "2003", "2004",
    "2005", "2006", "2007"];

  private static magnas = ["1024", "8008"];

  private static amexs = ["1025", "1026", "1027", "1028", "1029", "1031", "1081", "1082", "2009", "2010", "2011", "2012", "2013"];

  /**
   * Retorna la class (estilo) asociado al numero de tarjeta.
   * @param numero numero de tarjeta de credito
   */
  static getClassTarjeta(numero: string): string {
    let clase = '';

    switch (true) {
      case TarjetasUtils.isMasterCard(numero):
        clase = 'mastercard';
        break;
      case TarjetasUtils.isVisa(numero):
        clase = 'visa';
        break;
      case TarjetasUtils.isMagna(numero):
        clase = 'magna';
        break;
      case TarjetasUtils.isAmex(numero):
        clase = 'amex';
        break;
      default:
        clase = '';
        break;
    }

    return clase;
  }

  static isMasterCard(numero: string): boolean {
    return this.mastercards.indexOf(numero.trim()) >= 0;
  }

  static isVisa(numero: string): boolean {
    return this.visas.indexOf(numero.trim()) >= 0;
  }

  static isMagna(numero: string): boolean {
    return this.magnas.indexOf(numero.trim()) >= 0;
  }

  static isAmex(numero: string): boolean {
    return this.amexs.indexOf(numero.trim()) >= 0;
  }
}
