
export class ContrataCreditoConsumoRequest {
  RutUsuario: string;
  Cabecera: {
    HOST: {
      "USUARIO-ALT": string;
      "TERMINAL-ALT": string;
      "CANAL-ID": string;
    };
    CanalFisico: string;
    CanalLogico: string;
    RutCliente: string;
    RutUsuario: string;
    IpCliente: string;
    InfoDispositivo: string;
    InfoDataPower: string;
    InfoArquitectura: string;
    InfoGeneral: string;
  };
  INPUT: {
    RutCliente: string;
    MatrizDesafio: string;
    entidad: string;
    idOrigen: string;
    idSolicitud: string;
    fechaConsulta: string;
  };
}
