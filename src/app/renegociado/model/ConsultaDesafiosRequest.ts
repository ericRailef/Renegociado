export class ConsultaDesafiosRequest {
  cabecera: {
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
    InfoGeneral: {
      NumeroServidor: string;
    };
  };
  Solicitar_Desafio_Request: {
    RutCliente: string;
  };
}
