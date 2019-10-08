import { Documento } from './Documento';
import { Sociedad, AvaloFiador } from './OF01Response';
export interface Contexto {
  iniciado: boolean;  // Indica si el contexto fue creado por el ingreso del usuario

  oferta?: {
    plazoCredito: string;
    primerVencimiento: Date;
    seguroCesantia: boolean;
    seguroDesgravamen: boolean;
    seguroVida: boolean;
  };

  confirmacion?: {
    telefono?: string;
    email?: string;
    autorizacion?: boolean;
    participaSociedades?: boolean;
    esAvalFiador?: boolean;
    tienePreExistencias?: boolean;
    preExistencias?: string;
    cuentaCorrienteCargo?: string;

    listadoSociedades?: Sociedad[];
    listadoAvaloFiador?: AvaloFiador[];
  };

  autorizacion?: {
    documentos: {
      mandato: Documento;
      contratoServAutomatizados: Documento;
      contratoCompraVentaDivisas: Documento;
      contratoMarco: Documento;
      polizas?: Documento;
    }
  };
}
