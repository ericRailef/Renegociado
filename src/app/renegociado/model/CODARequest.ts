
/**
 * Representa la informacion requerida por el servicio CODA.
 */
export class CODARequest {
  RutUsuario: string;
  idSolicitud: string;
  selSegCesantia: string;
  selSegDesgravamen: string;
  selSegVida = 'N';
  indContratoMarcoFirmado: string;
  telefonoMovil: string;
  email: string;
  cuentaCorrienteCargo: string;
  flagParticipaciones: string;

  listaSociedades: {
    rutSociedad: string;
    razonSocial: string;
    capital: string;
    utilidad: string;
    tipoSociedad: string;
  }[];

  flagAvales: string;

  listaAvales: {
    rutSociedad: string;
    razonSocial: string;
    fianzaSolidaria: string;
    utilidad: string;
    tipoSociedad: string;
  }[];

  indDPS = 'N';
  descripcionDPS = '';
}
