import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contenedor-acordeon',
  templateUrl: './contenedor-acordeon.component.html',
  styleUrls: ['./contenedor-acordeon.component.css']
})
export class ContenedorAcordeonComponent implements OnInit, OnDestroy {

  private readonly MAINCLASS_DATABLE_OPEN = 'box datatable mb15 open';
  private readonly MAINCLASS_DATABLE_CLOSE = 'box datatable mb15';

  private readonly MAINCLASS_COLLAPSE_OPEN = 'box collapse mb15 open no-gutter';
  private readonly MAINCLASS_COLLAPSE_CLOSE = 'box collapse mb15 no-gutter';


  private readonly CLOSE_PADDING_DATATABLE = '50px';
  private readonly CLOSE_PADDING_COLLAPSE = '0px';
  private suscripcionEvento: any;

  @ViewChild('content') elementView: ElementRef;
  @Input() collapse = false;
  @Input() titulo: string;

  @Input() headerExtraClass: string;

  // Permite asociar un evento que gatille la apertura del acordeon
  @Input() eventoIniciar: Observable<boolean>;

  @Input() subtitulo: any;
  @Input() valor: any;

  @Output() eventoAbiertoCerrado: EventEmitter<any> = new EventEmitter();

  mainClass = this.MAINCLASS_DATABLE_CLOSE;
  paddingSize = this.CLOSE_PADDING_DATATABLE;
  stateOpen = false;

  constructor() {
  }

  ngOnInit() {
    this.close(false);

    // Se suscribe a evento de apertura informado. Quien utiliza acordeon puede
    // gatillar un evento para abrir el acordeon.
    if (this.eventoIniciar) {
      this.suscripcionEvento = this.eventoIniciar.subscribe(abrir => {
        if (abrir) {
          this.open();
        } else {
          // Se invoca el cerrar acordeon desde el componente cliente por lo que no se ejecuta evento.
          this.close(false);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.suscripcionEvento) {
      this.suscripcionEvento.unsubscribe();
    }
  }

  private open() {
    this.paddingSize = this.elementView.nativeElement.offsetHeight + 'px';
    this.changeClass(true);
    this.stateOpen = true;

    // se emite evento
    this.eventoAbiertoCerrado.emit(this.stateOpen);
  }

  private close(emitirEvento = true) {
    this.paddingSize = this.collapse ? this.CLOSE_PADDING_COLLAPSE : this.CLOSE_PADDING_DATATABLE;
    this.changeClass(false);
    this.stateOpen = false;

    if (emitirEvento) {
      // se emite evento
      this.eventoAbiertoCerrado.emit(this.stateOpen);
    }
  }

  private changeClass(open: boolean) {
    if (open) {
      this.mainClass = this.collapse ? this.MAINCLASS_COLLAPSE_OPEN : this.MAINCLASS_DATABLE_OPEN;
    } else {
      this.mainClass = this.collapse ? this.MAINCLASS_COLLAPSE_CLOSE : this.MAINCLASS_DATABLE_CLOSE;
    }
  }

  onClickHeader() {
    if (this.stateOpen) {
      this.close();
    } else {
      this.open();
    }
  }

}
