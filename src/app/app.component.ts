import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContextoService } from './renegociado/services/contexto.service';
import { LoadingService } from './renegociado/shared/components/loading/loading.service';
import { Observable } from 'rxjs';
import { LoadingInfo } from './renegociado/shared/components/loading/loading.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'renegociado';

  loadingStatus: Observable<LoadingInfo>;

  constructor(private ctxService: ContextoService, private router: Router ,private route: ActivatedRoute, private loadingSrv: LoadingService) {
    this.loadingStatus = this.loadingSrv.getHttpStatus();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const rutCliente = params['rutCliente'];
      const token = params['token'];
      const codCPN = params['cpn'];

      if (rutCliente && token && codCPN) {
        this.ctxService.rutCliente = rutCliente;
        this.ctxService.token = token;
        this.ctxService.codCPN = codCPN;
        return;
      }
    }, (err) => {});
  }
}
