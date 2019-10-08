import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TarjetasUtils } from '../../../shared/components/display-tarjeta-credito/utils/TarjetasUtils';

@Component({
  selector: 'app-dialogo-tarjetas',
  templateUrl: './dialogo-tarjetas.component.html',
  styleUrls: ['./dialogo-tarjetas.component.css']
})
export class DialogoTarjetasComponent implements OnInit {

  @Input() data: any;
  @Input() display = false;
  @Output() dialogoCerrado = new EventEmitter();

  claseTarjeta: string;

  constructor() { }

  ngOnInit() {
    // el backend envia XYYYYY-Nombre de Tarjeta, por lo se saca del 2 al 5
    const codigoTarjeta = this.data.descripcionProducto.substring(2, 6);

    this.claseTarjeta = TarjetasUtils.getClassTarjeta(codigoTarjeta);
  }

  cerrarDialogo() {
    this.display = false;
    this.dialogoCerrado.emit(null);
  }

  montoUSDValido(valorUSD: string): boolean {
    if (!valorUSD || valorUSD.trim() === '') {
      return false;
    }

    const monto: Number = Number(valorUSD);

    return monto && monto > 0.00;
  }
}
