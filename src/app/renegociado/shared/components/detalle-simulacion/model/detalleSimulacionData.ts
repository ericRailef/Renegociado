
/** Encapsula la información del componente detalle simulación */
export interface DetalleSimulacionData {

    fechaPrimerVencimiento?: Date;
    valorCuota?: string;
    totalCuotaMensuales?: string;
    montoBruto?: string;
    montoLiquido?: string;
    montoaPagar?: string;
    CAE?: string;
    tasaMensual?: string;
    tasaAnual?: string;
    impuesto?: string;
    gastoNotarial?: string;
    gastosTotales?: string;
    seguroDesgravamenMensual?: string;
    seguroDesgravamenTotal?: string;
    seguroCesantiaMensual?: string;
    seguroCesantiaTotal?: string;
    seguroVidaMensual?: string;
    seguroVidaTotal?: string;
    totalSeguroMensual?: string;
    totalSeguroTotal?: string;
    selSegDesgravamen?: string; // json
    selSegCesantia?: string; // json
    selSegVida?: string; // json

    // Campos Rebaja de Cupos y cierre de Productos
    valorUF?: string;
    modificacionProductosTC?: any [];
    modificacionProductosLCA?: any [];

    // Campos Deudas a Refinar
    valorDolar?: string;
    montoLiquidoDeudasRefinanciar?: string;
    sistemaOrigenUG?: any [];
    sistemaOrigeLCA?: any [];
    sistemaOrigenMP?: any [];
}

