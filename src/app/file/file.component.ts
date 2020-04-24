import { Output, Component, EventEmitter, Injectable, Input } from '@angular/core';
import { FileService } from '../services/file.services';
import { MapService } from '../services/map.service';
import { Faksimile } from '../types/faksimile';


import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Projection from 'ol/proj/Projection.js';
import { Image as ImageLayer } from 'ol/layer.js';
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
import { Vector as VectorLayer, Layer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import FocusMap from 'ol-ext/interaction/FocusMap';
import Transform from 'ol-ext/interaction/Transform';
import Delete from 'ol-ext/interaction/Delete';
import { shiftKeyOnly } from 'ol/events/condition';
import { createRectFromCoords } from '../types/helpers';
import MousePosition from 'ol/control/MousePosition';


import mergeImages from 'merge-images';


import { getCenter } from 'ol/extent';



import { Stroke, Fill, Circle, Style } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';

import * as d3 from "d3";


import { Overlay } from 'ol';




declare var MarvinImage: any;
declare var Marvin: any;

declare var solve: any;

declare var pdfjsLib: any;


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

  svg: any;
  rect: any;
  g: any;




  mouseDown: boolean;
  preview: any;

  private relFactor: any;
  overlay: Overlay;

  htmlElement: HTMLElement;

  projection: any;


  constructor(private fileService: FileService, private mapService: MapService) {


    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function () {
      return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
          this.parentNode.insertBefore(this, firstChild);
        }
      });
    };
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
  }

  alphaBoundary = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var radius = 30;
    this.imageOriginal = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    imageProcessed = this.imageOriginal.clone();
    Marvin.alphaBoundary(this.imageOriginal, imageProcessed, radius);
    // Marvin.colorChannel(self.imageOriginal, imageProcessed, 139,0,0);
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);
  }

  setOpacity = function (faksimile: Faksimile, op: number, repaint: boolean) {
    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixel = imageData.data;

    var a = 3;
    for (var p = 0; p < pixel.length; p += 4) {
      pixel[p + a] = op;

    }
    imageProcessed = this.imageOriginal.clone();

    imageProcessed.imageData = imageData;
    // self.fileService.setActualContain(faksimile, self.imageProcessed);
    if (repaint)
      this.repaint(faksimile, faksimile.actualPage);
  }


  remove_whitePixel = function (img) {
    var imageProcessed = new MarvinImage();
    imageProcessed.load(img, loaded);
    var pixel;
    function loaded() {
      var imageData = imageProcessed.imageData;
      var pixel = imageData.data;

      var r = 0, g = 1, b = 2, a = 3;
      for (var p = 0; p < pixel.length; p += 4) {

        if (
          pixel[p + r] == 255 &&
          pixel[p + g] == 255 &&
          pixel[p + b] == 255) // if white then change alpha to 0
        { pixel[p + a] = 0; }
      }

    }
    return pixel;
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
  }

  remove_background_crop = function (cropImage: any) {
    var imageProcessed = new MarvinImage();
    var imageData = cropImage.imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] == 255 &&
        pixel[p + g] == 255 &&
        pixel[p + b] == 255) // if white then change alpha to 0
      { pixel[p + a] = 0; }
    }
    var canvas: any = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    imageProcessed.canvas = canvas;
    imageProcessed.imageData = imageData;

    return imageProcessed;

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

  setActualContain(faksimile: Faksimile, page: Pages, num, src) {
    var self = this;
    var imageOriginal = new MarvinImage();
    var imageProcessed = new MarvinImage();

    imageOriginal.load(src, imageLoaded);

    function imageLoaded() {
      imageProcessed = imageOriginal.clone();
      self.fileService.setActualContain(faksimile, page, imageProcessed);
      imageProcessed = faksimile.pages[num - 1].actualcontain;
      /* if (faksimile.funqueueexecute) {
         for (let a of faksimile.funqueue) {
           (a)();
         }
       }
 
       else {
         while (faksimile.funqueue.length > 0) {
           faksimile.funqueue.shift();
         }
       }*/
      self.generateMap(faksimile, num);
      self.generateMinPreview(faksimile);
    }
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

        faksimile = new Faksimile("image", file.name, null, 1, 1, false, null);
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


  private activateSVGMode(faksimile: Faksimile, map: Map) {
    var container = document.getElementById('card-block' + faksimile.ID);
    var mousePosition;
    container.addEventListener('mousemove', function (event) {
      mousePosition = map.getEventCoordinate(event);
    });
    var that = this;

    this.svg.on('click', drawingstarted).on('mousemove', drawpreview);
    //this.svg.append("g");
    var final: boolean = true;
    var point1: number[] = [];
    var point2: number[] = [];
    var cutCoord1;
    var cutCoord2;
    var mouseDown: boolean = false;
    var that = this;
    var preview;

    that.g = that.svg.append('g');


    function drawingstarted() {
     
      mouseDown = true;

      preview = d3.select("#flat").append('polygon')
        .classed('preview', true)
        .attr('points', function () { return ""; })
        .attr('fill', '#000000')
        .attr('fill-opacity', 0.1)
        ;

      if (!final) {
        final = true; faksimile
        point2 = d3.mouse(this);
        cutCoord2 = mousePosition.map(x => parseInt(x));
        cutCoord2[1] = faksimile.size[1] - cutCoord2[1];
        if (point1 !== []) {
          var coord = createRectFromCoords(point1, point2);
          var cutCoord = createRectFromCoords(cutCoord1, cutCoord2);
          //Anpassen!!
          faksimile.pages[faksimile.actualPage - 1].cropCoord = cutCoord;
          faksimile.pages[faksimile.actualPage - 1].minx = cutCoord[0][0];
          faksimile.pages[faksimile.actualPage - 1].miny = cutCoord[0][1];
          faksimile.pages[faksimile.actualPage - 1].maxx = cutCoord[3][0];
          faksimile.pages[faksimile.actualPage - 1].maxy = cutCoord[3][1];
          perspectiveTransformation(coord, faksimile, cutCoord);
          drawingended();
        }

      }
      else {
        final = false;
        point1 = d3.mouse(this);
        cutCoord1 = mousePosition.map(x => parseInt(x));
        cutCoord1[1] = faksimile.size[1] - cutCoord1[1];

      }
    }

    function perspectiveTransformation(coord, faksimile: Faksimile, cutCoord) {
      /* var mousePosition;
       container.addEventListener('mousemove', function (event) {
         mousePosition = map.getEventCoordinate(event);       
       });*/
      //that.coord = coord;
      that.svg.selectAll("circle").remove();
      
      that.svg.selectAll("image").remove();
      that.svg.selectAll(".line--x").remove();
      that.svg.selectAll(".line--y").remove();
      that.svg.selectAll(".handle").remove();
     


      var width = coord[1][0] - coord[0][0],
        height = coord[3][1] - coord[0][1];


      var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function (p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";

      var sourcePoints = [[0, 0], [width, 0], [width, height], [0, height]],
        targetPoints = [[0, 0], [width, 0], [width, height], [0, height]];

      that.g
        .attr("transform", "translate(" + coord[0][0] + "," + coord[0][1] + ")");

      var svgTransform = d3.select("#transform")
        .style(transform + "-origin", coord[0][0] + "px " + coord[0][1] + "px 0");

     

      var svgFlat = d3.select("#flat");

  

      if (faksimile.actualPage == null)
        faksimile.actualPage = 1;

      that.setOpacity(faksimile, 255, false);
      var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
      var cropImage = new MarvinImage();

      var cropWidth = cutCoord[1][0] - cutCoord[0][0];
      var cropHeight = cutCoord[3][1] - cutCoord[0][1];


      //crop Image and show preview
      Marvin.crop(containt.clone(), cropImage, cutCoord[0][0], cutCoord[0][1], cropWidth, cropHeight);
      cropImage.draw(cropImage.canvas);

      var imageWithoutBackground = that.remove_background_crop(cropImage);


      var url = imageWithoutBackground.canvas.toDataURL();


      transformed();

      svgTransform.select("g").append("image")
        .attr("xlink:href", url)
        .attr("width", width)
        .attr("height", height);

      svgTransform.select("g").selectAll(".line--x")
        .data(d3.range(0, width + 1, 40))
        .enter().append("line")
        .attr("class", "line line--x")
        .attr("x1", function (d) { return d; })
        .attr("x2", function (d) { return d; })
        .attr("y1", 0)
        .attr("y2", height);

      svgTransform.select("g").selectAll(".line--y")
        .data(d3.range(0, height + 1, 40))
        .enter().append("line")
        .attr("class", "line line--y")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", function (d) { return d; })
        .attr("y2", function (d) { return d; });

      var handle = svgFlat.select("g").selectAll(".handle")
        .data(targetPoints)
        .enter().append("circle")
         .attr("id", function (d,i) { return "" +i; })
        .attr("class", "handle")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 7)
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", dragged));


      function dragged(d) {
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        console.log("this: " + this.id);
        var id = this.id;
        var mousePosition;
        var self = this;
        container.addEventListener('pointerup', function (event) {
          mousePosition = map.getEventCoordinate(event);
          if (faksimile.pages[faksimile.actualPage - 1].minx > parseInt(mousePosition[0]))
            faksimile.pages[faksimile.actualPage - 1].minx = parseInt(mousePosition[0]);
          if (faksimile.pages[faksimile.actualPage - 1].miny > (faksimile.size[1]-parseInt(mousePosition[1])))
            faksimile.pages[faksimile.actualPage - 1].miny = faksimile.size[1]-parseInt(mousePosition[1]);
          if (faksimile.pages[faksimile.actualPage - 1].maxx < parseInt(mousePosition[0]))
            faksimile.pages[faksimile.actualPage - 1].maxx = parseInt(mousePosition[0]);
          if (faksimile.pages[faksimile.actualPage - 1].maxy < (faksimile.size[1]-parseInt(mousePosition[1])))
            faksimile.pages[faksimile.actualPage - 1].maxy = faksimile.size[1]-parseInt(mousePosition[1]);
          //faksimile.pages[faksimile.actualPage - 1].cropCoord[id][0] = parseInt(mousePosition[0]);
          //faksimile.pages[faksimile.actualPage - 1].cropCoord[id][1] = faksimile.size[1]-parseInt(mousePosition[1]);
         // cutCoord[self.id] = mousePosition;
          console.log("cutCoord, mousePosition: " + id + " "+ cutCoord +  " ");
          container.removeEventListener('pointerup', function (event) { });
          
        });
        transformed();
        // faksimile.pages[faksimile.actualPage - 1].cropCoord = cutCoord;
       
        
      }

      function transformed() {
        container.removeEventListener('pointerup', function (event) {  });
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


        svgTransform.style(transform, "matrix3d(" + matrix + ")");

      }

    }

    function drawpreview() {
      if (mouseDown) {
        point2 = d3.mouse(this);
        var previewPoints = createRectFromCoords(point1, point2);
        preview.attr('points', function () {
          return previewPoints;
        });
      }
    }

    function drawingended() {
      mouseDown = false;
      point1 = null;
      point2 = null;
      cutCoord1 = null;
      cutCoord2 = null;
      that.svg.selectAll('polygon').remove();
      //that.g.select('polygon.preview').style('visibility', 'hidden');
    }

  }


  buildOverlaySVG(map: Map, faksimile: Faksimile) {

    var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
   // d3.select("#overlay" + faksimile.ID).node();

    //this.relFactor = 1;//(this.containerWidth - 10) / this.width;
    //self.aspectRatio = self.containerWidth / containerWidth;
   // var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function (p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";

    this.svg = d3.select("#overlay" + faksimile.ID).selectAll("svg")
      .data(["transform", "flat"])
      .enter()
      .append("svg")
      .attr("id", function (d) { return d; })
      .attr('viewBox', '0 0 ' + containt.canvas.width / map.getView().getResolution() + ' ' + containt.canvas.height / map.getView().getResolution())
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr("width", containt.canvas.width / map.getView().getResolution())//* map.getView().getZoom()))
      .attr("height", containt.canvas.height / map.getView().getResolution())
      .classed("svg-content", true);// * map.getView().getZoom()));


  }

  resetOverlaySVG(map: Map, faksimile: Faksimile) {
    d3.select("#card-block" + faksimile.ID).selectAll("svg").remove();
  }


  repaintSVG(map: Map, faksimile: Faksimile) {
    var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
   // var coord = this.coord;

    var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function (p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";


    var svg = d3.select("#overlay" + faksimile.ID).selectAll("svg");
    svg.call(move);
    var self = this;

    function move() {
    }

  }

  mousePosition: MousePosition;
  generateMap(faksimile: Faksimile, num: number) {
    if (num == null)
      num = 1;

    var imageProcessed = new MarvinImage();
    if (typeof faksimile.pages[num - 1] == "undefined")
      return;
    var containt: any = faksimile.pages[num - 1].actualcontain;

    var extent = [0, 0, containt.canvas.width, containt.canvas.height];
    this.projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent
    });
    var projection = this.projection;
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
      //Es ist wichtig für die Lupefunktion
      // mapfk.map.removeOverlay(mapfk.map.getOverlays().getArray()[0]);
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

    // var imgdiv: any = d3.select('#' + map.getTarget()).node();
    // this.containerWidth = imgdiv.getBoundingClientRect().width;
    // this.containerHeight = imgdiv.getBoundingClientRect().height;

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

    /*this.mousePosition = new MousePosition({
      coordinateFormat: createStringXY(2),
      projection: projection,
      target: document.getElementById('card-block' + faksimile.ID),
      undefinedHTML: '&nbsp;'
    });

    map.addControl(this.mousePosition);*/


    var zoomslider = new ZoomSlider();
    map.addControl(zoomslider);
    faksimile.size = [containt.canvas.width, containt.canvas.height];


    var bartop = new Bar();
    map.addControl(bartop);
    bartop.setPosition("top");

    var zoommfactor = new TextButton(
      {
        html: ' Zoom: <input id="zoom-div' + faksimile.ID + '" class= "fa fa-lg" style="width: 3em;" min="1" max="30" step="0.01" type="number" value="' + map.getView().getZoom() + '"> ',
        title: "Zoom factor",
        handleClick: function (event: any) {
          self.bindZoomInputs(event, faksimile);
        }

      });
    bartop.addControl(zoommfactor);

    var rotation = new TextButton(
      {
        html: ' Rotation: <input id= "rotation-div' + faksimile.ID + '" class= "fa fa-lg" style="width: 3em;" min="-360" max="360" step="1.0" type="number" value="' + map.getView().getRotation() * 180 / Math.PI + '"> ',
        title: "Rotation",
        handleClick: function (event: any) {
          self.bindRotationInputs(event, faksimile);
        }

      });
    bartop.addControl(rotation);

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

    var self = this;


    var overlay = new Overlay({
      element: document.getElementById('overlay' + faksimile.ID),
    });

    var element = overlay.getElement();
    element.innerHTML = "";
    overlay.setPosition([0, faksimile.size[1]]);

    // and add it to the map
    map.addOverlay(overlay);


    var drawBox = new Toggle(
      {
        html: '<i class="fas fa-border-all"></i>',
        title: 'Perspective Transformation',
        active: false,
        onToggle: function (active) {
          if (active) {

            mergeArea.setActive(false);

            map.removeInteraction(modify_interaction);
            map.removeInteraction(transform_interaction);
            map.removeInteraction(delete_interaction);
            map.removeInteraction(focusmap);

            self.setOpacity(faksimile, 170, true);

            self.resetOverlaySVG(map, faksimile);
            self.buildOverlaySVG(map, faksimile);


            self.activateSVGMode(faksimile, map);


          }


          else {
            //self.resetOverlaySVG(map, faksimile);
            //map.un("click", mapclick);
            self.svg.on('click', null).on('mousemove', null);
          }
        }
      });
    mainbartopright.addControl(drawBox);

    function getSVGString(svgNode, width, height ) {
      svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
      svgNode.setAttribute("width", width);
      svgNode.setAttribute("height", height);
      var cssStyleText = getCSSStyles(svgNode);
      appendCSS(cssStyleText, svgNode);

      var serializer = new XMLSerializer();
      var svgString = serializer.serializeToString(svgNode);
      svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
      svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

      return svgString;

      function getCSSStyles(parentElement) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (var c = 0; c < parentElement.classList.length; c++)
          if (!contains('.' + parentElement.classList[c], selectorTextArr))
            selectorTextArr.push('.' + parentElement.classList[c]);

        // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
          var id = nodes[i].id;
          if (!contains('#' + id, selectorTextArr))
            selectorTextArr.push('#' + id);

          var classes = nodes[i].classList;
          for (var c = 0; c < classes.length; c++)
            if (!contains('.' + classes[c], selectorTextArr))
              selectorTextArr.push('.' + classes[c]);
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
          var s = <CSSStyleSheet>document.styleSheets[i];

          try {
            if (!s.cssRules) continue;
          } catch (e) {
            if (e.name !== 'SecurityError') throw e; // for Firefox
            continue;
          }

          var cssRules = s.cssRules;
          for (var r = 0; r < cssRules.length; r++) {
            if (contains((cssRules[r] as CSSStyleRule).selectorText, selectorTextArr))
            extractedCSSText += cssRules[r].cssText;
          }
        }


        return extractedCSSText;

        function contains(str, arr) {
          return arr.indexOf(str) === -1 ? false : true;
        }

      }

      function appendCSS(cssText, element) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
      }
    }

    function svgString2Image(svgString, width, height, format, callback, map: Map) {
      var format = format ? format : 'png';

      var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      var image = new Image();
      image.src = imgsrc;
      var url;
      image.onload = function () {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        url = context.canvas.toDataURL();
        if (callback) callback(url);
        //return url;



      };

      //= imgsrc;
    }


    function save(url) {
      self.cropImageString(url, faksimile, map);

    }



    var mergeArea = new Toggle(
      {
        html: '<i class="fas fa-link"></i>',
        title: 'Merge Area',
        active: false,
        onToggle: function (active) {
          if (active) {
            drawBox.setActive(false);
            //remove.setActive(false);
            map.removeInteraction(draw);
            map.removeInteraction(modify_interaction);
            map.removeInteraction(delete_interaction);
            map.addInteraction(focusmap);
            map.addInteraction(transform_interaction);

            self.setOpacity(faksimile, 255, true);

            self.svg.selectAll("circle").remove();

            self.svg.selectAll(".line--x").remove();
            self.svg.selectAll(".line--y").remove();

            var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;


            var svgString = getSVGString(self.svg.node(), containt.canvas.width / map.getView().getResolution(), containt.canvas.height / map.getView().getResolution());


        
            var cropImageString = svgString2Image(svgString, containt.canvas.width, containt.canvas.height, 'png', save, map); // passes Blob and filesize String to the callback


          }

          else {
            //map.removeInteraction(draw);
          }
        }
      });
    mainbartopright.addControl(mergeArea);





    var undo = new Button(
      {
        html: '<i class="fa fa-undo"></i>',
        title: 'Undo',
        handleClick: function () {
          map.removeInteraction(draw);
          self.imageOriginal.load(faksimile.pages[num - 1].contain, imageLoaded);

          function imageLoaded() {
            imageProcessed = self.imageOriginal.clone();
            self.fileService.setActualContain(faksimile, faksimile.pages[num - 1], imageProcessed);
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

    // var mainbarbuttom = new Bar();
    //map.addControl(mainbarbuttom);
    //mainbarbuttom.setPosition("top-right");

    // mainbar.addControl(new Magnify(faksimile, map));

    bartop.addControl(new FullScreen());

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
      bartop.addControl(synchronous_previous);

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
      bartop.addControl(previous);


      var pagenum = new TextButton(
        {
          html: '<input class= "fa fa-lg" style="width: 2.5em;" type="number" value="' + faksimile.actualPage + '"> / ' + faksimile.numPages + '',
          // html: '<input [value]="pagenr" (input)="pagenr = $event.target.value" type="number" min = "1">',
          title: "Page number",
          handleClick: function (event: any) {
            self.bindInputs(event, faksimile);
          }

        });
      bartop.addControl(pagenum);

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
      bartop.addControl(next);

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
      bartop.addControl(synchronous_next);
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
    bartop.addControl(close);

    var currRotation = map.getView().getRotation();
    var currZoom = map.getView().getZoom();
    map.on('postrender', function (e) {
      map.set("frameState", e.frameState);
    });


    map.on('moveend', function (e) {
      map.set("frameState", e.frameState);
      //Repant SVG
      //self.repaintSVG(map, faksimile);
      var newZoom = map.getView().getZoom();
      var newRotation = map.getView().getRotation();
      if (currZoom != newZoom) {
        currZoom = newZoom;
        var zoomdiv: any = document.getElementById("zoom-div" + faksimile.ID);
        currZoom = Math.round(currZoom * 100) / 100;
        zoomdiv.value = currZoom;
        

      }
      if (currRotation != newRotation) {
        currRotation = newRotation;
        var rotationdiv: any = document.getElementById("rotation-div" + faksimile.ID);
        var rotationDegree = currRotation * (180 / Math.PI);
        rotationdiv.value = rotationDegree;

      }
    });


  }

  cropImageString(cropImageString, faksimile: Faksimile, map: Map): any {
    var cropImage1 = new MarvinImage();
    cropImage1.load(cropImageString, imageLoaded);
    var cropCoord = faksimile.pages[faksimile.actualPage - 1].cropCoord;
    var url;
    var self = this;
    function imageLoaded() {
      var cropImage = new MarvinImage();

      var cropWidth = cropCoord[1][0] - cropCoord[0][0];
      var cropHeight = cropCoord[3][1] - cropCoord[0][1];


      var minx = faksimile.pages[faksimile.actualPage - 1].minx;
      var miny = faksimile.pages[faksimile.actualPage - 1].miny;
      var maxx = faksimile.pages[faksimile.actualPage - 1].maxx;
      var maxy = faksimile.pages[faksimile.actualPage - 1].maxy;
      

      console.log("minx: " + minx);
      console.log("miny: " + miny);
      console.log("maxx: " + maxx);
      console.log("maxy: " + maxy);
      console.log("cropCoord[0][0]: " + cropCoord[0][0]);
      console.log("cropCoord[0][1]: " + cropCoord[0][1]);
      Marvin.crop(cropImage1.clone(), cropImage, minx, miny, maxx-minx, maxy-miny);

      cropImage.draw(cropImage.canvas);


      url = cropImage.canvas.toDataURL();


      var origImage: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
      var origImgUrl = origImage.canvas.toDataURL();

      var blankImage: any = document.createElement("canvas");
      var ctx = blankImage.getContext("2d");

      var imgData = ctx.createImageData(cropWidth / map.getView().getResolution(), cropHeight / map.getView().getResolution());
     

      /*  var counter;
        for (counter = 0; counter < imgData.data.length; counter += 4) {
          imgData.data[counter + 0] = 255;
          imgData.data[counter + 1] = 255;
          imgData.data[counter + 2] = 255;
          imgData.data[counter + 3] = 255;
        }
        */
      ctx.putImageData(imgData, 0, 0);
      var blankURL = ctx.canvas.toDataURL();

      var mergedImage = mergeImages([
        { src: origImgUrl, x: 0, y: 0, },
        { src: blankURL, x: minx, y: miny, },]).then((img) => {
          //var arrayBuffer = self.remove_whitePixel(img);
          //var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));

          mergeImages([
            { src: img, x: 0, y: 0, },
            { src: url, x: minx, y: miny, },]).then((img2) => {
              self.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], faksimile.actualPage, img2);
            });
        });

      /* var mergedImage = mergeImages([
         { src: origImgUrl, x: 0, y: 0, },
         { src: url, x: minx, y: miny, },]).then((img) => {
           self.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], faksimile.actualPage, img);
         });  */
    }
    return url;
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
      if (idxInput.value > 0) {
        var view = self.getMap(faksimile.ID).map.getView();
        var zoom = view.setZoom(idxInput.value);
      }
    };
  }

  bindRotationInputs(event: any, faksimile: Faksimile) {
    var idxInput = event.target;
    //var idxInput: any = document.getElementById(id + faksimile.ID);
    // idxInput.value = 1;
    var self = this;
    idxInput.onchange = function () {
      if (idxInput.value > -361 && idxInput.value < 361) {
        var view = self.getMap(faksimile.ID).map.getView();
        var rotation = view.setRotation(idxInput.value * (Math.PI / 180));
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
    if (faksimile === null || typeof faksimile.pages[num - 1] === "undefined" || typeof faksimile.pages[num - 1].contain === "undefined" || typeof faksimile.pages[num - 1].actualcontain === "undefined") {

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
          if (self.renderQueue.length != 0) {
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
      this.generateMap(faksimile, num);
      this.generateMinPreview(faksimile);
    }

    /* else {
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
      }*/
  }



}
