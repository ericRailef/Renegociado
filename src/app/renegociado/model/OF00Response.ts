import { CreditoConsumo, LineaCredito, TarjetaCredito, TotalesDeudaProducto, TotalesPorDetalle } from './OF02Response';
import { Sociedad, AvaloFiador } from './OF01Response';
/**
 * Representa la informacion de salida (considerando solo el contenido dentro de Data)
 * por el servicio OF00.
 */
export class OF00Response {
  indOfertable: string;
  codSiguienteTarea: string;
  motivoNoOfertable: string;
  valorUF: string;
  indCompraExterna: string;
  indSeguroDesgravamen: string;
  indSeguroCesantia: string;
  indSeguroVida: string;
  plazoMinimo: string;
  plazoMaximo: string;

  // Creditos de Consumo
  ListasUG?: CreditoConsumo[];

  // Lineas de Credito
  ListasBG?: LineaCredito[];

  // Tarjetas de credito
  ListasMP?: TarjetaCredito[];

  TotalesDeudaProducto: TotalesDeudaProducto;

  TotalesPorDetalle: TotalesPorDetalle;

  telefonoMovil: string;
  email: string;
  cuentaCorrienteCargo: string;

  flagParticipaciones: string;
  ListadoSociedades: Sociedad[];

  flagAvales: string;
  ListadoAvales: AvaloFiador[];

  indDPS: string;
  descripcionDPS: string;
}
