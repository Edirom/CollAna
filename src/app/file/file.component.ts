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
import { Attribution, defaults as defaultControls } from 'ol/control';
import { FullScreen, Rotate } from 'ol/control.js';
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
import { saveAs } from 'file-saver';

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
  //routerLink="/import"
@Component({
  selector: 'fileservice',
    template: '<div fxLayoutGap="10px"> <div class="btn btn-file btn-outline-primary" data-toggle="tooltip" data-placement="right" title="Import"><i class= "fa fa-download fa-lg" > </i><span class= "hidden-xs-down" > </span><input type="file"  #fileUpload (click)="fileUpload.value = null"(change)="onSelectFile($event)" accept=".jpg, .png, .pdf" /></div></div>',
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

  //projection: any;


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
  fun_green_and_white;
  fun_beige_and_white;
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

    this.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], faksimile.actualPage - 1,  imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);

  }

  beige_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] != 255 ||
        pixel[p + g] != 255 ||
        pixel[p + b] != 255) {
        pixel[p + r] = 232;
        pixel[p + g] = 189;
        pixel[p + b] = 130;
        pixel[p + a] = 170;
      }
    }
    imageProcessed = this.imageOriginal.clone();

    imageProcessed.imageData = imageData;
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);

  }

  green_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixel = imageData.data;

    var r = 0, g = 1, b = 2, a = 3;
    for (var p = 0; p < pixel.length; p += 4) {

      if (
        pixel[p + r] != 255 ||
        pixel[p + g] != 255 ||
        pixel[p + b] != 255) {
        pixel[p + r] = 118;
        pixel[p + g] = 167;
        pixel[p + b] = 56;
        pixel[p + a] = 170;
      }
    }
    imageProcessed = this.imageOriginal.clone();

    imageProcessed.imageData = imageData;
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.repaint(faksimile, faksimile.actualPage);

  }

  red_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var actualcontain = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    var imageData = actualcontain.imageData;
  
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
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);

    this.repaint(faksimile, faksimile.actualPage);

  }

  black_and_white = function (faksimile: Faksimile) {
    var imageProcessed = new MarvinImage();
    var level = 30;
    this.imageOriginal = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    this.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], this.imageOriginal);
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
    this.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], this.imageOriginal);
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
    this.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], this.imageOriginal);
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

  exportPNG(map: Map, faksimile: Faksimile) {
    //let downloadLink = document.createElement('a');
   // downloadLink.setAttribute('download', 'CanvasAsImage.png');
    var children = document.getElementById('card-block' + faksimile.ID).children;
    //Einen schöneren Weg finden!!!
    var canvas = <HTMLCanvasElement>children.item(0).children.item(0);

    var input = faksimile.title;
    var output = input.substr(0, input.lastIndexOf('.')) || input;
      canvas.toBlob(function (blob) {
        saveAs(blob, output + "_" + "Page" + faksimile.actualPage + ".png");
    });
  }


  updateMinPreview() {
    var self = this;
   
    this.fileService.getFaksimiles().forEach(function (a) {
      self.generateMinPreview(a);
     // var element: any = document.getElementById("mini-card-canvas" + a.ID);
      //element.style.color = a.Color;
    })
  }

  generateMinPreview(faksimile: Faksimile) {


    var element: any = document.getElementById("mini-card-canvas" + faksimile.ID);

    element.innerText = faksimile.index + 1;
   // element.style.color = faksimile.Color;

    var element_ol_box: any = document.getElementsByClassName("ol-unselectable ol-control ol-bar ol-top");
    var elem_array = Array.prototype.slice.call(element_ol_box);
    elem_array.forEach(function (a) {
      if (a.offsetParent.offsetParent.id == "card-block" + faksimile.ID) {
        a.style.borderColor = faksimile.Color;
      }
    });
   // elem_array.forEach(a => a.style.color = faksimile.Color);
    //element_ol_box.style.border = faksimile.Color;


  }

  onSelectFile(event: any) {
    //this.fileService.getFaksimiles().forEach(a => this.generateMap(a, a.actualPage));

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
          self.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
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
    this.resetOverlaySVG(map, faksimile);
    this.buildOverlaySVG(map, faksimile);
    var container = document.getElementById('card-block' + faksimile.ID);
    var mousePosition;
    container.addEventListener('mousemove', function (event) {
      mousePosition = map.getEventCoordinate(event);
    });
    var that = this;
   
    this.svg.selectAll("g").remove();
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
  
    this.g = this.svg.append('g');


    function drawingstarted() {

      that.svg.selectAll("image").remove();
      that.svg.selectAll(".line--x").remove();
      that.svg.selectAll(".line--y").remove();
      that.svg.selectAll(".handle").remove();
      that.svg.selectAll(".handlemiddle").remove();
      that.svg.selectAll(".draggable").remove();

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
          faksimile.pages[faksimile.actualPage - 1].maxx = cutCoord[1][0];
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


      that.svg.selectAll("image").remove();
      that.svg.selectAll(".line--x").remove();
      that.svg.selectAll(".line--y").remove();
      that.svg.selectAll(".handle").remove();
      that.svg.selectAll(".draggable").remove();
      that.svg.selectAll(".handlemiddle").remove();


      var width = coord[1][0] - coord[0][0],
        height = coord[3][1] - coord[0][1];

     
      var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function (p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";

      var sourcePoints = [[0, 0], [width, 0], [width, height], [0, height]];

      var targetPoints = [[0, 0], [width, 0], [width, height], [0, height]];



      var center = [[(targetPoints[2][0] - targetPoints[0][0]) / 2, (targetPoints[2][1] - targetPoints[0][1]) / 2]];

      that.g
        .attr("transform", "translate(" + coord[0][0] + "," + coord[0][1] + ")");

      var svgTransform = d3.select("#transform")
        .style(transform + "-origin", coord[0][0] + "px " + coord[0][1] + "px 0");

      svgTransform.style(transform, "matrix(1, 0, 0, 1, 0, 0)");

      var svgFlat = d3.select("#flat");

      if (faksimile.actualPage == null)
        faksimile.actualPage = 1;

      that.setOpacity(faksimile, 255, false);
      var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
      //var cropImage = new MarvinImage();

      var cropWidth = cutCoord[1][0] - cutCoord[0][0];
      var cropHeight = cutCoord[3][1] - cutCoord[0][1];


     // var cropImage = containt.clone();
      var cropImage = new MarvinImage();
      Marvin.crop(containt.clone(), cropImage, cutCoord[0][0], cutCoord[0][1], cropWidth, cropHeight);
      cropImage.canvas.getContext("2d").clearRect(0, 0, cropWidth, cropHeight);
      cropImage.draw(cropImage.canvas);

     

      //crop Image and show preview
      //Marvin.crop(containt.clone(), cropImage, cutCoord[0][0], cutCoord[0][1], cropWidth, cropHeight);
      //cropImage.draw(cropImage.canvas);

      var imageWithoutBackground = that.remove_background_crop(cropImage);


      var url = imageWithoutBackground.canvas.toDataURL();

     


      //transformed();


      svgTransform.select("g")
        .append("image")
        .attr("xlink:href", url)
        .attr("x", "0")
        .attr("y", "0")
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



     
      var xPoint = [d3.range(0, width + 1, 80)];
      var yPoint = [d3.range(0, height + 1, 80)];

      var targetPointsMiddle = new Array((xPoint[0].length-1) * (yPoint[0].length-1));

      for (var i = 0; i < targetPointsMiddle.length; i++) {
        targetPointsMiddle[i] = new Array(2);
      }

      for (var i = 0; i < targetPointsMiddle.length; i++) {
        for (var x = 1; x < xPoint[0].length; x++) {
          for (var y = 1; y < yPoint[0].length; y++) {
            targetPointsMiddle[i][0] = xPoint[0][x];
            targetPointsMiddle[i][1] = yPoint[0][y];
            i++;
          }
         
        }
      
      }
      console.log(targetPointsMiddle);
      var targetpoint2 = targetPoints.concat(targetPointsMiddle);

      var handle = svgFlat.select("g").selectAll(".handle")
        .data(targetPoints)
        .enter().append("circle")
        .attr("id", function (d, i) { return "" + i; })
        .attr("class", "handle")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 5)
        .on('mouseover', function (d, i) {
          // make the mouseover'd element
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 20);
        })
        .on('mouseout', function (d, i) {
          // return the mouseover'd element
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 5);
        })
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", dragged));

      var handleMiddlePoints = svgTransform.select("g").selectAll(".handlemiddle")
        .data(targetPointsMiddle)
        .enter().append("circle")
        .attr("id", function (d, i) { return "" + i; })
        .attr("class", "handlemiddle")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 5)
        .on('mouseover', function (d, i) {
          // make the mouseover'd element
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 20);
        })
        .on('mouseout', function (d, i) {
          // return the mouseover'd element
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 5);
        })
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", draggedMiddlePoints));


      svgFlat.select("g").selectAll(".draggable")
        .data(center)
        .enter().append("circle")
        .attr("id", function (d, i) { return "" + i; })
        .attr("class", "draggable")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 5)
        .on('mouseover', function (d, i) {
          // make the mouseover'd element
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 20);
        })
        .on('mouseout', function (d, i) {
          // return the mouseover'd element
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 5);
        })
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", draggedcenter));

     
      //transformed();
     /* d3.transition()
        .duration(750)
        .tween("points", function () {
          var i = d3.interpolate(targetPoints, d);
          return function (t) {
            handle.data(targetPoints = i(t)).attr("transform", function (d) { return "translate(" + d + ")"; });
            transformed();
          };
        });*/

      function draggedcenter(d) {
        var xdistance = 0;
        var ydistance = 0;
        if (d[0] != d3.event.x)
           xdistance = d[0] - d3.event.x;
        if (d[1] != d3.event.y)
           ydistance = d[1] - d3.event.y;
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        center = [[d[0], d[1]]]
        movetargets(xdistance, ydistance);
      }

      function movetargets(xdis, ydis) {
        // targetPoints = [[0, 0], [width, 0], [width, height], [0, height]];

        for (var i = 0, n = targetPoints.length; i < n; ++i) {
          targetPoints[i][0] = targetPoints[i][0] - xdis;
          targetPoints[i][1] = targetPoints[i][1] - ydis;
          //d3.select("[id = '" + i + "']").attr("transform", "translate(" + (targetpoint2[i][0]) + "," + (targetpoint2[i][1]) + ")");
          d3.select(".handle[id = '" + i + "']").attr("transform", "translate(" + (targetPoints[i][0]) + "," + (targetPoints[i][1]) + ")");
         
        }
       

       /* for (var i = 0, n = targetPointsMiddle.length; i < n; ++i) {
          targetPointsMiddle[i][0] = targetPointsMiddle[i][0] - xdis;
          targetPointsMiddle[i][1] = targetPointsMiddle[i][1] - ydis;
          //d3.select("[id = '" + i + "']").attr("transform", "translate(" + (targetpoint2[i][0]) + "," + (targetpoint2[i][1]) + ")");
          d3.select(".handlemiddle[id = '" + i + "']").attr("transform", "translate(" + (targetPointsMiddle[i][0]) + "," + (targetPointsMiddle[i][1]) + ")");     
        }*/
        transformed();
     }

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

      function draggedMiddlePoints(d) {
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        console.log("this: " + this.id);
        var id = this.id;
        var mousePosition;
        var self = this;
        container.addEventListener('pointerup', function (event) {
          mousePosition = map.getEventCoordinate(event);
          if (faksimile.pages[faksimile.actualPage - 1].minx > parseInt(mousePosition[0]))
            faksimile.pages[faksimile.actualPage - 1].minx = parseInt(mousePosition[0]);
          if (faksimile.pages[faksimile.actualPage - 1].miny > (faksimile.size[1] - parseInt(mousePosition[1])))
            faksimile.pages[faksimile.actualPage - 1].miny = faksimile.size[1] - parseInt(mousePosition[1]);
          if (faksimile.pages[faksimile.actualPage - 1].maxx < parseInt(mousePosition[0]))
            faksimile.pages[faksimile.actualPage - 1].maxx = parseInt(mousePosition[0]);
          if (faksimile.pages[faksimile.actualPage - 1].maxy < (faksimile.size[1] - parseInt(mousePosition[1])))
            faksimile.pages[faksimile.actualPage - 1].maxy = faksimile.size[1] - parseInt(mousePosition[1]);
          //faksimile.pages[faksimile.actualPage - 1].cropCoord[id][0] = parseInt(mousePosition[0]);
          //faksimile.pages[faksimile.actualPage - 1].cropCoord[id][1] = faksimile.size[1]-parseInt(mousePosition[1]);
          // cutCoord[self.id] = mousePosition;
          console.log("cutCoord, mousePosition: " + id + " " + cutCoord + " ");
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
      that.svg.selectAll('g').select("#flat")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 7)
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", dragged));
      //that.g.select('polygon.preview').style('visibility', 'hidden');
    }
    function dragged(d) {
      d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
      
    }


  }


  buildOverlaySVG(map: Map, faksimile: Faksimile) {

    var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
   // d3.select("#overlay" + faksimile.ID).node();

    //this.relFactor = 1;//(this.containerWidth - 10) / this.width;
    //self.aspectRatio = self.containerWidth / containerWidth;
    // var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function (p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";
    d3.select("#overlay" + faksimile.ID).selectAll("svg").remove();
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




  mousePosition: MousePosition;
  generateMap(faksimile: Faksimile, num: number) {
    if (num == null)
      num = 1;

    var imageProcessed = new MarvinImage();
    if (typeof faksimile.pages[num - 1] == "undefined")
      return;
    var containt: any = faksimile.pages[num - 1].actualcontain;

    var extent = [0, 0, containt.canvas.width, containt.canvas.height];
    var projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent
    });
  //  var projection = this.projection;
    containt.draw(containt.canvas);

    var url = containt.canvas.toDataURL();

    var mapfk: MapFaksimile = this.getMap(faksimile.ID);
    if (mapfk != null) {
      var map = mapfk.map;
      var layers = mapfk.map.getLayers();
      

      for (var i = layers.getArray().length - 1; i >= 0; --i) {
        mapfk.map.removeLayer(layers.getArray()[i]);
      }
      //Es ist wichtig für die Lupefunktion
      // mapfk.map.removeOverlay(mapfk.map.getOverlays().getArray()[0]);
    }
    else {


      var zoomFactorDelta = 100;


      var map = new Map({
        target: 'card-block' + faksimile.ID,
        
        /*interactions: defaultInteractions().extend([
          new DragRotateAndZoom()
        ]),*/
     
        interactions: defaultInteractions({
          doubleClickZoom: false,
          dragPan: true,
          mouseWheelZoom: false,
          constrainResolution: true,
        }),
        keyboardEventTarget: document,
        view: new View({
          resolution: 1,        // important for 100% image size!
          //maxResolution: 300, 
          projection: projection,
          center: getCenter(extent),
          
          zoomFactor: Math.pow(2, 1 / zoomFactorDelta),
          zoom:300,

        })
      });

  

      var mapf = new MapFaksimile(map, faksimile);
      this.mapService.addMap(mapf);

    }



    var layer: any =
      new ImageLayer({
        source: new Static({
          url: url,
          //imageSize: [containt.canvas.width, containt.canvas.height],
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



    var bartop = new Bar();
    map.addControl(bartop);
    bartop.setPosition("top");

    var legend = new Legend({
      title: faksimile.title,
      collapsed: false
    });


    bartop.addControl(legend);
    var zoommfactor = new TextButton(
      {
        html: ' Zoom: <input id="zoom-div' + faksimile.ID + '" class= "fa fa-lg" style="width: 3em;" min="1" max="3000" step="1" type="number" value="' + map.getView().getZoom() + '"> ',
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
    mainbartopright.set("id", "bar " + faksimile.ID);

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
          }

          else {
            faksimile.funqueueexecute = false;
            // Remove all items in the array
            while (faksimile.funqueue.length > 0) {
              faksimile.funqueue.shift();
            }
           
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
          self.black_and_white(faksimile);
          self.red_and_white(faksimile);
          self.fun_black_and_white = self.wrapFunction(self.black_and_white, self, [faksimile]);
          self.fun_red_and_white = self.wrapFunction(self.red_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_black_and_white);
          faksimile.funqueue.push(self.fun_red_and_white);

        }
      });
    mainbartopright.addControl(red_white);

    var blue_white = new Button(
      {
        html: '<i class="fa fa-adjust" style="color:#0000ff;"></i>',
        title: 'Blue and White',
        handleClick: function () {
          self.black_and_white(faksimile);
          self.blue_and_white(faksimile);
          self.fun_black_and_white = self.wrapFunction(self.black_and_white, self, [faksimile]);
          self.fun_blue_and_white = self.wrapFunction(self.blue_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_black_and_white);
          faksimile.funqueue.push(self.fun_blue_and_white);
        }
      });
    mainbartopright.addControl(blue_white);

    var green_white = new Button(
      {
        html: '<i class="fa fa-adjust" style="color:#a9da42;"></i>',
        title: 'Green and White',
        handleClick: function () {
          self.black_and_white(faksimile);
          self.green_and_white(faksimile);
          self.fun_black_and_white = self.wrapFunction(self.black_and_white, self, [faksimile]);
          self.fun_green_and_white = self.wrapFunction(self.green_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_black_and_white);
          faksimile.funqueue.push(self.fun_green_and_white);
        }
      });
    mainbartopright.addControl(green_white);

    var beige_white = new Button(
      {
        html: '<i class="fa fa-adjust" style="color:#e8bd82;"></i>',
        title: 'Beige and White',
        handleClick: function () {
          self.black_and_white(faksimile);
          self.beige_and_white(faksimile);
          self.fun_black_and_white = self.wrapFunction(self.black_and_white, self, [faksimile]);
          self.fun_beige_and_white = self.wrapFunction(self.beige_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_black_and_white);
          faksimile.funqueue.push(self.fun_beige_and_white);
        }
      });
    mainbartopright.addControl(beige_white);

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

           // map.removeInteraction(modify_interaction);
            //map.removeInteraction(transform_interaction);
            //map.removeInteraction(delete_interaction);
            //map.removeInteraction(focusmap);

            self.setOpacity(faksimile, 80, true);

            //self.resetOverlaySVG(map, faksimile);
            //self.buildOverlaySVG(map, faksimile);


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

    drawBox.on("change:disable", function (e) {
      console.log("Edition is " + (e.disable ? "disabled" : "enabled"));
    });

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
            //map.addInteraction(focusmap);
            //map.addInteraction(transform_interaction);

            self.setOpacity(faksimile, 170, true);
            
            self.svg.selectAll("circle").remove();

            self.svg.selectAll(".line--x").remove();
            self.svg.selectAll(".line--y").remove();

            var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;


            var svgString = getSVGString(self.svg.node(), containt.canvas.width / map.getView().getResolution(), containt.canvas.height / map.getView().getResolution());

            var cropImageString = svgString2Image(svgString, containt.canvas.width, containt.canvas.height, 'png', save, map); // passes Blob and filesize String to the callback
            
            
            self.svg = null;
           
          }

          else {
            //map.removeInteraction(draw);
          }
        }
      });
    mainbartopright.addControl(mergeArea);


    var undo = new Button(
      {
        html: '<i class="fa fa-reply"></i>',
        title: 'Undo',
        handleClick: function () {
          map.removeInteraction(draw);
          self.fileService.setActualContain(faksimile, faksimile.pages[num - 1], faksimile.pages[num - 1].previouscontain);
          self.repaint(faksimile, num);

        }
      });
    mainbartopright.addControl(undo);


    var reset = new Button(
      {
        html: '<i class="fa fa-reply-all"></i>',
        title: 'Reset',
        handleClick: function () {
          map.removeInteraction(draw);
          self.imageOriginal.load(faksimile.pages[num - 1].contain, imageLoaded);

          function imageLoaded() {
            imageProcessed = self.imageOriginal.clone();
            self.fileService.setPreviosContain(faksimile, faksimile.pages[num - 1], imageProcessed);
            self.fileService.setActualContain(faksimile, faksimile.pages[num - 1], imageProcessed);
            self.repaint(faksimile, num);
          }

        }
      });
    mainbartopright.addControl(reset);

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
            map.removeOverlay(ov);
            map.getOverlays().getArray().forEach(function (element) { if (element.getElement().classList.contains("ol-magnify")) map.removeOverlay(element); })
            //map.removeOverlay(map.getOverlays().getArray()[0]);
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

      //[value] = "username" (input) = "username = $event.target.value"
      var pagenum = new TextButton(
        {
          html: '<input class= "fa fa-lg" style="width: 2.5em;" type="number"  value = ' + faksimile.actualPage + ' (input) = "faksimile.actualPage  = event.target.value" > / ' + faksimile.numPages + '',

         // html: '<input class= "fa fa-lg" style="width: 2.5em;" type="number" value="' + faksimile.actualPage + '"> / ' + faksimile.numPages + '',
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
          self.updateMinPreview();
          

        }
      });
    bartop.addControl(close);


    //< i class="fa fa-upload" > </i>
    var download = new Button(
      {
        html: '<i class="far fa-file-image"></i>',
        title: "Export current Page",
        handleClick: function () {

          self.exportPNG(map, faksimile);

        }
      });
    bartop.addControl(download);

    var currRotation = map.getView().getRotation();
    var currZoom = map.getView().getZoom();
    map.on('postrender', function (e) {
      map.set("frameState", e.frameState);
    });


    map.on('moveend', function (e) {
      map.set("frameState", e.frameState);
      
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

      //var cropWidth = cropCoord[1][0] - cropCoord[0][0];
      //var cropHeight = cropCoord[3][1] - cropCoord[0][1];


      var minx = faksimile.pages[faksimile.actualPage - 1].minx;
      var miny = faksimile.pages[faksimile.actualPage - 1].miny;
      var maxx = faksimile.pages[faksimile.actualPage - 1].maxx;
      var maxy = faksimile.pages[faksimile.actualPage - 1].maxy;
      var cropWidth = maxx - minx;
      var cropHeight = maxy - miny;

      console.log("minx: " + minx);
      console.log("miny: " + miny);
      console.log("maxx: " + maxx);
      console.log("maxy: " + maxy);
      console.log("cropCoord[0][0]: " + cropCoord[0][0]);
      console.log("cropCoord[0][1]: " + cropCoord[0][1]);
      Marvin.crop(cropImage1.clone(), cropImage, minx, miny, cropWidth, cropHeight);

      cropImage.draw(cropImage.canvas);


      url = cropImage.canvas.toDataURL();


      var origImage: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
      var origImgUrl = origImage.canvas.toDataURL();

    //  var blankImage: any = cropImage;
    //  var ctx = blankImage.getContext("2d");

      //var imgData = ctx.createImageData(cropWidth / map.getView().getResolution(), cropHeight / map.getView().getResolution());

     // var cropImageData = cropImage.imageData.data;

      
     // blankImage.draw(blankImage.canvas);

      var canvas: any = document.createElement('canvas');
      canvas.id = "blankcanvas";
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.rect(0, 0, cropCoord[1][0] - cropCoord[0][0], cropCoord[3][1]- cropCoord[0][1]);
      ctx.fillStyle = "white";
      ctx.fill();
     /* var i;
      for (i = 0; i < blankImage.imageData.data.length; i += 4) {
        // if (blankImage.imageData.data[i + 0] != 0 || blankImage.imageData.data[i + 1] != 0 || blankImage.imageData.data[i + 2] != 0) {
        blankImage.imageData.data[i + 0] = 255;
        blankImage.imageData.data[i + 1] = 255;
        blankImage.imageData.data[i + 2] = 255;
        blankImage.imageData.data[i + 3] = 255;
        //  }

      }
      ctx.putImageData(blankImage.imageData, 0, 0);*/
       
      //ctx.putImageData(imgData, 0, 0);
      var blankURL = canvas.toDataURL();
    
      var mergedImage = mergeImages([
        { src: origImgUrl, x: 0, y: 0, },
        { src: blankURL, x: cropCoord[0][0], y: cropCoord[0][1], },]).then((img) => {
         
          //var arrayBuffer = self.remove_whitePixel(img);
          //var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));

          mergeImages([
            { src: img, x: 0, y: 0, },
            { src: url, x: minx, y: miny, },]).then((img2) => {
              self.updateImg(faksimile, img2);
             
                         
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

  updateImg(faksimile, img) {
    var image = new MarvinImage();
    image.load(img, imageLoaded);
    var self = this;
    function imageLoaded() {
      self.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], image);   
      self.setOpacity(faksimile, 170, true);
      self.remove_background(faksimile);
      self.svg.selectAll('g').remove();
      //self.repaint(faksimile, faksimile.actualPage);
    }
    //faksimile.pages[faksimile.actualPage - 1].actualcontain = img;
    //this.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], faksimile.actualPage, img);
   
  }
  bindInputs(event: any, faksimile: Faksimile) {
    var idxInput = event.target;
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
        self.imageOriginal = new MarvinImage();
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
