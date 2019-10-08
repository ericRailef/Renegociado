import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.css']
})
export class NotificacionComponent implements OnInit {

  @Input() mensaje: string;
  @Input() customClass = '';
  @Input() tipo = 'info';

  tipos = {
    info: {
      color: 'cian'
    },
    warn: {
      color: 'yellow'
    }
  };

  constructor() { }

  ngOnInit() {
  }

}
