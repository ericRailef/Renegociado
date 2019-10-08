import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { ErrorService } from '../../services/error.service';
import { MensajesErrores } from '../../shared/utilities/mensaje-errores';

@Component({
  selector: 'app-pagina-error',
  templateUrl: './pagina-error.component.html',
  styleUrls: ['./pagina-error.component.css']
})
export class PaginaErrorComponent implements OnInit {

  titulo: string;
  detalle: string;

  detalleDefault = MensajesErrores.ERROR_GENERICO;

  constructor(private loadingSrv: LoadingService, private errorSrv: ErrorService) {
    errorSrv.detalleError.subscribe(d => {
      this.titulo = d.titulo;
      this.detalle = d.detalle;
    });
  }

  ngOnInit() {
    // Cuando carga la pagina de error se quita el 'loading'
    this.loadingSrv.setHttpStatus(false);
  }

}
