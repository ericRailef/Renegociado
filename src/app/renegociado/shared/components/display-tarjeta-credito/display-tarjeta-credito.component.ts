import { Component, OnInit, Input } from '@angular/core';
import { MaskCreditcardPipe } from '../../pipes/mask-creditcard.pipe';
import { TarjetasUtils } from './utils/TarjetasUtils';

@Component({
  selector: 'app-display-tarjeta-credito',
  templateUrl: './display-tarjeta-credito.component.html',
  styleUrls: ['./display-tarjeta-credito.component.css']
})
export class DisplayTarjetaCreditoComponent implements OnInit {

  @Input() descripcion: string;
  @Input() numero: string;
  @Input() codigo: string;

  clase: string;

  constructor() {
  }

  ngOnInit() {
    this.clase = TarjetasUtils.getClassTarjeta(this.codigo);
  }

}
