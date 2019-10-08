import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { DatosCampanaResponse } from '../model/DatosCampanaResponse';
import { DatosCampanaRequest } from '../model/DatosCampanaRequest';
import { ListaContratoCompra } from '../model/OF01Request';
import { ResponseError } from './model/response-error';
import { ValidadorTIBCODataPower } from './utils/validador-tibco-datapower';

@Injectable({
  providedIn: 'root'
})
export class DatosCampanaService {

  private readonly DATOS_CAMPANA_URI = '/renegociado/facade/datosCampCliAsociado';
  private endpoint;

  constructor(private http: HttpClient, private configSrv: ConfigService) {
    this.endpoint = `${this.configSrv.getHost()}${this.DATOS_CAMPANA_URI}`;
  }

  /**
   * Invoca al servicio backend 'datosCampCliAsociado', procesa la respuesta y retorna un Observable<DatosCampanaResponse>
   * con los datos de salida.
   * @param request instancia de DatosCampanaRequest con los datos de entrada.
   */
  getDatosCampanaResponse(request: DatosCampanaRequest): Observable<DatosCampanaResponse> {
    return Observable.create(observer => {
      const headers = { headers: new HttpHeaders({'Content-Type': 'application/json' }) };

      this.http.post(this.endpoint, request, headers).subscribe(resp => {
        const err = this.validarError(resp);
        if (err) {
          observer.error(err);
          observer.complete();
          return;
        }

        const resultset1 = resp['DATA'].Response_PR_HOB_CNA_DTS_CPN_CLI.OUTPUT.Resulsets.ResultSet1;
        const records: any[] = resultset1.Record1;

        const listaContratoTC = this.getListaContratoTarjetaCredito(records);
        const listaContratoLCA = this.getListaContratoLineaCredito(records);
        const listas: any[] = [];
        if (listaContratoTC) {
          listas.push(listaContratoTC);
        }
        if (listaContratoLCA) {
          listas.push(listaContratoLCA);
        }

        const plazoMin = this.buscarValorRecord('PlazoMinimo', records);
        const plazoMax = this.buscarValorRecord('PlazoMaximo', records);

        const response: DatosCampanaResponse = {
          tipoGestion: this.buscarValorRecord('TipoGestion', records),
          cuentaCorrienteActiva: this.buscarValorRecord('CtaCteAbono', records),
          indAbonoRealizado: this.buscarValorRecord('IndAbonoRealizado', records),
          ListaContratos: (listas.length === 0 ? [this.getListaContratoVacia()] : listas),
          Tasa: this.buscarValorRecord('Tasa', records),
          plazoMinimaNuevoConsumo: '2'.concat(plazoMin),
          plazoMaximoNuevoConsumo: '2'.concat(plazoMax),
          productoDestino: this.buscarValorRecord('ProductoDestino', records),
          subproductoDestino: this.buscarValorRecord('SubProductoDestino', records)
        };

        observer.next(response);
        observer.complete();
      }, (err: ResponseError) => {
        observer.error(err);
        observer.complete();
      });
    });
  }

  private validarError(resp: any): ResponseError|null {
    const validador = new ValidadorTIBCODataPower({
      codigo: resp['DATA'].Response_PR_HOB_CNA_DTS_CPN_CLI.INFO.Codigo,
      descripcion: resp['DATA'].Response_PR_HOB_CNA_DTS_CPN_CLI.INFO.Descripcion,
      respuestaOK: '00'
    });

    if (!validador.esValida(resp)) {
      return validador.getError();
    }

    // Si el usuario no tiene datos, el servicio retorna null en resultset1
    const resultset1 = resp['DATA'].Response_PR_HOB_CNA_DTS_CPN_CLI.OUTPUT.Resulsets.ResultSet1;
    if (!resultset1) {
      return new ResponseError(ResponseError.COD_ERR_INTERNO, 'Cliente no tiene datos de campaña');
    }

    return null;
  }

  // Retorna el valor de 'vlr_det' asociado a 'gls_det' igual a la glosa pasada como parametro.
  private buscarValorRecord(glosa: string, records: any[]): string {
    const record = records.filter(r => r.gls_det === glosa);
    return (record && record.length > 0 && record[0].vlr_det !== '*' ? record[0].vlr_det : '');
  }

  private getListaContratoTarjetaCredito(records: any[]): ListaContratoCompra {
    const numeroContratoTC = this.buscarValorRecord('numeroContratoTC', records);

    if (!this.existeListaContrato(numeroContratoTC)) {
      return null;
    }

    return {
      NumeroContrato: numeroContratoTC,
      SistemaOrigen: 'MP',
      ProductoySubproducto: '',
      CupoL1: this.buscarValorRecord('CupoL1', records),
      CupoL2: this.buscarValorRecord('CupoL2', records),
      CupoUSD: this.buscarValorRecord('CupoUSD', records),
      indPago: '',
      indBloqueo: this.buscarValorRecord('indBloqueoTC', records),
      indCierre: this.buscarValorRecord('indDetalleCierreTC', records),
      indCambioCupoL1: this.buscarValorRecord('indCambioCupoTCL1', records),
      indCambioCupoL2: this.buscarValorRecord('indCambioCupoTCL2', records),
      indCambioCupoUSD: this.buscarValorRecord('indCambioCupoTCUSD', records)
    };
  }

  private getListaContratoLineaCredito(records: any[]): ListaContratoCompra {
    const numeroContratoLCA = this.buscarValorRecord('numeroContratoLCA', records);

    if (!this.existeListaContrato(numeroContratoLCA)) {
      return null;
    }

    return {
      NumeroContrato: numeroContratoLCA,
      SistemaOrigen: 'BG',
      ProductoySubproducto: '',
      CupoL1: this.buscarValorRecord('CupoLCA', records),
      CupoL2: '',
      CupoUSD: '',
      indPago: '',
      indBloqueo: this.buscarValorRecord('indBloqueoLCA', records),
      indCierre: this.buscarValorRecord('indDetalleCierreLCA', records),
      indCambioCupoL1: this.buscarValorRecord('indCambioCupoLCA', records),
      indCambioCupoL2: '',
      indCambioCupoUSD: ''
    };
  }

  /*
   * Verifica que el nroContrato sea valido por lo que indica que hay informacion
   * asociada al contrato.
   */
  private existeListaContrato(nroContrato: string): boolean {
    return nroContrato && nroContrato.trim() !== '' && nroContrato.trim() !== '*';
  }

  private getListaContratoVacia(): ListaContratoCompra {
    return {
      NumeroContrato: '',
      SistemaOrigen: '',
      ProductoySubproducto: '',
      CupoL1: '',
      CupoL2: '',
      CupoUSD: '',
      indPago: '',
      indBloqueo: '',
      indCierre: '',
      indCambioCupoL1: '',
      indCambioCupoL2: '',
      indCambioCupoUSD: ''
    };
  }
}
