/**
 * Representa la entrada al servicio SICC.
 */
export class SICCRequest {

  canalFisico: string;
  usuarioAltair: string;
  idOrigen: string;
  entidad: string;
  rutCliente: string;
  idSolicitud: string;
  indCompraExterna: string;
  fechaConsulta: string;
  fechaPrimerVencimiento: string;
  cuotasCredito: string;
  mesesCarencia: string;
  selSegCesantia: string;
  selSegDesgravamen: string;
  selSegVida: string;

  listaCotratoCompra?: {
    indCompraCartera: string;
    numeroContrato: string;
    sistemaOrigen: string;
    ProductoySubproducto: string;
    indTCDEUFACT: string;
    indDEUCOMPRSIN: string;
    indTCDEUCOMPRCON: string;
    indTCDEUAVANCE: string;
    indDEUAVANCEEFE: string;
    IndDEUSUPERC: string;
    indOTRCOM: string;
    indDEUTOTALUSD: string
  }[];
}
