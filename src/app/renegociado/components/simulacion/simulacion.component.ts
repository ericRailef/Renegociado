import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContextoService } from '../../services/contexto.service';
import { DetalleSimulacionData } from '../../shared/components/detalle-simulacion/model/detalleSimulacionData';


@Component({
  selector: 'app-simulacion',
  templateUrl: './simulacion.component.html',
  styleUrls: ['./simulacion.component.css']
})
export class SimulacionComponent implements OnInit, OnDestroy {

  data: DetalleSimulacionData = {};

  constructor(private ctxSrv: ContextoService) {
  }

  ngOnInit() {
    this.cargarDatosResumenCredito();
    this.cargarDatosRebajadeProductos();
    this.cargarDatosDeudasaRefinar();
  }

  ngOnDestroy() {
    this.ctxSrv.esRetoma = false;
  }

  private  cargarDatosResumenCredito() {
    const fechaBackend = this.ctxSrv.siccResponse.ResumenDelCredito.fechaPrimerVencimiento.split('/');

    this.data.fechaPrimerVencimiento = new Date(Number(fechaBackend[2]), Number(fechaBackend[1]) - 1, Number(fechaBackend[0]));
    this.data.valorCuota = this.ctxSrv.siccResponse.ResumenDelCredito.valorCuota;
    this.data.totalCuotaMensuales = this.ctxSrv.siccResponse.ResumenDelCredito.cantidadCuotas;
    this.data.montoBruto = this.ctxSrv.siccResponse.ResumenDelCredito.montoBruto;
    this.data.montoLiquido = this.ctxSrv.siccResponse.ResumenDelCredito.montoLiquido;
    this.data.montoaPagar = this.ctxSrv.siccResponse.ResumenDelCredito.montoaPagar;
    this.data.CAE = this.ctxSrv.siccResponse.ResumenDelCredito.CAE;
    this.data.tasaMensual = this.ctxSrv.siccResponse.ResumenDelCredito.tasaMensual;
    this.data.tasaAnual = this.ctxSrv.siccResponse.ResumenDelCredito.tasaAnual;
    this.data.impuesto = this.ctxSrv.siccResponse.ResumenDelCredito.impuesto;
    this.data.gastoNotarial = this.ctxSrv.siccResponse.ResumenDelCredito.gastoNotarial;
    this.data.gastosTotales = this.ctxSrv.siccResponse.ResumenDelCredito.gastosTotales;
    this.data.seguroDesgravamenMensual = this.ctxSrv.siccResponse.ResumenDelCredito.seguroDesgravamenMensual;
    this.data.seguroDesgravamenTotal = this.ctxSrv.siccResponse.ResumenDelCredito.seguroDesgravamenTotal;
    this.data.seguroCesantiaMensual = this.ctxSrv.siccResponse.ResumenDelCredito.seguroCesantiaMensual;
    this.data.seguroCesantiaTotal = this.ctxSrv.siccResponse.ResumenDelCredito.seguroCesantiaTotal;
    this.data.seguroVidaMensual = this.ctxSrv.siccResponse.ResumenDelCredito.seguroVidaMensual;
    this.data.seguroVidaTotal = this.ctxSrv.siccResponse.ResumenDelCredito.seguroVidaTotal;
    this.data.totalSeguroMensual = this.ctxSrv.siccResponse.ResumenDelCredito.totalSeguroMensual;
    this.data.totalSeguroTotal = this.ctxSrv.siccResponse.ResumenDelCredito.totalSeguroTotal;
    this.data.selSegDesgravamen = this.ctxSrv.siccResponse.ResumenDelCredito.selSegDesgravamen;
    this.data.selSegCesantia = this.ctxSrv.siccResponse.ResumenDelCredito.selSegCesantia;
    this.data.selSegVida = this.ctxSrv.siccResponse.ResumenDelCredito.selSegVida;
    this.data.montoLiquidoDeudasRefinanciar = this.ctxSrv.siccResponse.totalDeLaDeuda;
  }

  private cargarDatosRebajadeProductos() {
    // Para un cliente puede no aplicar rebaja de cupos no cierre de productos
    if (!this.ctxSrv.siccResponse.RebajadeCuposyCierredeProductos) {
      return;
    }

    this.data.modificacionProductosTC = this.ctxSrv.siccResponse.RebajadeCuposyCierredeProductos.modificacionProductosTC;
    this.data.modificacionProductosLCA = this.ctxSrv.siccResponse.RebajadeCuposyCierredeProductos.modificacionProductosLCA;
  }

   private cargarDatosDeudasaRefinar() {
    this.data.valorDolar = this.ctxSrv.siccResponse.DeudasaRefinar.valorDolar;
    this.data.sistemaOrigenUG = this.ctxSrv.siccResponse.DeudasaRefinar.prestamosRefinanciar;
    this.data.sistemaOrigenMP = this.ctxSrv.siccResponse.DeudasaRefinar.tarjetasRefinanciar;
    this.data.sistemaOrigeLCA = this.ctxSrv.siccResponse.DeudasaRefinar.LCARefinanciar;


   }
}
