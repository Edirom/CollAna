import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { Faksimile } from './types/faksimile';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { forEach } from '@angular/router/src/utils/collection';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  faksimiles: Faksimile[];


  public angleStyle: any;


  onEnterScale(event: any, data: Faksimile) {
    data.scaleFactor = event.target.value;
    data.actualwidth = data.scaleFactor * data.width / 100;
  }

  onEnterRotation(event: any, data: Faksimile) {
    data.angle = event.target.value;
  }
  constructor(private fileService: FileService, protected Sanitizer: DomSanitizer) {
   
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


 compareallDescendants(node, id, parent) {
  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    if (child.tagName == "DIV" && child.id != "card-block" + id && child.parentNode != parent) {
      child.style.opacity = "1.0";
      child.parentElement.style.zIndex = "1";
    }
   
    this.compareallDescendants(child, id, parent);
  }
}
  onTaskDrop(event: any, data: Faksimile) {

    var myElement = event.source.element.nativeElement;
    var children = myElement.childNodes;
    for (var i = 0, len = children.length; i < len; i++) {
      if (children[i].id == "card-block" + data.ID) {
        children[i].style.opacity = "0.5";
        children[i].parentElement.style.zIndex = "999";
      }
    }
   
    //myElement.style.opacity = 0.5;
    //myElement.style.zIndex = 999;
    //console.log("ID: " + data.ID);
    //myElement.parentNode.appendChild(myElement);
    var children = myElement.parentNode;
    this.compareallDescendants(children, data.ID, myElement);
   
  }

  title = 'ng7-pre';
}
