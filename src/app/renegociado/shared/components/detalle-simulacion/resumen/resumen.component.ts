import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {

  @Input() data;

  verSeguroCesantia = false;
  verSeguroDesgravamen = false;

  constructor() { }

  ngOnInit() {
    this.verSeguroCesantia = this.toBoolean(this.data.selSegCesantia);
    this.verSeguroDesgravamen = this.toBoolean(this.data.selSegDesgravamen);
  }

  /*
   * Convierte el flag 'S' o 'N' en true o false respectivamente.
   */
  private toBoolean(value: string = 'N'): boolean {
    return (value && value.trim().toUpperCase() === 'S');
  }

  toNumber(value: string): Number {
    return (value ? Number(value) : 0);
  }
}
