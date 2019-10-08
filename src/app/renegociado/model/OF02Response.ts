/**
 * Representa la respuesta del servicio OF-02.
 */
export class OF02Response {
  indOfertable: string;
  motivoNoOfertable: string;
  valorUF: string;
  indCompraExterna: string;
  indSeguroDesgravamen: string;
  indSeguroCesantia: string;
  indSeguroVida: string;
  plazoMinimo: string;
  plazoMaximo: string;

  // Creditos de Consumo
  ListasUG: CreditoConsumo[];

  // Lineas de Credito
  ListasBG: LineaCredito[];

  // Tarjetas de credito
  ListasMP: TarjetaCredito[];

  TotalesDeudaProducto: TotalesDeudaProducto;

  TotalesPorDetalle: TotalesPorDetalle;

}

export class CreditoConsumo {
  contrato: string;
  sistemaOrigen: string;
  montoDeudaPrepago: string;
  montoDeudaTotal: string;
  monedaOrigen: string;
  estado: string;
  montoOtorgado: string;
  MonedaOrigen: string;
  fechaOtorgamiento: string;
  valorCuota: string;
  saldoCapital: string;
  interesCapital: string;
  interesMora: string;
  comisionPre: string;
  nCuotasPactadas: string;
  nCuotasPagadas: string;
  descripcionProducto: string;
}

export class LineaCredito {
  contrato: string;
    descripcionEstado: string;
    moneda: string;
    ctaAsociada: string;
    deudaTotal: string;
    cupoOtorgado: string;
    cupoUtilizado: string;
    descripcionProducto: string;
}

export class TarjetaCredito {
  contrato: string;
  numeroTarjeta: string;
  indAutorizacionesPdtes: string;
  indIncidenciasPdtes: string;
  estadoTC: string;
  codigoBloqueo: string;
  fechaVencimiento: string;
  codigoMonedaNacional: string;
  deudaFacturada: string;
  deudaCompraSinInt: string;
  deudaCompraConInt: string;
  totalDeudaCompra: string;
  deudaAvance: string;
  deudaAvanceEfec: string;
  totalAvance: string;
  deudaSuperCredito: string;
  otrosComisiones: string;
  montoPago: string;
  deudaTotal: string;
  prepagoDeudaTotalPesos: string;
  codigomonedaInte: string;
  valorUSD: string;
  deudaUSD: string;
  deudaUSDPesos: string;
  prepagoDeudaFact: string;
  prepagoDeudaCompraSinInt: string;
  prepagoDeudaCompraConInt: string;
  prepagoTotalDeudaCompra: string;
  prepagoDeudaAvance: string;
  prepagoDeudaAvanceEfec: string;
  prepagoTotalAvance: string;
  prepagoDeudaSuperCredito: string;
  prepagoOtrosComisiones: string;
  prepagoDeudaUSD: string;
  prepagoDeudaTotal: string;
  deudaTotalDolarPesos: string;
  descripcionProducto: string;
}

export class TotalesDeudaProducto {
  SISTEMA_ORIGEN_MP: string;
  MONCLP_MP: string;
  MONUSD_MP: string;
  SISTEMA_ORIGEN_UG: string;
  MONCLP_UG: string;
  MONUSD_UG: string;
  SISTEMA_ORIGEN_LCA: string;
  MONCLP_LCA: string;
  MONUSD_LCA: string;
  TOTAL_DEUDA: string;
}

export class TotalesPorDetalle {
  TOTLCAML: string;
  TOTLCAMO: string;
  TOTPREML: string;
  TOTPREMO: string;
  TOTPAMML: string;
  TOTPAMMO: string;
  TOTDEUDAML: string;
  TOTDEUDAMO: string;
}
