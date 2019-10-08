import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContextoService } from './contexto.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  config: any;

  constructor(private http: HttpClient, private ctxSrv: ContextoService) { }

  init(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get('assets/server-config.json', {}).subscribe(resp => {
        this.config = resp;
        this.ctxSrv.canalLogico = this.config['server']['canalLogico'];
        this.ctxSrv.usuarioAltair = this.config['server']['usuarioAltair'];
        this.ctxSrv.idOrigen = this.config['server']['idOrigen'];
        this.ctxSrv.entidad = this.config['server']['entidad'];

        resolve();
      }, err => {
        console.log(err);
        reject();
      });
    });
  }

  getServerConfig(key: string): string {
    return this.config['server'][key];
  }

   getDataConfig(key: string) {
    return this.config['data'][key];
  }

  getHost() {
    return this.getServerConfig('host');
  }

  getContenidoExterno() {
    return this.getServerConfig('contenidoExterno');
  }

}
