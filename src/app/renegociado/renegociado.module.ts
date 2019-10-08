
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { APP_ROUTING } from '../app.routes';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { OfertaComponent } from './components/oferta/oferta.component';
import { MandatoComponent } from './components/mandato/mandato.component';
import { ConfirmacionComponent } from './components/confirmacion/confirmacion.component';
import { SimulacionComponent } from './components/simulacion/simulacion.component';
import { ContratadoComponent } from './components/contratado/contratado.component';
import { DialogoCredCsmoComponent } from './components/oferta/dialogo-cred-csmo/dialogo-cred-csmo.component';
import { DialogoCtaCteComponent } from './components/oferta/dialogo-cta-cte/dialogo-cta-cte.component';
import { DialogoTarjetasComponent } from './components/oferta/dialogo-tarjetas/dialogo-tarjetas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatFormFieldModule, MatIconModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { ConfigService } from './services/config.service';
import { TokenInterceptor } from './seguridad/token.interceptor';
import { CrudSociedadesComponent } from './components/confirmacion/crud-sociedades/crud-sociedades.component';
import { ContenedorAcordeonComponent } from './shared/components/contenedor-acordeon/contenedor-acordeon.component';
import { CondGeneralesComponent } from './shared/components/cond-generales/cond-generales.component';
import { NotificacionComponent } from './shared/components/notificacion/notificacion.component';
import { FormatCurrencyPipe } from './shared/pipes/format-currency.pipe';
import { MaskCreditcardPipe } from './shared/pipes/mask-creditcard.pipe';
import { AlertaComponent } from './shared/components/alerta/alerta.component';
import { DisplayTarjetaCreditoComponent } from './shared/components/display-tarjeta-credito/display-tarjeta-credito.component';
import { VisualizadorArchivosComponent } from './shared/components/visualizador-archivos/visualizador-archivos.component';
import { FormatoRutPipe } from './shared/pipes/formato-rut.pipe';
import { ValidadorRutDirective } from './components/confirmacion/crud-sociedades/validadores/validador-rut.directive';
import { PorcentajeDirective } from './components/confirmacion/crud-sociedades/validadores/porcentaje.directive';
import { BarraPasosComponent } from './shared/components/barra-pasos/barra-pasos.component';
import { DetalleSimulacionComponent } from './shared/components/detalle-simulacion/detalle-simulacion.component';
import { BackendCurrencyFormatPipe } from './shared/pipes/backend-currency-format.pipe';
import { AutorizacionComponent, SafePipe } from './components/autorizacion/autorizacion.component';
import { NumeroContratoPipe } from './shared/pipes/numero-contrato.pipe';
import { BackendFechaPipe } from './shared/pipes/backend-fecha.pipe';
import { BackendNumeroPipe } from './shared/pipes/backend-numero.pipe';
import { BackendDolarPipe } from './shared/pipes/backend-dolar.pipe';
import { TelefonoDirective } from './shared/directives/telefono.directive';
import { ContadorCaracteresComponent } from './shared/components/contador-caracteres/contador-caracteres.component';
import { ResponseInterceptor } from './seguridad/response.interceptor';
import { BackendDescripcionTarjetaPipe } from './shared/pipes/backend-descripcion-tarjeta.pipe';
import { BackendTaxPipe } from './shared/pipes/backend-tax.pipe';
import { ResumenComponent } from './shared/components/detalle-simulacion/resumen/resumen.component';
import { BotonVolverInicioComponent } from './shared/components/boton-volver-inicio/boton-volver-inicio.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { PaginaErrorComponent } from './components/pagina-error/pagina-error.component';
import { PaginaHomeComponent } from './components/pagina-home/pagina-home.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

export function initConfig(configSrv: ConfigService) {
  return () => configSrv.init();
}

@NgModule({
    declarations: [
      OfertaComponent,
      MandatoComponent,
      ConfirmacionComponent,
      SimulacionComponent,
      ContratadoComponent,
      DialogoCredCsmoComponent,
      DialogoCtaCteComponent,
      DialogoTarjetasComponent,
      ContenedorAcordeonComponent,
      CondGeneralesComponent,
      NotificacionComponent,
      FormatCurrencyPipe,
      MaskCreditcardPipe,
      AlertaComponent,
      DisplayTarjetaCreditoComponent,
      VisualizadorArchivosComponent,
      CrudSociedadesComponent,
      FormatoRutPipe,
      ValidadorRutDirective,
      PorcentajeDirective,
      BarraPasosComponent,
      DetalleSimulacionComponent,
      ResumenComponent,
      BackendCurrencyFormatPipe,
      AutorizacionComponent,
      NumeroContratoPipe,
      BackendFechaPipe,
      BackendNumeroPipe,
      BackendDolarPipe,
      TelefonoDirective,
      ContadorCaracteresComponent,
      SafePipe,
      BackendDescripcionTarjetaPipe,
      BackendTaxPipe,
      BotonVolverInicioComponent,
      LoadingComponent,
      PaginaErrorComponent,
      PaginaHomeComponent
    ],
    imports: [
      CommonModule,
      HttpClientModule,
      FormsModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      ReactiveFormsModule,
      PdfJsViewerModule,
      APP_ROUTING
    ],
    exports: [
      LoadingComponent
    ],
    providers: [
      ConfigService,
      DatePipe,
      DecimalPipe,
      FormatCurrencyPipe,
      FormatoRutPipe,
      BackendCurrencyFormatPipe,
      BackendFechaPipe,
      BackendTaxPipe,
      SafePipe,
      { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi: true },
      { provide: APP_INITIALIZER, useFactory: initConfig, deps: [ConfigService], multi: true }
    ]
  })



export class RenegociadoModule {

 }
