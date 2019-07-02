import { Output, Component, EventEmitter, Injectable } from '@angular/core';
import { FileService } from '../services/file.services';
import { MapService } from '../services/map.service';
import { Faksimile } from '../types/faksimile';


import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Projection from 'ol/proj/Projection.js';
import { Image as ImageLayer} from 'ol/layer.js';
import { getCenter } from 'ol/extent.js';
import Static from 'ol/source/ImageStatic.js'
import { MapFaksimile } from '../types/mapfaksimile';
import { ZoomSlider } from 'ol/control';
import { defaults as defaultControls, FullScreen, Rotate } from 'ol/control.js';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction.js';
import Bar from 'ol-ext/control/Bar';
import Legend from 'ol-ext/control/Legend';
import Toggle from 'ol-ext/control/Toggle';
import Button from 'ol-ext/control/Button';
import Magnify from 'ol-ext/overlay/Magnify';

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

 
  faksimiles: Faksimile[];
  faksimile: Faksimile;
  contain = '';

  inc_index = 100;

  imageOriginal;
  imageProcessed = new MarvinImage();
  imageDisplay = new MarvinImage();


  name;
  reader;
  form;



  constructor(private fileService: FileService, private mapService: MapService) {
    
  }

  getMap(id): MapFaksimile {
    var obj: MapFaksimile = this.mapService.getMaps().filter(function (node) {
      return node.ID == id;
    })[0];

    return obj;
  }


  repaint(data: Faksimile) {
    this.generateMap(data);

}

  onSelectFile(event: any) {
    var self = this;
    var file: File = event.target.files[0];
    var faksimile;
    this.imageOriginal = new MarvinImage();
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
        self.fileService.setActualContain(faksimile, self.imageProcessed);

        self.imageProcessed = faksimile.actualcontain;
        
        self.generateMap(faksimile);
      
      }
    };
   
  }

  generateMap(faksimile: Faksimile) {

    var extent = [0, 0, this.imageProcessed.width, this.imageProcessed.height];

    this.imageProcessed.draw(this.imageProcessed.canvas);

    var url = this.imageProcessed.canvas.toDataURL();

    var mapfk: MapFaksimile = this.getMap(faksimile.ID);
    if (mapfk != null) {
      var map = mapfk.map;
      var layers = mapfk.map.getLayers();
      mapfk.map.removeLayer(layers.getArray()[0]);
    }
    else {
      var projection = new Projection({
        code: 'xkcd-image',
        units: 'pixels',
        extent: extent
      });
      var map = new Map({
        target: 'card-block' + faksimile.ID,
        interactions: defaultInteractions().extend([
          new DragRotateAndZoom()
        ]),
        view: new View({
          projection: projection,
          center: getCenter(extent),
          zoom: 2,

          maxZoom: 8
        })
      });

      var mapf = new MapFaksimile(map, faksimile);
      this.mapService.addMap(mapf);
      
    }

    
    var layer: any =
      new ImageLayer({
        source: new Static({
          url: url,
          imageSize: [this.imageProcessed.width, this.imageProcessed.height],
          projection: projection,
          imageExtent: extent
        })
      });

    map.addLayer(layer);
    var zoomslider = new ZoomSlider();
    map.addControl(zoomslider);

    // Main control bar
    var mainbartopright = new Bar();
    map.addControl(mainbartopright);
    mainbartopright.setPosition("top-right");

    var self = this;

  
    var blackwhite = new Button(
      {
        html: '<i class="fa fa-adjust"></i>',
        title: 'Black and White',
        handleClick: function () {
          var level = 30;
          self.imageOriginal = self.fileService.getActualContain(faksimile);
          self.imageProcessed = self.imageOriginal.clone();
          Marvin.blackAndWhite(self.imageOriginal, self.imageProcessed, level);
          self.fileService.setActualContain(faksimile, self.imageProcessed);
          self.repaint(faksimile);
          console.log("Black and White");
        }
      });
    mainbartopright.addControl(blackwhite);

    var edgedetection = new Button(
      {
        html: '<i class="fa fa-music"></i>',
        title: 'Edge Detection',
        handleClick: function () {
          self.imageOriginal = self.fileService.getActualContain(faksimile);
          self.imageProcessed = self.imageOriginal.clone();
          self.imageProcessed.clear(0xFF000000);

          Marvin.prewitt(self.imageOriginal, self.imageProcessed);
          Marvin.invertColors(self.imageProcessed, self.imageProcessed);
          Marvin.thresholding(self.imageProcessed, self.imageProcessed, 150);
          self.fileService.setActualContain(faksimile, self.imageProcessed);
          self.repaint(faksimile);
         
        }
      });
    mainbartopright.addControl(edgedetection);

    var removebackground = new Button(
      {
        html: '<i class="fa fa-eraser"></i>',
        title: 'Remove Background',
        handleClick: function () {

          var imageData = faksimile.actualcontain.imageData;
          var pixel = imageData.data;

          var r = 0, g = 1, b = 2, a = 3;
          for (var p = 0; p < pixel.length; p += 4) {

            if (
              pixel[p + r] == 255 &&
              pixel[p + g] == 255 &&
              pixel[p + b] == 255) // if white then change alpha to 0
            { pixel[p + a] = 0; }
          }

          self.imageOriginal = self.fileService.getActualContain(faksimile);
          self.imageProcessed = self.imageOriginal.clone();

          self.imageProcessed.imageData = imageData;
          self.fileService.setActualContain(faksimile, this.imageProcessed);
          self.repaint(faksimile);
          console.log("remove Background");
        }
      });
    mainbartopright.addControl(removebackground);

    var movetofront = new Button(
      {
        html: '<i class="fa fa-clone"></i>',
        title: 'Move To Front',
        handleClick: function () {
          var canvas: any = document.getElementById('card-div' + faksimile.ID);
          canvas.style.zIndex = ++self.inc_index;
        
        }
      });
    mainbartopright.addControl(movetofront);

    var undo = new Button(
      {
        html: '<i class="fa fa-undo"></i>',
        title: 'Undo',
        handleClick: function () {
          self.imageOriginal.load(faksimile.contain, imageLoaded);

          function imageLoaded() {
            self.imageProcessed = self.imageOriginal.clone();
            self.fileService.setActualContain(faksimile, self.imageProcessed);
            self.repaint(faksimile);
          }

        }
      });
    mainbartopright.addControl(undo);
  
    var magnify = new Toggle(
      {
        html: '<i class="fa fa-search"></i>',
        title: "Magnify",
        active: false,
        onToggle: function (active) {
         var ov = new Magnify(
           {
             layers: [layer],
             zoomOffset: 1,
             projection: projection,
           });

          if (active) {
            map.addOverlay(ov);
          }

          else {
            ov.stopEvent = true;
            map.removeOverlay(map.getOverlays().getArray()[0]);
          }
        }
      });

    mainbartopright.addControl(magnify);

    var mainbarbuttom = new Bar();
    map.addControl(mainbarbuttom);
    mainbarbuttom.setPosition("bottom");

    // mainbar.addControl(new Magnify(faksimile, map));
    mainbarbuttom.addControl(new Rotate());
    mainbarbuttom.addControl(new FullScreen());
    var close = new Button(
      {
        html: '<i class="fa fa-times-circle"></i>',
        title: "Close",
        handleClick: function () {
          self.fileService.removeFaksimile(faksimile);
          self.faksimiles = self.fileService.getFaksimiles();

        }
      });
    mainbarbuttom.addControl(close);

    var legend = new Legend({
      title: faksimile.title,
      collapsed: false
    });
    map.addControl(legend);


  }
}
