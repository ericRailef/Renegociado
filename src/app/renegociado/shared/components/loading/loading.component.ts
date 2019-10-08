import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoadingInfo {
  status: boolean;
  titulo?: string;
  detalle?: string;
}

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  @Input() cambioEstado: Observable<LoadingInfo>;
  @Input() embebido: false;

  titulo: string;
  detalle: string;

  loading = true;

  constructor() {
    this.titulo = '';
    this.detalle = '';
  }

  ngOnInit() {
    this.cambioEstado.subscribe((info: LoadingInfo) => {
      this.loading = info.status;
      this.titulo = '';
      this.detalle = '';

      if (info.titulo) { this.titulo = info.titulo; }
      if (info.detalle) { this.detalle = info.detalle; }
    });
  }
}
