import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { AppComponent } from './app.component';
import localeEsCL from '@angular/common/locales/es-CL';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { APP_ROUTING } from './app.routes';


import { RenegociadoModule } from './renegociado/renegociado.module';
import { DateAdapter } from '@angular/material';
import { CustomDateAdapter } from './renegociado/adapter/customDateAdapter';

registerLocaleData(localeEsCL, 'es-CL');

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RenegociadoModule,
    BrowserAnimationsModule,
    APP_ROUTING
  ],
  exports: [
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'es-CL'},
    {provide: DateAdapter, useClass: CustomDateAdapter}/*,
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },*/
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
