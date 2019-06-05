import { Output, Component, EventEmitter, Injectable } from '@angular/core';
import { FileService } from '../services/file.services';
import { Faksimile } from '../types/faksimile';


declare var MarvinImage: any;
declare var Marvin: any;

@Injectable({ providedIn: 'root' })

@Component({
  selector: 'fileservice',
    template: '<div class="btn btn-file btn-outline-primary"><i class= "fa fa-upload fa-lg" > </i><span class= "hidden-xs-down" > Import </span><input type="file"  #fileUpload (click)="fileUpload.value = null"(change)="onSelectFile($event)" accept=".jpg, .png, .*" /></div>',
  styleUrls: ['./file.component.css']
})

export class FileComponent {
   
    
  @Output() complete: EventEmitter<any> = new EventEmitter();


  faksimile: Faksimile;
  contain = '';

  imageOriginal = new MarvinImage();
  imageProcessed = new MarvinImage();
  imageDisplay = new MarvinImage();

  name;
  reader;
  form;




  constructor(private fileService: FileService) {
  
  }

  rotateCanvas(data: Faksimile, blackandwhite: boolean): any {
   //To do!!!
    this.repaintCanvas(data, blackandwhite);

  }


  BlackAndWhite(data: Faksimile, level: number): any {
   
    this.imageOriginal = this.fileService.getActualContain(data);
    this.imageProcessed = this.imageOriginal.clone();
    Marvin.blackAndWhite(this.imageOriginal, this.imageProcessed, level);
    this.fileService.setActualContain(data, this.imageProcessed);
    this.repaint(data);
   
  }

  white2transparent(data: Faksimile) {


    var imageData = data.actualcontain.imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] == 255 &&
        pixel[p + g] == 255 &&
        pixel[p + b] == 255) // if white then change alpha to 0
      { pixel[p + a] = 0; }
      }

      this.imageOriginal = this.fileService.getActualContain(data);
      this.imageProcessed = this.imageOriginal.clone();

      this.imageProcessed.imageData = imageData;

      this.repaint(data);
}

  Restore(data: Faksimile): any {
    var self = this;
    this.imageOriginal.load(data.contain, imageLoaded);

    function imageLoaded() {
      self.imageProcessed = self.imageOriginal.clone();
      self.fileService.setActualContain(data, self.imageProcessed);
      self.repaint(data);
    }

  }
  

  repaint(data: Faksimile) {
    var canvas: any = document.getElementById('card-block' + data.ID);

    canvas.getContext("2d").fillStyle = "#eeeeee";

    canvas.width = data.actualwidth;
    canvas.height = data.actualheight;
   
    //canvas.getContext("2d").fillRect(0, 0, this.imageProcessed.getWidth(), this.imageProcessed.getHeight());

    Marvin.scale(this.imageProcessed.clone(), this.imageProcessed, Math.round(data.actualwidth), Math.round(data.actualheight));

    this.imageProcessed.draw(canvas);
    this.imageProcessed.update();
}

  repaintCanvas(data: Faksimile, blackandwhite: boolean) {
    var self = this;
    this.imageOriginal.load(data.contain, imageLoaded);

    function imageLoaded() {
      self.imageProcessed = self.imageOriginal.clone();
      if (blackandwhite)
        Marvin.blackAndWhite(self.imageProcessed.clone(), self.imageProcessed, 20);  
      self.repaint(data);
    }
  }


  onSelectFile(event: any) {
    var self = this;
    var file: File = event.target.files[0];
    var faksimile; 
    this.reader = new FileReader();
    this.reader.readAsDataURL(file);
 
    this.reader.onloadend = function (e: any) {
      self.contain = self.reader.result;
      self.complete.next({
        fileContent: self.reader.result,
        fileName: file.name,
      }); 

      var image = new Image();
      image.src = self.reader.result;
      var w;
      var h;
      
      image.onload = function () {
        w = image.width;
        h = image.height;
        faksimile = new Faksimile(file.name, self.contain, w, h, self.contain, w, h, 100, 0, 0);
        self.fileService.addFaksimile(faksimile);
      };


      self.imageOriginal.load(self.contain, imageLoaded);

      function imageLoaded() {
        self.imageProcessed = self.imageOriginal.clone();
        self.fileService.setActualContain(faksimile, self.imageProcessed)
        self.repaint(faksimile);
      }

    };
   
  }


}
