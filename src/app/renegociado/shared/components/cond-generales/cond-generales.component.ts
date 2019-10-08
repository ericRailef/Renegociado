import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ContenidoExternoService } from '../../../services/contenido-externo.service';

@Component({
  selector: 'app-cond-generales',
  templateUrl: './cond-generales.component.html',
  styleUrls: ['./cond-generales.component.css']
})
export class CondGeneralesComponent implements OnInit {

  private readonly CLOSE_PADDING = '0px';

  @Input() url;

  innerHtml: string;
  stateOpen = false;
  paddingSize = this.CLOSE_PADDING;

  @ViewChild('boxContent') elementView: ElementRef;

  constructor(private contenidoExtSrv: ContenidoExternoService) {
  }

  ngOnInit() {
    this.contenidoExtSrv.getHtml(this.url)
      .subscribe((html) => this.innerHtml = html, (err) => {});

    this.close();
  }

  private open() {
    this.paddingSize = this.elementView.nativeElement.offsetHeight + 'px';
    this.stateOpen = true;
  }

  private close() {
    this.paddingSize = this.CLOSE_PADDING;
    this.stateOpen = false;
  }

  onClickHeader() {
    if (this.stateOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
