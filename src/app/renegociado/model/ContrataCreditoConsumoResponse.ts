export class ContrataCreditoConsumoResponse {
  Escalares: {
    email: string;
    valorCuota: string;
    cantidadCuotas: string;
    montoBruto: string;
    montoLiquido: string;
    montoAPagar: string;
    fechaPrimerVencimiento: string;
    CAE: string;
    tasaMensual: string;
    tasaAnual: string;
    impuesto: string;
    gastoNotarial: string;
    gastosTotales: string;
    seguroDesgravamenMensual: string;
    seguroDesgravamenAnual: string;
    seguroCesantiaMensual: string;
    seguroCesantiaAnual: string;
    seguroVidaMensual: string;
    seguroVidaAnual: string;
    totalSeguroMensual: string;
    totalSeguroAnual: string;
    GlosaRespuesta: string;
    IntentosFallidosRestantes: string;
    Resultado: string;
    CodigoOTP: string,
    IdTrxOTP: string
  };
  rebajaCuposYCierreProductos: {
    productoBG: {
      descripcion: string;
      contrato: string;
      cupoActualPesos: string;
      cupoNuevoPesos: string;
    }[];
    productoMP: {
      numeroTarjeta: string;
      descripcion: string;
      cupoActualPesos: string;
      cupoNuevoPesos: string;
      cupoActualDolar: string;
      cupoNuevoDolar: string
    }[]
  };
  deudasARefinanciar: {
    valorDolar: string;
    listaUG: {
      descripcion: string;
      contrato: string;
      deudaTotal: string;
      deudaPrepago: string;
    }[];
    listaBG: {
      descripcion: string;
      contrato: string;
      deudaTotal: string;
      deudaPrepago: string;
    }[];
    listaMP: {
      numeroTarjeta: string;
      descripcion: string;
      deudaTotalCLP: string;
      deudaTotalUSD: string;
      duedaPrepago: string;
    }[];
    total: {
      montoLiquido: string;
    }[];
  };
}
