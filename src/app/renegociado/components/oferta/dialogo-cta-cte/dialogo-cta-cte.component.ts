import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dialogo-cta-cte',
  templateUrl: './dialogo-cta-cte.component.html',
  styleUrls: ['./dialogo-cta-cte.component.css']
})
export class DialogoCtaCteComponent implements OnInit {

  @Input() data: any;
  @Input() display = false;
  @Output() dialogoCerrado = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  cerrarDialogo() {
    this.display = false;
    this.dialogoCerrado.emit(null);
  }

}
