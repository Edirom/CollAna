import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { Faksimile } from './types/faksimile';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { forEach } from '@angular/router/src/utils/collection';
import { DomSanitizer } from '@angular/platform-browser';
import { FileComponent } from './file/file.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
 
  faksimiles: Faksimile[];

  blackandwhite: boolean;

  public angleStyle: any;
  public level: number = 30;

  constructor(
    private fileService: FileService,
    private fileComponent: FileComponent,
    protected Sanitizer: DomSanitizer) {

  }

  onEnterScale(event: any, data: Faksimile) {
    data.scaleFactor = event.target.value;
    data.actualwidth = data.scaleFactor * data.width / 100;
    data.actualheight = data.scaleFactor * data.height / 100;
    this.fileComponent.repaintCanvas(data, this.blackandwhite);
  }

  remove(event: any, data: Faksimile) {
    this.fileComponent.white2transparent(data);
  }
  onEnterRotation(event: any, data: Faksimile) {
    data.angle = event.target.value;
    this.fileComponent.rotateCanvas(data, this.blackandwhite);
  }
  
  inc_index = 100;
  dec_index = 99;
  moveToFront(event: any, data: Faksimile): void{
    var canvas: any = document.getElementById('card-div' + data.ID);
    canvas.style.zIndex = ++this.inc_index;
  }

  checkValue(event: any, data: Faksimile): void {
    if (event.currentTarget.checked) {
      this.blackandwhite = true;
     // this.fileComponent.BlackAndWhite(data);
    }
    else {
      this.blackandwhite = false;
      this.fileComponent.Restore(data);
    }
  }

  blackAndWhite(data: Faksimile): void {
      this.fileComponent.BlackAndWhite(data, this.level);  
  }

  restoreBlackAndWhite(data: Faksimile): void {
    this.fileComponent.Restore(data);  
  }

 
  import(data: any): void {
    this.faksimiles = this.fileService.getFaksimiles();
  }

  close(data: any) {
    this.fileService.removeFaksimile(data);
    this.faksimiles = this.fileService.getFaksimiles();
  }
  
  title = 'ng7-pre';
}
