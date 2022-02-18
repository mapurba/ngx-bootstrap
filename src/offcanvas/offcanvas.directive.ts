import {
  Directive, HostListener,
  Renderer2, ElementRef, Input, EventEmitter, Output,
} from "@angular/core";
import { BackdropService } from "ngx-bootstrap/component-loader";
import { OffcanvasConfig, OffcanvasConfigType } from "./offcanvas.config";
import { Subscription } from "rxjs";

const BACKDROP_NODE_NAME = 'OFFCANVAS-BACKDROP';

@Directive({selector: '[offcanvas]', exportAs:'offcanvas'})
export class OffcanvasDirective {
  isOpen = false;
  // it is necessary for showing several elements
  delayValue = 300;
  _config?: OffcanvasConfigType;
  sub?: Subscription;
  @Input() set config(value: OffcanvasConfigType | undefined) {
    if (!value) {
      return;
    }

    this.setConfig(value);
  };

  @Output() isOpened: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private offcanvasConfig: OffcanvasConfig,
    private backdropServ: BackdropService
) {}

  @HostListener('transitionend')
  transitionend() {
    if (!this.isOpen) {
      this.el.nativeElement.style.visibility = 'hidden';
    }
  }

  @HostListener('body:click', ['$event'])
  onClickStop(event: Event): void {
    const nodeName = (event.target as HTMLElement).nodeName;

    if (this.isOpen && nodeName === BACKDROP_NODE_NAME) {
      this.hide();
    }
  }

  public show() {
    this.isOpen = true;
    if (this._config?.backdrop) {
      this.backdropServ._showBackdrop(true, 'OFFCANVAS');
    }

    if (!this._config?.backdropScrolling) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    }

    setTimeout(() => {
      this.el.nativeElement.style.visibility = 'visible';
      this.renderer.addClass(this.el.nativeElement, 'show');
      this.isOpened.emit(true);
      if (this._config?.backdrop) {
        this.sub = this.backdropServ.backDropIsCLicked.subscribe(() => {
          this.hide();
        });
      }
    },this.delayValue);
  }

  hide() {
    this.isOpen = false;
    if (this._config?.backdrop) {
      this.backdropServ._hideBackdrop(true);
      if (this.sub) {
        this.sub.unsubscribe();
      }
    }

    if (!this._config?.backdropScrolling) {
      this.renderer.removeStyle(document.body, 'overflow');
    }

    this.renderer.removeClass(this.el.nativeElement, 'show');
    this.isOpened.emit(false);
  }

  setConfig(value: Partial<OffcanvasConfigType>) {
      this._config = Object.assign({}, this.offcanvasConfig, value);
  }
}