import { Injectable } from '@angular/core';
import { OF02Response } from '../model/OF02Response';
import { Contexto } from '../model/contexto';
import { SICCResponse } from '../model/SICCResponse';
import { environment } from 'src/environments/environment';
import { OF00Response } from '../model/OF00Response';
import { ContrataCreditoConsumoResponse } from '../model/ContrataCreditoConsumoResponse';

@Injectable({
  providedIn: 'root'
})
export class ContextoService {

  private _solicitudCreada = false;

  // Flag para retoma
  private _esRetoma = false;

  // Informacion entregada por la aplicacion que aloja Renegociado
  private _canalLogico = null;
  private _canalFisico = '003';
  private _usuarioAltair = null;
  private _idOrigen = null;
  private _entidad = null;
  private _rutCliente = '';
  private _centro = '0401';
  private _tipoGestion = 'A';
  private _token = '';
  private _codCPN = '';
  private _detalleOF02Cargado = false;

  private _idSolicitud: string;
  private _selSegDesgravamen: string;
  private _selSegCesantia: string;
  private _indContratoMarcoFirmado: string;

  // Respuestas de servicios
  private _of02Response: OF02Response;
  private _siccResponse: SICCResponse;
  private _of00Response: OF00Response;
  private _contrataCrdCsmoResponse: ContrataCreditoConsumoResponse;

  // Contexto con la informacion ingresada por el usuario
  private _ctx: Contexto;

  constructor() {
    this.initContexto();
  }

  private initContexto() {
    this._ctx = {
      iniciado: false,
      oferta: {
        plazoCredito: '',
        primerVencimiento: null,
        seguroCesantia: false,
        seguroDesgravamen: false,
        seguroVida: false
      },
      confirmacion: {
        autorizacion: false,
        participaSociedades: undefined,
        esAvalFiador: undefined,
        tienePreExistencias: undefined,
        listadoAvaloFiador: [],
        listadoSociedades: []
      },
      autorizacion: {
        documentos: {
          mandato: null,
          contratoServAutomatizados: null,
          contratoCompraVentaDivisas: null,
          contratoMarco: null,
          polizas: null
        }
      }
    };
  }

  get esRetoma(): boolean { return this._esRetoma; }
  set esRetoma(esRetoma: boolean) { this._esRetoma = esRetoma; }

  get canalLogico(): string { return this._canalLogico; }
  set canalLogico(valor: string) { this._canalLogico = valor; }

  get canalFisico(): string { return this._canalFisico; }
  set canalFisico(valor: string) { this._canalFisico = valor; }

  get usuarioAltair(): string { return this._usuarioAltair; }
  set usuarioAltair(valor: string) { this._usuarioAltair = valor; }

  get idOrigen(): string { return this._idOrigen; }
  set idOrigen(valor: string) { this._idOrigen = valor; }

  get entidad(): string { return this._entidad; }
  set entidad(valor: string) { this._entidad = valor; }

  get rutCliente(): string { return this._rutCliente; }
  set rutCliente(valor: string) { this._rutCliente = valor; }

  get centro(): string { return this._centro; }
  set centro(valor: string) { this._centro = valor; }

  get tipoGestion(): string { return this._tipoGestion; }
  set tipoGestion(valor: string) { this._tipoGestion = valor; }

  get of02Response(): OF02Response { return this._of02Response; }
  set of02Response(of02Response: OF02Response) { this._of02Response = of02Response; }

  get siccResponse(): SICCResponse { return this._siccResponse; }
  set siccResponse(siccResponse: SICCResponse) { this._siccResponse = siccResponse; }

  get contrataCreditoConsumoResponse(): ContrataCreditoConsumoResponse { return this._contrataCrdCsmoResponse; }
  set contrataCreditoConsumoResponse(contrataCrdCsmoResponse: ContrataCreditoConsumoResponse) { this._contrataCrdCsmoResponse = contrataCrdCsmoResponse; }

  get of00Response(): OF00Response { return this._of00Response; }
  set of00Response(of00Response: OF00Response) { this._of00Response = of00Response; }

  get token(): string { return this._token; }
  set token(value: string) { this._token = value; }

  get codCPN(): string { return this._codCPN; }
  set codCPN(value: string) { this._codCPN = value; }

  get detalleOF02Cargado(): boolean { return this._detalleOF02Cargado; }
  set detalleOF02Cargado(value: boolean) { this._detalleOF02Cargado = value; }

  // True si el cliente paso el punto en donde se crea solicitud de credito. False caso contrario
  get solicitudCreada(): boolean { return this._solicitudCreada; }
  set solicitudCreada(value: boolean) { this._solicitudCreada = value; }

  get selSegDesgravamen(): string { return this._selSegDesgravamen; }
  set selSegDesgravamen(value: string) { this._selSegDesgravamen = value; }

  get selSegCesantia(): string { return this._selSegCesantia; }
  set selSegCesantia(value: string) { this._selSegCesantia = value; }

  get idSolicitud(): string { return this._idSolicitud; }
  set idSolicitud(value: string) { this._idSolicitud = value; }

  get indContratoMarcoFirmado(): string { return this._indContratoMarcoFirmado; }
  set indContratoMarcoFirmado(value: string) { this._indContratoMarcoFirmado = value; }

  // Retorna la instancia del Contexto con la informacion ingresada por el usuario en la app.
  get ctx(): Contexto { return this._ctx; }

  /**
   * Realiza la limpieza de la informacion guardada en contexto.
   * La informacion considerada en el reset es aquella ingresada por el usuario
   * en el sitio, como tambien las respuestas recibidas por los diferentes
   * servicios backend utilizados.
   */
  reset() {
    this._of02Response = undefined;
    this._siccResponse = undefined;
    this._contrataCrdCsmoResponse = undefined;
    this._solicitudCreada = false;
    this._detalleOF02Cargado = false;
    this._ctx = null;
    this.initContexto();

    if (!environment.production) {
      console.log('Contexto: ', this);
    }
  }
}
