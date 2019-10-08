import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadingInfo } from './loading.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private requestInFlight: BehaviorSubject<LoadingInfo>;

  constructor() {
    this.requestInFlight = new BehaviorSubject({ status: false });
  }

  setHttpStatus(inFlight: boolean, titulo?: string, detalle?: string) {
    this.requestInFlight.next({
      status: inFlight,
      titulo,
      detalle
    });
  }

  getHttpStatus(): Observable<LoadingInfo> {
    return this.requestInFlight.asObservable();
  }
}
