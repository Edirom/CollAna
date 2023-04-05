import { Component, AfterViewInit } from '@angular/core';
import { CdkDragEnd, CdkDragMove } from "@angular/cdk/drag-drop";

import { FileService } from '../../services';
import { MapService } from '../../services/map.service';

import { FileComponent } from '../../file/file.component';

import { Faksimile } from '../../types/faksimile';

import { saveAs } from 'file-saver';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare let html2canvas: any;

@Component({
  selector: 'app-collation',
  templateUrl: './collation.component.html',
  styleUrls: ['./collation.component.css']
})

export class CollationComponent implements AfterViewInit {
  faksimiles: Faksimile[];
  inc_index = 100;
  mini_old_boundingClientRect: any;
  maxi_old_boundingClientRect: any;
  imageData = "";

  constructor(
    private fileService: FileService, private fileComponent: FileComponent, private mapService: MapService,private modalService: NgbModal) {
    this.faksimiles = this.fileService.getFaksimiles();
  }

  ngAfterViewInit() {
    this.faksimiles = this.fileService.getFaksimiles();
    this.mapService.removeAllMaps();
    this.generateMap();
  }

  generateMap() {
    this.faksimiles = this.fileService.getFaksimiles();
    this.faksimiles.forEach(a => this.fileComponent.generateMap(a, a.actualPage));
    this.faksimiles.forEach(a => this.fileComponent.generateMinPreview(a));
  }

  /** 
   * Track the imported file based on index
  */
  trackByIndex(index: number, faksimile: Faksimile): any {
    faksimile.index = index;
    return index;
  }

  /** 
   * Import the file to process
  */
  import(): void {
    this.faksimiles = this.fileService.getFaksimiles();
  }

  /** 
   * Export the current page data to Image file
  */
  export() {
    if (this.faksimiles.length == 0) {
      window.alert("No Data to export!");
      return;
    }

    // var input = "";
    // var output = "";
    // this.faksimiles.forEach(function (faksimile) {
    //   input = faksimile.title;
    //   output = output + input.substr(0, input.lastIndexOf('.')) + "_" + "Page" + faksimile.actualPage + "_";
    // });
    let data = []
    this.faksimiles.forEach(fakesmile=>{
      let canvas = document.getElementById('card-block'+fakesmile.ID).querySelector('canvas')
      let anchor = document.createElement('a')
      anchor.download = fakesmile.ID + '.png'
      anchor.href = canvas.toDataURL('image/png')
      let object = {
        name: fakesmile.ID,
        image: anchor.href
      }
      data.push(object)
      anchor.click()
      anchor.remove()
    })

    var uri = "data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(data));
    let anchor = document.createElement('a')
    anchor.download = 'export.json'
    anchor.href = uri
    anchor.click()
    anchor.remove()
    // html2canvas(document.querySelector("#capture")).then(canvas => {
    //   canvas.toBlob(function (blob) {
    //     var reader = new FileReader();
    //     reader.readAsDataURL(blob);
    //     reader.onload = function () {
    //       let data = {
    //         image: reader.result
    //       }
    //       let dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    //       saveAs(dataBlob, output + ".json");
    //       // console.log(reader.result);
    //     };
    //     reader.onerror = function (error) {
    //       // console.log('Error: ', error);
    //     };
    //     saveAs(blob, output + ".png");
    //   });
    // });
  }

  importJson(file: File[],callback){
    let tempFile = file[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        callback(e.target.result.toString())
    };
    reader.readAsText(tempFile);
  }
  

  addToCanvas = (data) =>{
    let jsonData = JSON.parse(data)
    jsonData.forEach(element => {
      this.fileComponent.importJsonImage(element['name'],element['image'])
    });
  }

  drag_maxi_block_Moved(event: CdkDragMove, faksimile: Faksimile) {
    let element = document.getElementById('card-block' + faksimile.ID);
    let boundingClientRect: any = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    let drag_element = document.getElementById('mini-card-canvas' + faksimile.ID);

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
}