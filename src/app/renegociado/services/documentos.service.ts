import { Injectable } from '@angular/core';
import { LidoService } from './lido.service';
import { GedoService } from './gedo.service';
import { LIDORequest } from '../model/LIDORequest';
import { Observable } from 'rxjs';
import { ContextoService } from './contexto.service';
import { Documento } from '../model/Documento';
import { ResponseError } from './model/response-error';
import { LIDOResponse } from '../model/LIDOResponse';
import { GEDOResponse } from '../model/GEDOResponse';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  constructor(private ctxSrv: ContextoService, private lidoSrv: LidoService, private gedoSrv: GedoService) {
  }

  /**
   * Obtiene mediante el servicio LIDO la lista de documentos a presentar en la
   * pagina de autorizacion. Junto a la lista de documentos invoca a GEDO para obtener
   * el documento en base64 del Mandato.
   * Estructura de salida:
   * {
   *   mandato: Documento;
   *   contratoMarco: Documento;
   *   contratoCompraVentaDivisas: Documento;
   *   contratoServAutomatizados: Documento;
   *   polizas: Documento;
   * }
   *
   * @param parametros datos requeridos para invocar LIDO y GEDO.
   */
  obtenerDocumentosAutorizacion(): Observable<any> {
    return Observable.create((observer) => {

      const lidoRequest: LIDORequest = {
        RutUsuario:     this.ctxSrv.rutCliente,
        canalLogico:    this.ctxSrv.canalLogico,
        usuarioAltair:  this.ctxSrv.usuarioAltair,
        idSolicitud:    this.ctxSrv.idSolicitud,
        puntoImpresion: 'RE01' // siempre es el mismo segun lo informado por el cliente
      };

      this.lidoSrv.getObtenerServicioLIDO(lidoRequest).subscribe(
        resp => this.procesarRespLIDO(resp, observer),
        err => this.procesarError(err, observer));
    });
  }

  private procesarError(err: ResponseError, observer: any) {
    observer.error(err);
    observer.complete();
  }

  // De la lista de documentos devueltos, obtiene el 'mandato' e invoca a GEDO para
  // obtener el documento en base64. Para el resto de documentos solo utiliza la metadata
  // de estos para retornarla.
  private procesarRespLIDO(resp: LIDOResponse, observer: any) {
    const docMandato = resp.documento.filter(d => d.tipoDocumental === Documento.MANDATO)[0];
    const gedoRequest = {
      RutUsuario:     this.ctxSrv.rutCliente,
      tipoDocumental: docMandato.tipoDocumental,
      piolDocumento:  docMandato.url
    };

    // Se obtiene el documento mandato
    this.gedoSrv.getObtenerServicioGEDO(gedoRequest).subscribe(
      gedoResp => this.procesarRespGEDO(gedoResp, docMandato, resp.documento, observer),
      err => this.procesarError(err, observer));
  }

  // Ejecuta GEDO para obtener el documento base64 del 'mandato'. Una vez obtenido el mandato se genera una
  // estructura con todos los documentos retornados por LIDO con su metadata (que permitira ejecutar bajo
  // demanda a GEDO y obtener sus respectivos base64) y para el caso del 'mandato' es el unico que ya va
  // en base64.
  private procesarRespGEDO(gedoResp: GEDOResponse, docMandato: Documento, docs: Documento[], observer: any) {
    // Se obtiene el documento en base64(mandato) y se actualiza en la lista de LIDO
    docMandato.data = gedoResp.documentoBase64;

    // estructura de salida con los documentos
    const documentos = {
      mandato: null,
      contratoMarco: null,
      contratoCompraVentaDivisas: null,
      contratoServAutomatizados: null,
      polizas: null
    };

    // Mandato es caso especial ya que se obtiene el base64 de una vez.
    documentos.mandato = docMandato;

    docs.forEach(d => {
      switch (d.tipoDocumental) {
        case Documento.CONTRATO_CREDITO:
          documentos.contratoMarco = d;
          break;
        case Documento.CONTRATO_CV_DIVISAS:
          documentos.contratoCompraVentaDivisas = d;
          break;
        case Documento.CONTRATO_SRV_AUTO:
          documentos.contratoServAutomatizados = d;
          break;
        case Documento.POLIZAS:
          documentos.polizas = d;
          break;
        default:
          break;
      }
    });

    observer.next(documentos);
    observer.complete();
  }
}
