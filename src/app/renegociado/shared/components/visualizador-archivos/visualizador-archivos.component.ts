import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContenidoExternoService } from '../../../services/contenido-externo.service';
import { Documento } from '../../../model/Documento';
import { GedoService } from '../../../services/gedo.service';
import { ContextoService } from '../../../services/contexto.service';
import { SafePipe } from '../../../components/autorizacion/autorizacion.component';
import { LoadingService } from '../loading/loading.service';

/**
 * Componente que al ser presionado con el mouse permite desplegar un documento PDF o informacion HTML
 * dentro de un dialogo.
 *
 * Forma de uso:
 *
 * PDF: <app-visualizador-archivos [descripcion]="''" [file]="'/assets/pdf/archivo.pdf'" ></app-visualizador-archivos>
 *
 * HTML:
 * <app-visualizador-archivos [descripcion]="''" [tipo]="'html'" [tituloModal]="''">
 *   <div class="reader_context">
 *      Texto ....
 *   </div>
 * </app-visualizador-archivos>
 */
@Component({
  selector: 'app-visualizador-archivos',
  templateUrl: './visualizador-archivos.component.html',
  styleUrls: ['./visualizador-archivos.component.css']
})
export class VisualizadorArchivosComponent implements OnInit {

  // 'pdf' o 'html' corresponden a los tipos de formatos que pueden ser desplegados
  @Input() tipo = 'pdf';

  // Texto que va como titulo en el cuadro de dialogo
  @Input() descripcion: string;

  // URL del documento que se desea mostrar
  @Input() file: string;

  // Tipo de documento que se desea ir a buscar mediante GEDO. Si se informa este atributo se ignora file.
  @Input() documento: Documento;
  @Output() documentoError = new EventEmitter();

  // Modo en que se quiere mostrar el documento
  @Input() verModal = false;

  // Informacion del Modal
  @Input() tituloModal: string;

  // Callback que se ejecuta cuando el usuario presiona el boton aceptar
  @Output() clickAceptar = new EventEmitter();

  bytesPDF = undefined;
  displayModal = false;
  innerHtml: string = undefined;

  constructor(private ctxSrv: ContextoService, private contenidoExtSrv: ContenidoExternoService,
    private gedoSrv: GedoService, private safePipe: SafePipe, private loadingSrv: LoadingService) {
  }

  ngOnInit() {
  }

  onClick() {
    // Es un documento en base64 a obtener desde el backend
    if (this.documento) {
      this.obtenerDocumentoBase64();
    } else {
      this.abrirDocumento();
    }
  }

  private obtenerDocumentoBase64() {
    const gedoRequest = {
      RutUsuario:     this.ctxSrv.rutCliente,
      tipoDocumental: this.documento.tipoDocumental,
      piolDocumento:  this.documento.url
    };

    // Se levanta loading
    this.loadingSrv.setHttpStatus(true);

    this.gedoSrv.getObtenerServicioGEDO(gedoRequest).subscribe(gedoResp => {
      // Se cierra loading
      this.loadingSrv.setHttpStatus(false);

      this.file = gedoResp.documentoBase64;
      this.abrirBase64();
    }, err => {
      // Se cierra loading
      this.loadingSrv.setHttpStatus(false);

      this.documentoError.emit(err);
    });
  }

  /*
   * Permite mostrar un contenido HTML o un PDF (mediante una URL).
   * En caso se ser una documento HTML siempre abrira modal mientras que si es un PDF se podra
   * abrir en modal o en una nueva ventana del browser.
   */
  private abrirDocumento() {
    if (!this.tipo || (this.tipo === 'pdf' && !this.file)) {
      return;
    }

    switch (this.tipo) {
      case 'pdf':
        this.abrirPDF();
        break;
      case 'html':
        this.verModal = true; // por defecto html siempre es modal
        this.abrirHtml();
        break;
    }
  }

  emitirAceptar() {
    this.cerrarDialogo();
    this.clickAceptar.emit(undefined);
  }

  cerrarDialogo() {
    this.displayModal = false;
  }

  /*
   * Abre un archivo PDF desde una url en un modal o en una nueva ventana del browser.
   */
  private abrirPDF() {
    if (this.verModal) {
      this.bytesPDF = this.file;
      this.displayModal = true;
    } else {
      const width = window.innerWidth * 0.80;
      const height = width * window.innerHeight / window.innerWidth;

      window.open(this.file, this.tituloModal, `width=${width},height=${height}`);
    }
  }

  private abrirBase64() {
    const blob = this.base64ToBlob(this.file);

    // Si es IE... caso particular
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, this.tituloModal);
    } else {
      this.openWindow(blob);
    }
  }

  private download(blob: Blob) {
    const data = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = data;
    link.download = this.tituloModal;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(data);
    }, 100);
  }

  private openWindow(blob: Blob) {
    const width = window.innerWidth * 0.80;
    const height = width * window.innerHeight / window.innerWidth;

    window.open(window.URL.createObjectURL(blob), '_blank', `width=${width},height=${height}`);
  }

  private base64ToBlob(data: string): Blob {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: 'application/pdf' });
  }

  private abrirHtml() {
    // Se desea visualizar html alojado como recurso web
    if (this.file) {
      this.contenidoExtSrv.getHtml(this.file)
        .subscribe((html) => {
          this.innerHtml = html;
          this.displayModal = true;
        }, (err) => {});
    } else {
      this.displayModal = true;
    }
  }

}
