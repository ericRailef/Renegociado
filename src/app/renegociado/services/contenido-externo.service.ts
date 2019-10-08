import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContenidoExternoService {

  constructor(private httpClient: HttpClient) {
  }

  getArchivoBinario(nombre: string): Observable<Blob> {
    return this.httpClient.get(`${nombre}`, {responseType: 'blob' });
  }

  getHtml(nombre: string): Observable<string> {
    return this.httpClient.get(`${nombre}`, {responseType: 'text' });
  }
}
