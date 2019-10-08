/**
 * Representa la respuesta del servicio OF-01
 */
export interface OF01Response {
  indOfertable: string;
  motivoRechazo: string;
  codigoSiguienteTarea: string;
  idOferta: string;
  idSolicitud: string;
  indCompraExterna: string;
  fechaPrimerVencimiento: string;
  cuotasCredito: string;
  mesesCarencia: string;
  selSegDesgravamen: string;
  selSegCesantia: string;
  selSegVida: string;

  listaContratoCompra: ContratoCompra[];

  telefonoMovil: string;
  email: string;
  cuentaCorrienteCargo: string;
  participacionSociedades: string;

  listadoSociedades: Sociedad[];

  avaloFiador: string;

  listadoAvaloFiador: AvaloFiador[];

  indDPS: string;
  descripcionDPS: string;
  ind_ContratoMarcoFirmado: string;
}

export class ContratoCompra {
  indCompraCartera: string;
  numeroContrato: string;
  sistemaOrigen: string;
  producto: string;
  subproducto: string;
  indTCDEUFACT: string;
  indDEUCOMPRSIN: string;
  indDEUCOMPRCON: string;
  indTCDEUAVANCE: string;
  indDEUAVANCEEFE: string;
  indDEUSUPERC: string;
  indOTRCOM: string;
  indDEUTOTALUSD: string;
}

export class Sociedad {
  rutSociedad: string;
  razonSocial: string;
  capital: string;
  utilidad: string;
  tipoSociedad: string;
}

export class AvaloFiador {
  rutSociedad: string;
  razonSocial: string;
  fianzaSolidaria: string;
  utilidad: string;
  tipoSociedad: string;
}
