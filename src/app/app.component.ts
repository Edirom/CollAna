import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { DomSanitizer } from '@angular/platform-browser';
import { Faksimile } from './types/faksimile';
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { forEach } from '@angular/router/src/utils/collection';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  faksimiles: Faksimile[];
  inc_index = 100;

  constructor(
    private fileService: FileService,
    protected Sanitizer: DomSanitizer) {

  }

  trackByIndex(index: number, faksimile: Faksimile): any {
    faksimile.index = index;
    return index;
  }
 
  import(data: any): void {
    this.faksimiles = this.fileService.getFaksimiles();
  }

  dragStarted(event: CdkDragEnd, faksimile: Faksimile) {
    let element = event.source.element.nativeElement;
    this.inc_index = ++this.inc_index
    element.style.zIndex = this.inc_index.toString();
  }
  dragMoved(event: CdkDragEnd, faksimile: Faksimile) {
    let element = event.source.element.nativeElement;
    let boundingClientRect: any = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    let drag_element = document.getElementById('card-div' + faksimile.ID);
    let dragboundingClientRect: any = drag_element.getBoundingClientRect();

    var newPos = ((boundingClientRect.y - parentPosition.top) * dragboundingClientRect.height) / 100;
    drag_element.style.top = newPos + "px";
    this.inc_index = ++this.inc_index
    drag_element.style.zIndex = this.inc_index.toString();

    console.log('new pos   ' + newPos );


    console.log("Moved")
  }
  dragEnded(event: CdkDragEnd, faksimile: Faksimile) {
    //event.source.getRootElement().getBoundingClientRect();
    let element = event.source.element.nativeElement;
    this.inc_index = ++this.inc_index
    element.style.zIndex = this.inc_index.toString();
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

  title = 'ng7-pre';
}
