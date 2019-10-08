export class Documento {
  // Tipos de documentos soportados
  static readonly MANDATO             = 'MAND_CCARTERA';
  static readonly CONTRATO_CREDITO    = 'CONT_CONSUMO';
  static readonly CONTRATO_SRV_AUTO   = 'AUT_SSAA';
  static readonly CONTRATO_CV_DIVISAS = 'CONTRA_DIVI';
  static readonly POLIZAS             = 'SEG_CES_6500';

  tipoDocumental: string;
  url: string;

  // Campo de uso interno para la aplicacion
  data?: any;
}
