import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

export const LABELS_ALERTA_DEFAULT1 = {
  titulo: 'Lo sentimos, no fue posible realizar tu transacción.',
  detalle: 'Si tienes dudas llámanos al 600 320 3000'
};

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.css']
})
/**
 * Componente que permite desplegar alertas de tipo error y de confirmacion.
 * Dependiendo de la configuracion que se aplique al componente html se pintaran
 * uno o dos botones de acción con sus respectivos labels.
 * Ejemplo de uso:
 *
 * <app-alerta [display]="verAlerta" [tipoAlerta]="'error'"
 *     [titulo]="'Lo sentimos, no fue posible realizar la transacción'"
 *     [detalle]="'Por favor comunícate al 600 320 3000.'"
 *     [nombreAccion1]="'Aceptar'"
 *     (clickAccion1)="cerrarDialogo('alerta')">
 * </app-alerta>
 *
 *
 */
export class AlertaComponent implements OnInit {

  readonly tipoError = 'error';
  readonly tipoConfirmacion = 'conf';
  readonly tipoWarning = 'warn';

  @Input() display = false;

  icono: string;
  modalIcon: string;

  @Input() tipoAlerta: string;
  @Input() titulo: string;
  @Input() detalle: string;
  @Input() detalle2: string;
  @Input() nombreAccion1: string;
  @Input() nombreAccion2: string;

  @Output() clickAccion1: EventEmitter<any> = new EventEmitter();
  @Output() clickAccion2: EventEmitter<any> = new EventEmitter();
  @Output() accionCerrar: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    if (this.isError()) {
      this.modalIcon = 'modal-icon-alert';
      this.icono = 'icon-input-error';
    } else if (this.isConfirmacion()) {
      this.modalIcon = 'modal-icon-info';
      this.icono = 'icon-information';
    } else if (this.isWarning) {
      this.modalIcon = 'modal-icon-warning';
      this.icono = 'priority_high';
    } else {
      throw new Error('Tipo de Alerta no soportado');
    }
  }

  protected emitirAccion1() {
    this.clickAccion1.emit();
  }

  protected  emitirAccion2() {
    this.clickAccion2.emit();
  }

  protected emitirAccionCerrar() {
    this.close();
    this.accionCerrar.emit();
  }

  // hayAccion1 verifica que el cliente haya configurado un callback.
  // En caso que se haya configurado, el componente muestra el primer boton.
  protected hayAccion1() {
    return this.clickAccion1.observers.length > 0;
  }

  // hayAccion2 verifica que el cliente haya configurado un callback.
  // En caso que se haya configurado, el componente muestra un segundo boton.
  protected hayAccion2() {
    return this.clickAccion2.observers.length > 0;
  }

  // haAccionCerrar verifica que el cliente haya configurado una accion de cerrar dialogo,
  // en caso que se haya configurado el componente muestra una x para cerrar el dialogo
  // en la parte superior derecha.
  protected hayAccionCerrar() {
    return this.accionCerrar.observers.length > 0;
  }

  protected isConfirmacion() {
    return this.tipoAlerta === this.tipoConfirmacion;
  }

  protected isError() {
    return this.tipoAlerta === this.tipoError;
  }

  isWarning() {
    return this.tipoAlerta === this.tipoWarning;
  }

  public open() {
    this.display = true;
  }

  public close() {
    this.display = false;
  }
}
