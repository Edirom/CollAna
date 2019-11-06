import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { DomSanitizer } from '@angular/platform-browser';
import { Faksimile } from './types/faksimile';
import { CdkDragEnd, CdkDragMove } from "@angular/cdk/drag-drop";




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  faksimiles: Faksimile[];
  inc_index = 100;


  mini_old_boundingClientRect: any;
  maxi_old_boundingClientRect: any;

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



  drag_maxi_block_Moved(event: CdkDragMove, faksimile: Faksimile) {
    let element = document.getElementById('card-block' + faksimile.ID);
    let boundingClientRect: any = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    let drag_element = document.getElementById('mini-card-canvas' + faksimile.ID);

    console.log("boundingClientRect.y" + boundingClientRect.y);

    var newPos = ((boundingClientRect.y * 100) / boundingClientRect.height);
    if (newPos < 0)
      newPos = 0;
    drag_element.style.top = newPos + "px";
    this.inc_index = ++this.inc_index
    drag_element.style.zIndex = this.inc_index.toString();

    console.log("Moved" + parentPosition.top)
  }


  drag_mini_block_Started(event: CdkDragEnd, faksimile: Faksimile) {
    let element = event.source.element.nativeElement;
    this.mini_old_boundingClientRect = element.getBoundingClientRect();

    let maxi_elem = document.getElementById('card-block' + faksimile.ID);
    this.maxi_old_boundingClientRect = maxi_elem.getBoundingClientRect();

    this.inc_index = ++this.inc_index
    element.style.zIndex = this.inc_index.toString();
  }
  drag_mini_block_Moved(event: CdkDragEnd, faksimile: Faksimile) {
    let element = event.source.element.nativeElement;
    let mini_current_boundingClientRect: any = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    let drag_element = document.getElementById('card-block' + faksimile.ID);
    let maxi_current_boundingClientRect: any = drag_element.getBoundingClientRect();

    var mini_distance = mini_current_boundingClientRect.y - this.mini_old_boundingClientRect.y;

    var maxi_distance = (mini_distance * maxi_current_boundingClientRect.height) / mini_current_boundingClientRect.height;

    var newPos = ((mini_current_boundingClientRect.y - parentPosition.top) * maxi_current_boundingClientRect.height) / 100;
    drag_element.style.top = newPos + "px";
    this.inc_index = ++this.inc_index
    drag_element.style.zIndex = this.inc_index.toString();
  }
  drag_mini_block_Ended(event: CdkDragEnd, faksimile: Faksimile) {
    let element = event.source.element.nativeElement;
    this.inc_index = ++this.inc_index
    element.style.zIndex = this.inc_index.toString();
  }

  drag_maxi_block_Started(event: any, faksimile: Faksimile) {
    let element = document.getElementById('card-block' + faksimile.ID);
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
