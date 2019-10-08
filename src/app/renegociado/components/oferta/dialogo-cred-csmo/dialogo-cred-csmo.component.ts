import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialogo-cred-csmo',
  templateUrl: './dialogo-cred-csmo.component.html',
  styleUrls: ['./dialogo-cred-csmo.component.css']
})
export class DialogoCredCsmoComponent implements OnInit {

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
