import { Output, Component, EventEmitter, Injectable, Input } from '@angular/core';
import { FileService } from '../services/file.services';
import { MapService } from '../services/map.service';
import { Faksimile } from '../types/faksimile';


import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Projection from 'ol/proj/Projection.js';
import { Image as ImageLayer} from 'ol/layer.js';
import Static from 'ol/source/ImageStatic.js'
import { MapFaksimile } from '../types/mapfaksimile';
import { ZoomSlider } from 'ol/control';
import { defaults as defaultControls, FullScreen, Rotate } from 'ol/control.js';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction.js';
import Bar from 'ol-ext/control/Bar';
import Legend from 'ol-ext/control/Legend';
import Toggle from 'ol-ext/control/Toggle';
import Button from 'ol-ext/control/Button';
import TextButton from 'ol-ext/control/TextButton';
import Magnify from 'ol-ext/overlay/Magnify';
import Modify from 'ol/interaction/Modify';
import { Pages } from '../types/pages';
import Draw, { createBox } from 'ol/interaction/Draw';
import {Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import FocusMap from 'ol-ext/interaction/FocusMap';
import Transform from 'ol-ext/interaction/Transform';
import Delete from 'ol-ext/interaction/Delete';
import Swipe from 'ol-ext/control/Swipe';
import { shiftKeyOnly } from 'ol/events/condition';

import SourceState from 'ol/source/State';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getWidth, getCenter } from 'ol/extent';
import { Layer, Tile as TileLayer } from 'ol/layer';


import { Stroke, Fill, Circle, Style } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';

import * as d3 from "d3";
import { Overlay } from 'ol';
import OverlayPositioning from 'ol/OverlayPositioning';


declare var MarvinImage: any;
declare var Marvin: any;

declare var solve: any;

declare var pdfjsLib: any;

//declare var d3: any;

@Injectable({ providedIn: 'root' })

@Component({
  selector: 'fileservice',
    template: '<div fxLayoutGap="10px"> <div class="btn btn-file btn-outline-primary"><i class= "fa fa-upload fa-lg" > </i><span class= "hidden-xs-down" > Import </span><input type="file"  #fileUpload (click)="fileUpload.value = null"(change)="onSelectFile($event)" accept=".jpg, .png, .pdf" /></div></div>',
  styleUrls: ['./file.component.css']
})

export class FileComponent {
   
    
  @Output() complete: EventEmitter<any> = new EventEmitter();
  @Input() canvas_index: number;
 
  faksimiles: Faksimile[];
  faksimile: Faksimile;
  contain = '';
  
  inc_index = 100;

  imageOriginal;
  imageDisplay = new MarvinImage();


  name;
  reader;
  form;
  pdfDoc;

  host: any;
  svg: any;

  constructor(private fileService: FileService, private mapService: MapService) {
    
  }

  wrapFunction = function (fn, context, params) {
    return function () {
      fn.apply(context, params);
    };
  }

  fun_blue_and_white;
  fun_red_and_white;
  fun_black_and_white;
  fun_edge_detection;
  fun_remove_background;


