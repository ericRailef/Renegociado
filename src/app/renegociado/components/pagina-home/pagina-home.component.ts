import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../shared/components/loading/loading.service';

@Component({
  selector: 'app-pagina-home',
  templateUrl: './pagina-home.component.html',
  styleUrls: ['./pagina-home.component.css']
})
export class PaginaHomeComponent implements OnInit {

  constructor(private loadingSrv: LoadingService) { }

  ngOnInit() {
    // Termina la ejecucion del loading en caso que haya sido arrancado previamente.
    this.loadingSrv.setHttpStatus(false);
  }

}
