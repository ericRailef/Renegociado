import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface DetalleError {
  titulo?: string;
  detalle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  // Objetos utilizado para actualizar informacion de error en pagina de error.
  private detalleErrorSource = new BehaviorSubject<DetalleError>({});
  detalleError = this.detalleErrorSource.asObservable();

  // Objetos utilizados para actualizar informacion en la pagina home.
  private detalleHomeSource = new BehaviorSubject<DetalleError>({});
  detalleHome = this.detalleHomeSource.asObservable();

  constructor(private router: Router) { }

  irPaginaError() {
    this.router.navigateByUrl('/error');
  }

  irPaginaErrorConDetalle(detalle: DetalleError) {
    this.irPaginaError();
    this.detalleErrorSource.next(detalle);
  }

  irPaginaHome() {
    this.router.navigateByUrl('/home');
  }

  irPaginaHomeConDetalle(detalle: DetalleError) {
    this.irPaginaHome();
    this.detalleHomeSource.next(detalle);
  }
}
