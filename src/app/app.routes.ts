
import { RouterModule, Routes } from '@angular/router';

import { OfertaComponent } from './renegociado/components/oferta/oferta.component';
import { SimulacionComponent } from './renegociado/components/simulacion/simulacion.component';
import { ConfirmacionComponent } from './renegociado/components/confirmacion/confirmacion.component';
import { ContratadoComponent } from './renegociado/components/contratado/contratado.component';
import {MandatoComponent} from './renegociado/components/mandato/mandato.component';
import { AutorizacionComponent } from './renegociado/components/autorizacion/autorizacion.component';
import { PaginaErrorComponent } from './renegociado/components/pagina-error/pagina-error.component';
import { PaginaHomeComponent } from './renegociado/components/pagina-home/pagina-home.component';

const APP_ROUTES: Routes = [
    { path: 'oferta', component: OfertaComponent },
    { path: 'mandato', component: MandatoComponent },
    { path: 'confirmacion', component: ConfirmacionComponent },
    { path: 'contratado', component: ContratadoComponent },
    { path: 'simulacion', component: SimulacionComponent },
    { path: 'autorizacion', component: AutorizacionComponent },
    { path: 'error', component: PaginaErrorComponent },
    { path: 'home', component: PaginaHomeComponent },
    { path: '**', pathMatch: 'full', redirectTo: 'oferta' }
  ];


export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES, {useHash: true});
