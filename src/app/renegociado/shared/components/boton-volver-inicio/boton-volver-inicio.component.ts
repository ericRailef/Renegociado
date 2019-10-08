import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ContextoService } from '../../../services/contexto.service';
import { Of00Service } from '../../../services/of00.service';
import { OF00Request } from '../../../model/OF00Request';
import { Router } from '@angular/router';
import { LoadingService } from '../loading/loading.service';
import { ResponseError } from '../../../services/model/response-error';

@Component({
  selector: 'app-boton-volver-inicio',
  templateUrl: './boton-volver-inicio.component.html',
  styleUrls: ['./boton-volver-inicio.component.css']
})
export class BotonVolverInicioComponent implements OnInit {

  @Output() whenError: EventEmitter<ResponseError> = new EventEmitter();

  private readonly requestOF00: OF00Request = {
    RutUsuario: this.ctxSrv.rutCliente,
    volverAlInicio: 'S',
    canalLogico: this.ctxSrv.canalLogico,
    usuarioAltair: this.ctxSrv.usuarioAltair,
    entidad: this.ctxSrv.entidad,
    idOrigen: this.ctxSrv.idOrigen,
    idSolicitud: this.ctxSrv.idSolicitud
  };

  constructor(private ctxSrv: ContextoService, private of00Srv: Of00Service, private router: Router,
    private loadingSrv: LoadingService) { }

  ngOnInit() {
  }

  clickEvent(): void {
    this.loadingSrv.setHttpStatus(true);

    this.of00Srv.getOF00Response(this.requestOF00).subscribe(resp => {
      this.loadingSrv.setHttpStatus(false);

      this.ctxSrv.of00Response = resp;
      this.ctxSrv.reset();
      this.router.navigateByUrl('/oferta');
    }, (err: ResponseError) => {
      this.loadingSrv.setHttpStatus(false);
      this.whenError.emit(err);
    });
  }

}
