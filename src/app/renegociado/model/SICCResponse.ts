export interface SICCResponse {
  totalDeLaDeuda: string;

  ResumenDelCredito: {
    valorCuota: string;
    cantidadCuotas: string;
    montoBruto: string;
    montoLiquido: string;
    montoaPagar: string;
    fechaPrimerVencimiento: string;
    CAE: string;
    tasaMensual: string;
    tasaAnual: string;
    impuesto: string;
    gastoNotarial: string;
    gastosTotales: string;
    seguroDesgravamenMensual: string;
    seguroDesgravamenTotal: string;
    seguroCesantiaMensual: string;
    seguroCesantiaTotal: string;
    seguroVidaMensual: string;
    seguroVidaTotal: string;
    totalSeguroMensual: string;
    totalSeguroTotal: string;
    selSegDesgravamen: string;
    selSegCesantia: string;
    selSegVida: string;
  };

  RebajadeCuposyCierredeProductos: {
    valorUF: string;
    montoLiquido: string;
    modificacionProductosTC: {
      descripcion: string;
      numeroTarjeta: string;
      contrato: string;
      cupoActualPesos: string;
      cupoNuevoPesos: string;
      cupoActualDolar: string;
      cupoNuevoDolar: string
    }[];
    modificacionProductosLCA: {
      descripcion: string;
      contrato: string;
      cupoActualPesos: string;
      cupoNuevoPesos: string
    }[]
  };

  DeudasaRefinar: {
    valorDolar: string;
    prestamosRefinanciar: {
      contrato: string;
      descripcion: string;
      deudaTotal: string;
      deudaPrepago: string
    }[];
    LCARefinanciar: {
      descripcion: string;
      contrato: string;
      deudaTotal: string;
      deudaPrepago: string
    }[];
    tarjetasRefinanciar: {
      numeroTarjeta: string;
      descripcion: string;
      deudaTotalCLP: string;
      deudaTotalUSD: string;
      duedaPrepago: string;
    }[];
  };
}
