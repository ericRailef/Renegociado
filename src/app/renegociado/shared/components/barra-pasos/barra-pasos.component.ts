import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-barra-pasos',
  templateUrl: './barra-pasos.component.html',
  styleUrls: ['./barra-pasos.component.css']
})
export class BarraPasosComponent implements OnInit {

  @Input() pasos;
  @Input() actual: {
    paso: number;
    nombre: string;
  };

  _auxPasos: string[] = [];

  constructor() {}

  ngOnInit() {
    for (let i = 0; i < this.pasos; i++) {
      const clazz = (i < this.actual.paso ? 'active' : '');
      this._auxPasos.push(clazz);
    }
  }

}
