import { Component, OnInit } from '@angular/core';
import { DetalleSimulacionData } from '../../shared/components/detalle-simulacion/model/detalleSimulacionData';
import { ContextoService } from '../../services/contexto.service';

@Component({
  selector: 'app-contratado',
  templateUrl: './contratado.component.html',
  styleUrls: ['./contratado.component.css']
})
export class ContratadoComponent implements OnInit {

  data: DetalleSimulacionData = {};

  // Datos de la pagina
  email: string;

  constructor(private ctxSrv: ContextoService) { }

  ngOnInit() {
    this.email = this.ctxSrv.contrataCreditoConsumoResponse.Escalares.email;

    this.cargarDatosResumenCredito();
    this.cargarDatosRebajadeProductos();
    this.cargarDatosDeudasaRefinar();
  }

  private  cargarDatosResumenCredito() {
    const resp = this.ctxSrv.contrataCreditoConsumoResponse;
    const primerVencimiento = resp.Escalares.fechaPrimerVencimiento.split('-');

    this.data.fechaPrimerVencimiento = new Date(Number(primerVencimiento[0]), Number(primerVencimiento[1]) - 1, Number(primerVencimiento[2]));
    this.data.valorCuota = resp.Escalares.valorCuota;
    this.data.totalCuotaMensuales = resp.Escalares.cantidadCuotas;
    this.data.montoBruto = resp.Escalares.montoBruto;
    this.data.montoLiquido = resp.Escalares.montoLiquido;
    this.data.montoaPagar = resp.Escalares.montoAPagar;
    this.data.CAE = resp.Escalares.CAE;
    this.data.tasaMensual = resp.Escalares.tasaMensual;
    this.data.tasaAnual = resp.Escalares.tasaAnual;
    this.data.impuesto = resp.Escalares.impuesto;
    this.data.gastoNotarial = resp.Escalares.gastoNotarial;
    this.data.gastosTotales = resp.Escalares.gastosTotales;
    this.data.seguroDesgravamenMensual = resp.Escalares.seguroDesgravamenMensual;
    this.data.seguroDesgravamenTotal = resp.Escalares.seguroDesgravamenAnual;
    this.data.seguroCesantiaMensual = resp.Escalares.seguroCesantiaMensual;
    this.data.seguroCesantiaTotal = resp.Escalares.seguroCesantiaAnual;
    this.data.seguroVidaMensual = resp.Escalares.seguroVidaMensual;
    this.data.seguroVidaTotal = resp.Escalares.seguroVidaAnual;
    this.data.totalSeguroMensual = resp.Escalares.totalSeguroMensual;
    this.data.totalSeguroTotal = resp.Escalares.totalSeguroAnual;
    this.data.selSegDesgravamen = this.getFlagExisteSeguro(resp.Escalares.seguroDesgravamenAnual);
    this.data.selSegCesantia = this.getFlagExisteSeguro(resp.Escalares.seguroCesantiaAnual);
    this.data.selSegVida = "N";
  }

  private cargarDatosRebajadeProductos() {
    const resp = this.ctxSrv.contrataCreditoConsumoResponse;

    // Puede que para el cliente no aplique rebaja de cupos ni cierre de productos
    if (!resp.rebajaCuposYCierreProductos) {
      return;
    }

    this.data.modificacionProductosLCA = resp.rebajaCuposYCierreProductos.productoBG;
    this.data.modificacionProductosTC = resp.rebajaCuposYCierreProductos.productoMP;
  }

  private cargarDatosDeudasaRefinar() {
    const resp = this.ctxSrv.contrataCreditoConsumoResponse;
    this.data.montoLiquidoDeudasRefinanciar = resp.deudasARefinanciar.total[0].montoLiquido;
    this.data.valorDolar = resp.deudasARefinanciar.valorDolar;

    this.data.sistemaOrigenUG = resp.deudasARefinanciar.listaUG;
    this.data.sistemaOrigenMP = resp.deudasARefinanciar.listaMP;
    this.data.sistemaOrigeLCA = resp.deudasARefinanciar.listaBG;
  }

   // Verifica si el monto es numerico (cualquier numerico) mayor a cero,
   // en este caso se asumira que viene un valor asociado a un seguro.
  private getFlagExisteSeguro(montoBackend: string = '00000000000000000'): string {
    return (montoBackend.replace(/0/g, '').trim() === '' ? 'N' : 'S');
  }
}