  blue_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] != 255 ||
        pixel[p + g] != 255 ||
        pixel[p + b] != 255) {
        pixel[p + r] = 5;
        pixel[p + g] = 139;
        pixel[p + b] = 255;
        pixel[p + a] = 170;
      }
    }
    imageProcessed = this.imageOriginal.clone();

    imageProcessed.imageData = imageData;
    // self.fileService.setActualContain(faksimile, self.imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);
    console.log("Blue and White");

  }


  red_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] != 255 ||
        pixel[p + g] != 255 ||
        pixel[p + b] != 255) {
        pixel[p + r] = 255;
        pixel[p + g] = 130;
        pixel[p + b] = 0;
        pixel[p + a] = 200;
      }
    }
    imageProcessed = this.imageOriginal.clone();
    imageProcessed.imageData = imageData;
    this.repaint(faksimile, faksimile.actualPage);
    console.log("Red and White");


  }

  black_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var level = 30;
    this.imageOriginal = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    imageProcessed = this.imageOriginal.clone();
    Marvin.blackAndWhite(this.imageOriginal, imageProcessed, level);
    // Marvin.colorChannel(self.imageOriginal, imageProcessed, 139,0,0);
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);
    console.log("Black and White");
  }

  remove_background = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] == 255 &&
        pixel[p + g] == 255 &&
        pixel[p + b] == 255) // if white then change alpha to 0
      { pixel[p + a] = 0; }
    }

    imageProcessed = this.imageOriginal.clone();

    imageProcessed.imageData = imageData;
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
   
    this.repaint(faksimile, faksimile.actualPage);
    console.log("remove Background");
  }

  edge_detection = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    this.imageOriginal = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    imageProcessed = this.imageOriginal.clone();
    imageProcessed.clear(0xFF000000);

    Marvin.prewitt(this.imageOriginal, imageProcessed);
    Marvin.invertColors(imageProcessed, imageProcessed);
    Marvin.thresholding(imageProcessed, imageProcessed, 150);
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);
  }

  getMap(id): MapFaksimile {
    var obj: MapFaksimile = this.mapService.getMaps().filter(function (node) {
      return node.ID == id;
    })[0];

    return obj;
  }


  repaint(data: Faksimile, num: number) {
    this.generateMap(data, num);
}

  
 

  generateMinPreview(faksimile: Faksimile) {

    var element: any = document.getElementById("mini-card-canvas" + faksimile.ID);

    element.innerText = faksimile.index + 1;
    element.style.color = faksimile.Color;

  }

  onSelectFile(event: any) {
    var self = this;
    var file: File = event.target.files[0];
    var faksimile;
    this.imageOriginal = new MarvinImage();
    var imageProcessed = new MarvinImage();
    this.reader = new FileReader();

    if (file.type == "image/png" || file.type == "image/jpeg") {
      this.reader.readAsDataURL(file);

      this.reader.onloadend = function (e: any) {
        self.contain = self.reader.result;
        self.complete.next({
          fileContent: self.reader.result,
          fileName: file.name,
        });

        faksimile = new Faksimile("image", file.name, null, 1, null, false, null);
        self.fileService.addFaksimile(faksimile);
        var page: Pages = new Pages(1, faksimile.title, self.contain, imageProcessed);
        self.fileService.addPage(faksimile, page);
        self.imageOriginal.load(self.contain, imageLoaded);

        function imageLoaded() {
          imageProcessed = self.imageOriginal.clone();
          self.fileService.setActualContain(faksimile, page, imageProcessed);

          //self.imageProcessed = faksimile.actualcontain;

          self.generateMap(faksimile, 1);
          self.generateMinPreview(faksimile);
        }

      };
    }

    else
      if (file.type == "application/pdf") {
        this.reader.readAsArrayBuffer(file);

        this.reader.onloadend = function () {
          self.complete.next({
            fileName: file.name,
            fileContent: self.reader.result,
          });

          /**
           * Asynchronously downloads PDF.
           */
          pdfjsLib.getDocument({ data: this.result }).promise.then(function (pdfDoc_) {
            self.pdfDoc = pdfDoc_;
            
            // Initial/first page rendering
            self.renderPage(null, 1, file.name, self.pdfDoc.numPages, self.pdfDoc);
        
          });
        };
        


    }

   
   
  }

  vector;

  generateMap(faksimile: Faksimile, num: number) {
    if (num == null)
      num = 1;

    var imageProcessed = new MarvinImage();
    var containt: any = faksimile.pages[num - 1].actualcontain;

    var extent = [0, 0, containt.canvas.width, containt.canvas.height];
    var projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent
    });

    containt.draw(containt.canvas);

    var url = containt.canvas.toDataURL();

    var mapfk: MapFaksimile = this.getMap(faksimile.ID);
    if (mapfk != null) {
      var map = mapfk.map;
      var layers = mapfk.map.getLayers();
      // mapfk.map.removeLayer(layers.getArray()[0]);

      for (var i = layers.getArray().length - 1; i >= 0; --i) {
        mapfk.map.removeLayer(layers.getArray()[i]);
      }

      mapfk.map.removeOverlay(mapfk.map.getOverlays().getArray()[0]);
    }
    else {

      var map = new Map({
        target: 'card-block' + faksimile.ID,
        /*interactions: defaultInteractions().extend([
          new DragRotateAndZoom()
        ]),*/
        interactions: defaultInteractions({
          doubleClickZoom: false,
          dragPan: true,
          mouseWheelZoom: false,
        }),
        keyboardEventTarget: document,
        view: new View({
          projection: projection,
          center: getCenter(extent),
          zoom: 3,

        })
      });

      var legend = new Legend({
        title: faksimile.title,
        collapsed: true
      });


      var barbottomright = new Bar();
      map.addControl(barbottomright);
      barbottomright.setPosition("bottom-right");

      barbottomright.addControl(legend);

      var mapf = new MapFaksimile(map, faksimile);
      this.mapService.addMap(mapf);

    }




    var layer: any =
      new ImageLayer({
        source: new Static({
          url: url,
          // imageSize: [containt.canvas.width, containt.canvas.height],
          projection: projection,
          imageExtent: extent
        })
      });

    map.addLayer(layer);

    var source = new VectorSource({ wrapX: false });

    this.vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });


    map.addLayer(this.vector);


    var zoomslider = new ZoomSlider();
    map.addControl(zoomslider);
    faksimile.size = [containt.canvas.width, containt.canvas.height];
    //  map.setSize([containt.canvas.width, containt.canvas.height]);
    //map.updateSize();
    // Main control bar

    var barbottomleft = new Bar();
    map.addControl(barbottomleft);
    barbottomleft.setPosition("bottom-left");

    var zoommfactor = new TextButton(
      {
        html: ' Zoom: <input id= "zoom-div' + faksimile.ID + '" class= "fa fa-lg" style="width: 3em;" min="1" max="30" step="0.01" type="number" value="' + map.getView().getZoom() + '"> ',
        title: "Zoom factor",
        handleClick: function (event: any) {
          self.bindZoomInputs(event, faksimile);
        }

      });
    barbottomleft.addControl(zoommfactor);

    var mainbartopright = new Bar();
    map.addControl(mainbartopright);
    mainbartopright.setPosition("top-right");

    // Control


    var self = this;

    var hold = new Toggle(
      {
        html: '<i class="fa fa-check-circle"></i>',
        title: "Hold",
        active: faksimile.funqueueexecute,
        onToggle: function (active) {

          if (active) {
            // Remove and execute all items in the array
            faksimile.funqueueexecute = true;
            console.log("aktiv");
          }

          else {
            faksimile.funqueueexecute = false;
            // Remove all items in the array
            while (faksimile.funqueue.length > 0) {
              faksimile.funqueue.shift();
            }
            console.log("nicht aktiv");
          }
        }
      });

    mainbartopright.addControl(hold);

    var blackwhite = new Button(
      {
        html: '<i class="fa fa-adjust"></i>',
        title: 'Black and White',
        handleClick: function () {
          self.black_and_white(faksimile);
          self.fun_black_and_white = self.wrapFunction(self.black_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_black_and_white);
        }
      });
    mainbartopright.addControl(blackwhite);

    var red_white = new Button(
      {
        html: '<i class="fa fa-adjust" style="color:#ffc0cb;"></i>',
        title: 'Red and White',
        handleClick: function () {
          self.red_and_white(faksimile);
          self.fun_red_and_white = self.wrapFunction(self.red_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_red_and_white);
        }
      });
    mainbartopright.addControl(red_white);

    var blue_white = new Button(
      {
        html: '<i class="fa fa-adjust" style="color:#0000ff;"></i>',
        title: 'Blue and White',
        handleClick: function () {
          self.blue_and_white(faksimile);
          self.fun_blue_and_white = self.wrapFunction(self.blue_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_blue_and_white);
        }
      });
    mainbartopright.addControl(blue_white);

    var edgedetection = new Button(
      {
        html: '<i class="fa fa-music"></i>',
        title: 'Edge Detection',
        handleClick: function () {
          self.edge_detection(faksimile);
          self.fun_edge_detection = self.wrapFunction(self.edge_detection, self, [faksimile]);
          faksimile.funqueue.push(self.fun_edge_detection);
        }
      });
    mainbartopright.addControl(edgedetection);

    var removebackground = new Button(
      {
        html: '<i class="fa fa-eraser"></i>',
        title: 'Remove Background',
        handleClick: function () {
          self.remove_background(faksimile);
          self.fun_remove_background = self.wrapFunction(self.remove_background, self, [faksimile]);
          faksimile.funqueue.push(self.fun_remove_background);
        }
      });
    mainbartopright.addControl(removebackground);

    /* var movetofront = new Button(
       {
         html: '<i class="fa fa-clone"></i>',
         title: 'Move To Front',
         handleClick: function () {
           var canvas: any = document.getElementById('card-div' + faksimile.ID);
           canvas.style.zIndex = ++self.inc_index;
         
         }
       });
     mainbartopright.addControl(movetofront);*/
    var geometryFunction = createBox();
    var value = 'Circle';
    var draw = new Draw({
      source: source,
      type: value as GeometryType,
      geometryFunction: geometryFunction
    });

    var focusmap = new FocusMap();

    var transform_interaction = new Transform({
      addCondition: shiftKeyOnly
    });

    var delete_interaction = new Delete();

    var modify_interaction = new Modify({
      source: this.vector.getSource(),
      // insertVertexCondition: function(){ return false; }
    });

    var ele = document.createElement('div');
    var pos: OverlayPositioning = OverlayPositioning.TOP_LEFT;
    let crop = new Overlay({
      element: ele,
    });

    var ondrawend = function (e) {
     // console.log(e.feature.getGeometry().getCoordinates());
      var coord: [] = e.feature.getGeometry().getCoordinates()[0].slice(0, -1);
      var elem = crop.getElement();
      crop.setPosition(coord);
      drawCrop(elem, coord);
     

      console.log(coord, crop.getPosition(), crop.getPositioning());
    };

   /* var drawBox = new Toggle(
      {
        html: '<i class="fas fa-square"></i>',
        title: 'Draw Box',
        active: false,
        onToggle: function (active) {
          if (active) {
            modify.setActive(false);
            select.setActive(false);
            remove.setActive(false);
            map.removeInteraction(modify_interaction);
            map.removeInteraction(transform_interaction);
            map.removeInteraction(delete_interaction);
            map.removeInteraction(focusmap);
            draw.on('drawend', ondrawend);
            map.addInteraction(draw);
          }

          else {
            map.removeInteraction(draw);
          }
        }
      });
    mainbartopright.addControl(drawBox);*/

   /* var select = new Toggle(
      {
        html: '<i class="fas fa-expand-arrows-alt"></i>',
        title: 'Select Box',
        active: false,
        onToggle: function (active) {
          if (active) {
            drawBox.setActive(false);
            modify.setActive(false);
            remove.setActive(false);
            map.removeInteraction(draw);
            map.removeInteraction(modify_interaction);
            map.removeInteraction(delete_interaction);
            map.addInteraction(focusmap);
            map.addInteraction(transform_interaction);

            //map.addInteraction(draw);
          }

          else {
            //map.removeInteraction(draw);
          }
        }
      });
    mainbartopright.addControl(select);*/


    function drawCrop(ele, coords) {

      var margin = { top: 50, right: 280, bottom: 50, left: 280 },
        width = 600,
        height = 600;
       
     // var sourcePoints = [[0, 0], [width, 0], [width, height], [0, height]];
      //var targetPoints = [[0, 0], [width, 0], [width, height], [0, height]];



      var sourcePoints = coords;
      var targetPoints = coords;

      var svg = d3.select(ele).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var line = svg.selectAll(".line")
        .data(d3.range(0, width + 1, 40).map(function (x) { return [[x, 0], [x, height]]; })
          .concat(d3.range(0, height + 1, 40).map(function (y) { return [[0, y], [width, y]]; })))
        .enter().append("path")
        .attr("class", "line line--x");

      var handle = svg.selectAll(".handle")
        .data(targetPoints)
        .enter().append("circle")
        .attr("class", "handle")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 7)
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", dragged));

      d3.selectAll("button")
        .datum(function (d) { return JSON.parse((this as any).getAttribute("data-targets")); })
        .on("click", clicked)
        .call(transformed);

      function clicked(d) {
        d3.transition()
          .duration(750)
          .tween("points", function () {
            var i = d3.interpolate(targetPoints, d);
            return function (t) {
              handle.data(targetPoints = i(t)).attr("transform", function (d) { return "translate(" + d + ")"; });
              transformed();
            };
          });
      }

      function dragged(d) {
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        transformed();
      }

      function transformed() {
        for (var a = [], b = [], i = 0, n = sourcePoints.length; i < n; ++i) {
          var s = sourcePoints[i], t = targetPoints[i];
          a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
          a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);
        }

        var X = solve(a, b, true), matrix = [
          X[0], X[3], 0, X[6],
          X[1], X[4], 0, X[7],
          0, 0, 1, 0,
          X[2], X[5], 0, 1
        ].map(function (x) {
          return x;
        });

        line.attr("d", function (d) {
          return "M" + project(matrix, d[0]) + "L" + project(matrix, d[1]);
        });
      }

      // Given a 4x4 perspective transformation matrix, and a 2D point (a 2x1 vector),
      // applies the transformation matrix by converting the point to homogeneous
      // coordinates at z=0, post-multiplying, and then applying a perspective divide.
      function project(matrix, point) {
        point = multiply(matrix, [point[0], point[1], 0, 1]);
        return [point[0] / point[3], point[1] / point[3]];
      }

      // Post-multiply a 4x4 matrix in column-major order by a 4x1 column vector:
      // [ m0 m4 m8  m12 ]   [ v0 ]   [ x ]
      // [ m1 m5 m9  m13 ] * [ v1 ] = [ y ]
      // [ m2 m6 m10 m14 ]   [ v2 ]   [ z ]
      // [ m3 m7 m11 m15 ]   [ v3 ]   [ w ]
      function multiply(matrix, vector) {
        return [
          matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8] * vector[2] + matrix[12] * vector[3],
          matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9] * vector[2] + matrix[13] * vector[3],
          matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
          matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3]
        ];
      }

    }
  


   /* var select2 = new Toggle(
      {
        html: '<i class="fas fa-expand-arrows-alt"></i>',
        title: 'Select 2 Box',
        active: false,
        onToggle: function (active) {

          if (active) {
            map.addOverlay(crop);
            //drawCrop(ele);
            //map.addInteraction(selectClick);

            //map.addInteraction(draw);
          }

          else {
         
          }
        }
      });
    mainbartopright.addControl(select2);*/



  /*  var modify = new Toggle(
      {
        html: '<i class="fas fa-vector-square"></i>',
        title: 'Modify',
        active: false,
        onToggle: function (active) {
          if (active) {
            drawBox.setActive(false);
            select.setActive(false);
            remove.setActive(false);
            map.removeInteraction(draw);
            map.removeInteraction(transform_interaction);
            map.removeInteraction(delete_interaction);
            map.removeInteraction(focusmap);
            map.addInteraction(modify_interaction);          
          }

          else {
            map.removeInteraction(modify_interaction);
          }
        }
      });
    mainbartopright.addControl(modify);*/
   
    /*var remove = new Toggle(
      {
        html: '<i class="fas fa-trash"></i>',
        title: 'Remove Box',
        active: false,
        onToggle: function (active) {
          if (active) {
            drawBox.setActive(false);
            modify.setActive(false);
            select.setActive(false);
            map.removeInteraction(draw);
            map.removeInteraction(modify);
            map.removeInteraction(transform_interaction);
            map.addInteraction(delete_interaction);
            // map.addInteraction(transform);

            //map.addInteraction(draw);
          }

          else {
            map.removeInteraction(delete_interaction);
          }
        }
      });
    mainbartopright.addControl(remove);*/

   /* var swipe = new Toggle(
      {
        html: '<i class="fas fa-sliders-h"></i>',
        title: 'Swipe',
        active: false,
        onToggle: function (active) {
          if (active) {
            drawBox.setActive(false);
            modify.setActive(false);
            select.setActive(false);
            map.removeInteraction(draw);
            map.removeInteraction(modify);
            map.removeInteraction(transform_interaction);

            var ctrl = new Swipe();
            map.addControl(ctrl);
          }

          else {
           // map.removeInteraction(delete_interaction);
          }
        }
      });
    mainbartopright.addControl(swipe);*/

    var undo = new Button(
      {
        html: '<i class="fa fa-undo"></i>',
        title: 'Undo',
        handleClick: function () {
          map.removeInteraction(draw);
          self.imageOriginal.load(faksimile.pages[num-1].contain, imageLoaded);

          function imageLoaded() {
            imageProcessed = self.imageOriginal.clone();
            self.fileService.setActualContain(faksimile, faksimile.pages[num-1], imageProcessed);
            self.repaint(faksimile, num);
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
             imageExtent: extent
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
   
    mainbarbuttom.addControl(new FullScreen());
   
    if (faksimile.type == "pdf") {

      var synchronous_previous = new Button(
        {
          html: '<i class="fa fa-backward"></i>',
          title: "Previous",
          handleClick: function () {

            var faksimiles: Faksimile[] = self.fileService.getFaksimiles();


            for (let a of faksimiles) {
              if (a.actualPage <= 1) {
                return;
              }
              a.actualPage--;
              self.queueRenderPage(a, a.actualPage, a.title, a.numPages);
            }
          }
        });
      mainbarbuttom.addControl(synchronous_previous);

      var previous = new Button(
        {
          html: '<i class="fa fa-arrow-left"></i>',
          title: "Previous",
          handleClick: function () {
            if (faksimile.actualPage <= 1) {
              return;
            }
            faksimile.actualPage--;
            self.queueRenderPage(faksimile, faksimile.actualPage, faksimile.title, faksimile.numPages);


          }
        });
      mainbarbuttom.addControl(previous);


      var pagenum = new TextButton(
        {
          html: '<input class= "fa fa-lg" style="width: 2.5em;" type="number" value="' + faksimile.actualPage + '"> / ' + faksimile.numPages + '',
         // html: '<input [value]="pagenr" (input)="pagenr = $event.target.value" type="number" min = "1">',
          title: "Page number",
          handleClick: function (event: any) {	
            self.bindInputs(event, faksimile);
          }

        });
      mainbarbuttom.addControl(pagenum);

      var next = new Button(
        {
          html: '<i class="fa fa-arrow-right"></i>',
          title: "Next",
          handleClick: function () {
            if (faksimile.actualPage >= faksimile.numPages) {
              return;
            }
            faksimile.actualPage++;
            self.queueRenderPage(faksimile, faksimile.actualPage, faksimile.title, faksimile.numPages);

          }
        });
      mainbarbuttom.addControl(next);

      var synchronous_next = new Button(
        {
          html: '<i class="fa fa-forward"></i>',
          title: "Synchronous Next",
          handleClick: function () {
            var faksimiles: Faksimile[] = self.fileService.getFaksimiles();
            
         
            for (let a of faksimiles) {
              if (a.actualPage >= a.numPages) {
                return;
              }
              a.actualPage++;
              self.queueRenderPage(a, a.actualPage, a.title, a.numPages);
            }
            
          }
        });
      mainbarbuttom.addControl(synchronous_next);
    }


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

    var currZoom = map.getView().getZoom();
    map.on('moveend', function (e) {
      var newZoom = map.getView().getZoom();
      if (currZoom != newZoom) {
        console.log('zoom end, new zoom: ' + newZoom);
        currZoom = newZoom;
        var zoomdiv: any = document.getElementById("zoom-div" + faksimile.ID);
        currZoom = Math.round(currZoom * 100) / 100;
        zoomdiv.value = currZoom;
       
      }
    });

  
  }


  bindInputs(event: any, faksimile: Faksimile) {
    var idxInput = event.target;
    //var idxInput: any = document.getElementById(id + faksimile.ID);
   // idxInput.value = 1;
    var self = this;
    idxInput.onchange = function () {
      console.log(idxInput.value);
      if (idxInput.value > faksimile.numPages) {
        return;
      }
      if (idxInput.value <= 0) {
        return;
      }
      faksimile.actualPage = Number(idxInput.value);
      self.queueRenderPage(faksimile, faksimile.actualPage, faksimile.title, faksimile.numPages);

      //layer.setZIndex(parseInt(this.value, 10) || 0);
    };
    //idxInput.value = String(layer.getZIndex());
  }



  bindZoomInputs(event: any, faksimile: Faksimile) {
    var idxInput = event.target;
    //var idxInput: any = document.getElementById(id + faksimile.ID);
    // idxInput.value = 1;
    var self = this;
    idxInput.onchange = function () {
      console.log(idxInput.value);
      if (idxInput.value > 0) {
        var view = self.getMap(faksimile.ID).map.getView();
        var zoom = view.setZoom(idxInput.value);
        console.log("toom value: " + idxInput.value);
        console.log("zoom: " + zoom);
      }
    };

  }

  pageRendering = false;
  scale = 2;
  renderQueue = [];
/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
   queueRenderPage(faksimile: Faksimile, num: number, title: string, numPages: number) {
     if (this.pageRendering) {
       this.renderQueue.push(faksimile);
    }
   else {
     this.renderPage(faksimile, num, title, numPages, faksimile.pdfDoc);
     
    }
  }


  /**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
  renderPage(faksimile: Faksimile, num: number, filename: string, numPages: number, pdfDoc: any) {
    if (faksimile == null || typeof faksimile.pages[num-1] === "undefined" || typeof faksimile.pages[num-1].contain === "undefined") {
      var self = this;

      this.pageRendering = true;

      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function (page) {
        console.log('Page loaded');

        var viewport = page.getViewport({ scale: self.scale });

        // Prepare canvas using PDF page dimensions
        var canvas: any = document.createElement('canvas');

        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
          var src = canvas.toDataURL();

          if (faksimile == null) {
            faksimile = new Faksimile("pdf", filename, null, numPages, num, pdfDoc, false, null);
           
            var page: Pages = new Pages(num, faksimile.title, src, src);
            faksimile.pages.push(page);
            self.fileService.addFaksimile(faksimile);

          }

          else {
            var page: Pages = new Pages(num, faksimile.title, src, src);
            if (!self.fileService.checkPage(faksimile, page)) {
              self.fileService.addPage(faksimile, page);
            }
          }

          self.imageOriginal.load(src, imageLoaded);

          function imageLoaded() {
            var imageProcessed = self.imageOriginal.clone();
            self.fileService.setActualContain(faksimile, page, imageProcessed);
            imageProcessed = faksimile.pages[num - 1].actualcontain;
            if (faksimile.funqueueexecute) {
              for (let a of faksimile.funqueue) {
                (a)();
              }
            }

            else {
                while (faksimile.funqueue.length > 0) {
                  faksimile.funqueue.shift();
                }
            }
            self.generateMap(faksimile, num);
            self.generateMinPreview(faksimile);
          }

          var canvas_element = document.getElementsByName("canvas");
          canvas_element.forEach(function (element) {
            document.removeChild(element);
          });

          self.pageRendering = false;
          if (self.renderQueue.length!= 0) {
            // New page rendering is pending
            var renderFaksimile: Faksimile = self.renderQueue[0];
            self.renderPage(renderFaksimile, renderFaksimile.actualPage, renderFaksimile.title, renderFaksimile.numPages, renderFaksimile.pdfDoc);
            self.renderQueue.shift();
          }

          console.log('Page rendered');
        });
      });
    }

    else {
      if (faksimile.funqueueexecute) {
        for (let a of faksimile.funqueue) {
          (a)();
        }
      }
      else {
        while (faksimile.funqueue.length > 0) {
          faksimile.funqueue.shift();
        }
        
      }
      this.generateMap(faksimile, num);
      this.generateMinPreview(faksimile);
    }
}

 
 
}
