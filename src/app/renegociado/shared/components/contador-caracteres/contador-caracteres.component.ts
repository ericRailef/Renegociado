import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-contador-caracteres',
  templateUrl: './contador-caracteres.component.html',
  styleUrls: ['./contador-caracteres.component.css']
})
export class ContadorCaracteresComponent implements OnInit, OnChanges {

  @Input() maximo = 100;
  @Input() texto = '';
  actual = 0;

  constructor() { }

  ngOnInit() {
    // en caso que se reciba undefined
    if (!this.texto) {
      this.actual = 0;
      return;
    }
    this.actual = this.texto.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.texto || !changes.texto.currentValue) {
      this.actual = 0;
      return;
    }

    const texto = changes.texto.currentValue;
    this.actual = texto.length;
  }
}
