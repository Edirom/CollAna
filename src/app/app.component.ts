import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { Faksimile } from './types/faksimile';
import { CdkDragDrop } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  faksimiles: Faksimile[];

  onEnter(event: any, data: Faksimile) {
    data.scaleFactor = event.target.value;
    data.actualwidth = data.scaleFactor * data.width / 100;
  }
  constructor(private fileService: FileService) {

  }


  import(data: any): void {
    this.faksimiles = this.fileService.getFaksimiles();
  }

  close(data: any) {
    this.fileService.removeFaksimile(data);
    this.faksimiles = this.fileService.getFaksimiles();
    console.log("close...");
    console.log("a.." + data.title);
  }
  onTaskDrop(event: any) {

    var myElement = event.source.element.nativeElement;
    myElement.style.opacity = 0.5;
    myElement.style.zIndex = 999;
    //myElement.parentNode.appendChild(myElement);
    var children = myElement.parentNode.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i].tagName == "DIV" && children[i] != myElement)
      {
        children[i].style.opacity = 1.0;
        console.log(children[i].tagName);
      }
     
    }
   
  }

  title = 'ng7-pre';
}
