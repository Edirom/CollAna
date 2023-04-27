import { Output, Component, EventEmitter, Injectable, Input } from '@angular/core';

import { FileService } from '../services/file.services';
import { MapService } from '../services/map.service';

import { Faksimile } from '../types/faksimile';
import { MapFaksimile } from '../types/mapfaksimile';
import { createRectFromCoords } from '../types/helpers';
import { Pages } from '../types/pages';

import { Overlay } from 'ol';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Projection from 'ol/proj/Projection';
import { Image as ImageLayer } from 'ol/layer.js';
import Static from 'ol/source/ImageStatic.js';
import { Attribution, defaults as defaultControls } from 'ol/control';
import { FullScreen } from 'ol/control.js';
// import {Rotate} from 'ol/control.js';
import { defaults as defaultInteractions} from 'ol/interaction.js';
// import {DragRotateAndZoom } from 'ol/interaction.js';
import Bar from 'ol-ext/control/Bar';
import Toggle from 'ol-ext/control/Toggle';
import Button from 'ol-ext/control/Button';
import TextButton from 'ol-ext/control/TextButton';
// import Magnify from 'ol-ext/overlay/Magnify';
import Modify from 'ol/interaction/Modify';
import Draw, { createBox } from 'ol/interaction/Draw';
import { Vector as VectorLayer, Layer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import FocusMap from 'ol-ext/interaction/FocusMap';
import Transform from 'ol-ext/interaction/Transform';
import Delete from 'ol-ext/interaction/Delete';
import { shiftKeyOnly } from 'ol/events/condition';
import MousePosition from 'ol/control/MousePosition';
import { getCenter } from 'ol/extent';
import { Stroke, Fill, Circle, Style } from 'ol/style';
import GeometryType from 'ol/geom/GeometryType';

import * as d3 from 'd3';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import mergeImages from 'merge-images';
import { saveAs } from 'file-saver';
import { pdfjsworker } from 'pdfjs-dist/legacy/build/pdf.worker.entry';

// External library declaration
declare var MarvinImage: any;
declare var Marvin: any;
declare var solve: any;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsworker;

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'fileservice',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})

export class FileComponent {

  @Output() complete: EventEmitter<any> = new EventEmitter();
  @Input() canvas_index: number;

  // All the variables required in this class

  faksimiles: Faksimile[];
  faksimile: Faksimile;
  contain = '';

  // Variables to store and display marvin images
  imageOriginal;
  imageDisplay = new MarvinImage();

  reader;
  pdfDoc;

  svg: any;
  g: any;

  vector;

  // Variables needed for page rendering
  pageRendering = false;
  scale = 2;
  pageRenderQueue = [];

  // Variables needed for different changes in the page. They are sent to queue for processing
  fun_blue_and_white;
  fun_green_and_white;
  fun_beige_and_white;
  fun_red_and_white;
  fun_black_and_white;
  fun_edge_detection;
  fun_remove_background;

  constructor(private fileService: FileService, private mapService: MapService) {
    // https://github.com/wbkd/d3-extended

    //Moves the file display to the front of the display
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

  /**
   * To select a file to import
   * @param event Event which has the file in it
   */
  onSelectFile(event: any) {

    var self = this;
    var file: File = event.target.files[0];
    var faksimile;

    var imageProcessed = new MarvinImage();
    this.reader = new FileReader();

    // If the file imported is image
    if (file.type == "image/png" || file.type == "image/jpeg") {
      this.reader.readAsDataURL(file);

      //Onload function to indicate when the file is loaded completely
      this.reader.onloadend = function (e: any) {
        self.contain = self.reader.result;
        self.complete.next({
          fileContent: self.reader.result,
          fileName: file.name,
        });

        // Generate Faksimile Page for the image data and load the page
        faksimile = new Faksimile("image", file.name, null, 1, 1, false, null);
        self.fileService.addFaksimile(faksimile);


        var page: Pages = new Pages(1, faksimile.title, self.contain, 0, imageProcessed);
        self.fileService.addPage(faksimile, page);
        self.imageOriginal = new MarvinImage();
        self.imageOriginal.load(self.contain, imageLoaded);

        // Called when the image is loaded successfully as Marvin Image
        function imageLoaded() {
          var imageProcessed = self.imageOriginal.clone();
          self.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
          self.fileService.setActualContain(faksimile, page, imageProcessed);
          self.generateMap(faksimile, 1);
          self.generateMinPreview(faksimile);
        }
      };
    }
    // If the file imported is pdf
    else if (file.type == "application/pdf") {
        this.reader.readAsArrayBuffer(file);
        this.reader.onloadend = function () {
          self.complete.next({
            fileName: file.name,
            fileContent: self.reader.result,
          });
          pdfjsLib.getDocument({ data: this.result }).promise.then(function (pdfDoc_) {
            self.pdfDoc = pdfDoc_;
            // Render the 1st page of the PDF document
            self.renderPage(null, 1, file.name, self.pdfDoc.numPages, self.pdfDoc);
          });
        };
    }
  }

  importJsonImage(name: string,image: string){
    console.log(name,image)
    let self = this
    let faksimile;
    let imageProcessed = new MarvinImage()
    self.contain = image
    self.complete.next({
      fileContent: self.contain,
      fileName: name
    })
    faksimile = new Faksimile('image',name,null,1,1,false,null)
    self.fileService.addFaksimile(faksimile)
    let page: Pages = new Pages(1,faksimile.title,self.contain,0,imageProcessed)
    self.fileService.addPage(faksimile,page)
    self.imageOriginal = new MarvinImage()
    self.imageOriginal.load(self.contain,imageLoaded)
    
    function imageLoaded() {
      let imageProcessed = self.imageOriginal.clone();
      self.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
      self.fileService.setActualContain(faksimile, page, imageProcessed);
      self.generateMap(faksimile, 1);
      self.generateMinPreview(faksimile);
    }
  }

  /**
   * To wrap any function with context and parameter to the variable for queue
   * @param fn Function which needs to be wrapped
   * @param context Context means the class to which the function is applied
   * @param params Refers to the parameter needed for the function to be applied
   * @returns
   */
  wrapFunction = function (fn, context, params) {
    return function () {
      fn.apply(context, params);
    };
  }

  /**
   * Change background image color based on rgba color space
   * @param faksimile Page for which the color needs to be changed
   * @param pr Red color space of rgb to set in the background
   * @param pg Green color space of rgb to set in the background
   * @param pb Blue color space of rgb to set in the background
   * @param pa Alpha color space of rgb to set in the background
   */
  anycolor_and_white = function (faksimile: Faksimile, pr: number, pg: number, pb: number, pa: number) {
    var imageProcessed = new MarvinImage();

    //Get current page details to store for Undo operation
    this.imageOriginal = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    this.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], this.imageOriginal);

    console.log("Faksimile actual page count");
    console.log(faksimile.actualPage);

    //Wait for the previous operation to complete to start the next operation
      imageProcessed = this.imageOriginal.clone();

      //if(faksimile.pages[faksimile.actualPage - 1].colourcounter != 0) {
      Marvin.blackAndWhite(this.imageOriginal, imageProcessed, 30);
      //  faksimile.pages[faksimile.actualPage - 1].colourcounter = 1;
      //}

/*
      if(faksimile.pages[faksimile.actualPage - 1].colourcounter === 0) {
        Marvin.blackAndWhite(this.imageOriginal, imageProcessed, 30);
        faksimile.pages[faksimile.actualPage - 1].colourcounter = 1;
      }
*/

      var imageData = imageProcessed.imageData;
      var pixel = imageData.data;

      //Changing each pixel which are not white to red
      var r = 0, g = 1, b = 2, a = 3;
      for (var p = 0; p < pixel.length; p += 4) {
        if ( pixel[p + r] != 255 || pixel[p + g] != 255 || pixel[p + b] != 255) {
          pixel[p + r] = pr;
          pixel[p + g] = pg;
          pixel[p + b] = pb;
          pixel[p + a] = pa;
        }
      }
      imageProcessed.imageData = imageData;
      this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
      this.generateMap(faksimile, faksimile.actualPage);

      // imageProcessed.clear(0xFF000000);

      // Marvin.prewitt(this.imageOriginal, imageProcessed, 1);
      // Marvin.invertColors(imageProcessed, imageProcessed);
      // Marvin.thresholding(imageProcessed, imageProcessed, 150);


  }

  /**
   * Applies a gradient transparency to boundary pixels
   * @param faksimile Page for which the boundary pixels needs to be changed
   */
  alphaBoundary = function (faksimile: Faksimile) {

    var imageProcessed = new MarvinImage();

    this.imageOriginal = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]);
    this.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], this.imageOriginal);

    imageProcessed = this.imageOriginal.clone();
    Marvin.alphaBoundary(this.imageOriginal, imageProcessed, 30);

    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.generateMap(faksimile, faksimile.actualPage);
  }

  /**
   * Applies a opacity to the image pixels
   * @param faksimile Page for which the opacity needs to be set
   */
  setOpacity = function (faksimile: Faksimile, opacity: number, repaintCheck: boolean) {

    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixels = imageData.data;

    for (var pixel = 0; pixel < pixels.length; pixel += 4) {
      pixels[pixel + 3] = opacity;
    }

    imageProcessed = this.imageOriginal.clone();
    imageProcessed.imageData = imageData;
    if (repaintCheck)
      this.generateMap(faksimile, faksimile.actualPage);
  }

  /**
   * Remove background of the page
   * @param faksimile Page for which the background needs to be removed
   */
  remove_background = function (faksimile: Faksimile) {

    var imageProcessed = new MarvinImage();
    var imageData = this.fileService.getActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1]).imageData;
    var pixels = imageData.data;

    var red = 0, green = 1, blue = 2, alpha = 3;
    for (var pixel = 0; pixel < pixels.length; pixel += 4) {
      // Change only white color pixel alpha(or opacity) to 0
      if (pixels[pixel + red] == 255 && pixels[pixel + green] == 255 && pixels[pixel + blue] == 255) {
        pixels[pixel + alpha] = 0;
      }
    }

    imageProcessed = this.imageOriginal.clone();
    imageProcessed.imageData = imageData;
    this.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
    this.generateMap(faksimile, faksimile.actualPage);
  }

  /**
   * Remove background only for the cropped section of the image
   * @param cropImage Cropped section of the image
   * @returns Processed image
   */
   remove_background_crop = function (cropImage: any, map: Map) {
    var imageProcessed = new MarvinImage();
    var imageData = cropImage.imageData;
    var pixels = imageData.data;

    var red = 0, green = 1, blue = 2, alpha = 3;
    for (var pixel = 0; pixel < pixels.length; pixel += 4) {
      if (pixels[pixel + red] == 255 && pixels[pixel + green] == 255 && pixels[pixel + blue] == 255) // if white then change alpha to 0
      {
        pixels[pixel + alpha] = 0;
      }
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

  /**
   * Mark edges in the page
   * @param faksimile Page for which the edges need to be set
   */
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
    this.generateMap(faksimile, faksimile.actualPage);
  }

  /**
   * Get Faksimile Map based on Node id
   * @param id Node id for which the map is required
   */
  getMap(id): MapFaksimile {
    var obj: MapFaksimile = this.mapService.getMaps().filter(function (node) {
      return node.ID == id;
    })[0];
    return obj;
  }

  /**
   * To set the Actual content of the page
   * @param faksimile Faksimile Page for which the content needs to be set
   * @param page Page in Faksimile page for which the content is changed
   * @param num Page number for the content change
   * @param src Page which has the changed content
   */
  // TODO: Check again later on this
  // setActualContain(faksimile: Faksimile, page: Pages, num, src) {
  //   var self = this;
  //   var imageOriginal = new MarvinImage();
  //   var imageProcessed = new MarvinImage();

  //   imageOriginal.load(src, imageLoaded);

  //   function imageLoaded() {
  //     imageProcessed = imageOriginal.clone();
  //     self.fileService.setActualContain(faksimile, page, imageProcessed);
  //     imageProcessed = faksimile.pages[num - 1].actualcontain;
  //     self.generateMap(faksimile, num);
  //     self.generateMinPreview(faksimile);
  //   }
  // }

  // /**
  //  * Repaint the Faksimile page with the changed data
  //  * @param data Faksimile Page for which the data needs to be changed
  //  * @param num Page number of the data
  //  */
  // repaint(data: Faksimile, num: number) {
  //   this.generateMap(data, num);
  // }

  /**
   * Export page to PNG format
   * @param faksimile Faksimile page which will be exported
   */
  exportPNG(faksimile: Faksimile) {
    var actualContent:any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
    var canvas: any = actualContent.canvas;
    var input = faksimile.title;
    var output = input.substr(0, input.lastIndexOf('.')) || input;

    canvas.toBlob(function (blob) {
      saveAs(blob, output + "_" + "Page" + faksimile.actualPage + ".png");
    });
  }

  /**
   * Update Preview page with the content
   */
  // TODO: Check again later on this
  updateMinPreview() {
    this.fileService.getFaksimiles().forEach(function (faksimile) {
      this.generateMinPreview(faksimile);
    })
  }

  /**
   *
   * @param faksimile Faksimile Page
   */
  generateMinPreview(faksimile: Faksimile) {
    var element: any = document.getElementById("mini-card-canvas" + faksimile.ID);
    element.innerText = faksimile.index + 1;
  }

  /**
   * All Perspective transformation operations
   */
  activateSVGMode(faksimile: Faksimile, map: Map) {
    this.resetOverlaySVG(faksimile);
    this.buildOverlaySVG(map, faksimile);

    var container = document.getElementById('card-block' + faksimile.ID);
    var mousePosition;
    container.addEventListener('mousemove', function (event) {
      mousePosition = map.getEventCoordinate(event);
    });
    var that = this;

    this.svg.selectAll("g").remove();
    this.svg.on('click', drawingstarted).on('mousemove', drawpreview);

    // var final: boolean = true;
    var final: boolean = false;
    var point1: number[] = [];
    var point2: number[] = [];
    var cutCoord1;
    var cutCoord2;
    var mouseDown: boolean = false;
    var that = this;
    var preview;
    this.g = this.svg.append('g');

    /**
     * To draw rectangle when perspective transformation is clicked
     */
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

      if(final) {
        final = false; faksimile
        point2 = d3.mouse(this);
        cutCoord2 = mousePosition.map(x => parseInt(x));
        cutCoord2[1] = faksimile.size[1] - cutCoord2[1];
        if(point1.length != 0) {
          var coord = createRectFromCoords(point1, point2);
          var cutCoord = createRectFromCoords(cutCoord1, cutCoord2);
          faksimile.pages[faksimile.actualPage - 1].cropCoord = cutCoord;
          faksimile.pages[faksimile.actualPage - 1].minx = cutCoord[0][0];
          faksimile.pages[faksimile.actualPage - 1].miny = cutCoord[0][1];
          faksimile.pages[faksimile.actualPage - 1].maxx = cutCoord[1][0];
          faksimile.pages[faksimile.actualPage - 1].maxy = cutCoord[3][1];
          perspectiveTransformation(coord, faksimile, cutCoord);
          drawingended();
        }
      } else {
        point1 = d3.mouse(this);
        cutCoord1 = mousePosition.map(x => parseInt(x));
        cutCoord1[1] = faksimile.size[1] - cutCoord1[1];
        final = true;
      }

      // if (!final) {
      //   final = true; faksimile
      //   point2 = d3.mouse(this);
      //   cutCoord2 = mousePosition.map(x => parseInt(x));
      //   cutCoord2[1] = faksimile.size[1] - cutCoord2[1];
      //   if (point1 !== []) {
      //     var coord = createRectFromCoords(point1, point2);
      //     var cutCoord = createRectFromCoords(cutCoord1, cutCoord2);
      //     //Anpassen!!
      //     faksimile.pages[faksimile.actualPage - 1].cropCoord = cutCoord;
      //     faksimile.pages[faksimile.actualPage - 1].minx = cutCoord[0][0];
      //     faksimile.pages[faksimile.actualPage - 1].miny = cutCoord[0][1];
      //     faksimile.pages[faksimile.actualPage - 1].maxx = cutCoord[1][0];
      //     faksimile.pages[faksimile.actualPage - 1].maxy = cutCoord[3][1];
      //     perspectiveTransformation(coord, faksimile, cutCoord);
      //     drawingended();
      //   }
      // }
      // else {
      //   final = false;
      //   point1 = d3.mouse(this);
      //   cutCoord1 = mousePosition.map(x => parseInt(x));
      //   cutCoord1[1] = faksimile.size[1] - cutCoord1[1];
      // }
    }

    /**
     * Change perspective transformation of the selected coordinates
     * @param coord
     * @param faksimile
     * @param cutCoord
     */
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

      var svgTransform = d3.select("#transform").style(transform + "-origin", coord[0][0] + "px " + coord[0][1] + "px 0");
      svgTransform.style(transform, "matrix(1, 0, 0, 1, 0, 0)");
      var svgFlat = d3.select("#flat");
      if (faksimile.actualPage == null)
        faksimile.actualPage = 1;

      that.setOpacity(faksimile, 255, false);
      var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;

      var cropWidth = cutCoord[1][0] - cutCoord[0][0];
      var cropHeight = cutCoord[3][1] - cutCoord[0][1];

      var cropImage = new MarvinImage();
      var cloneContaint = containt.clone();
      Marvin.crop(cloneContaint, cropImage, cutCoord[0][0], cutCoord[0][1], cropWidth, cropHeight);
      cropImage.canvas.getContext("2d").clearRect(0, 0, cropWidth, cropHeight);
      cropImage.draw(cropImage.canvas);

      var imageWithoutBackground = that.remove_background_crop(cropImage, map);
      var url = imageWithoutBackground.canvas.toDataURL();

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

      svgFlat.select("g").selectAll(".draggable")
        .data(center)
        .enter().append("circle")
        .attr("id", function (d, i) { return "" + i; })
        .attr("class", "draggable")
        .attr("transform", function (d) { return "translate(" + d + ")"; })
        .attr("r", 5)
        .on('mouseover', function (d, i) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 20);
        })
        .on('mouseout', function (d, i) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 5);
        })
        .call(d3.drag()
          .subject(function (d) { return { x: d[0], y: d[1] }; })
          .on("drag", draggedcenter));

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
        transformed();
     }

      function dragged(d) {
        d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
        var id = this.id;
        var mousePosition;
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
          console.log("cutCoord, mousePosition: " + id + " "+ cutCoord +  " ");
          container.removeEventListener('pointerup', function (event) { });

        });
        transformed();
      }

      // function draggedMiddlePoints(d) {
      //   d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
      //   console.log("this: " + this.id);
      //   var id = this.id;
      //   var mousePosition;
      //   var self = this;
      //   container.addEventListener('pointerup', function (event) {
      //     mousePosition = map.getEventCoordinate(event);
      //     if (faksimile.pages[faksimile.actualPage - 1].minx > parseInt(mousePosition[0]))
      //       faksimile.pages[faksimile.actualPage - 1].minx = parseInt(mousePosition[0]);
      //     if (faksimile.pages[faksimile.actualPage - 1].miny > (faksimile.size[1] - parseInt(mousePosition[1])))
      //       faksimile.pages[faksimile.actualPage - 1].miny = faksimile.size[1] - parseInt(mousePosition[1]);
      //     if (faksimile.pages[faksimile.actualPage - 1].maxx < parseInt(mousePosition[0]))
      //       faksimile.pages[faksimile.actualPage - 1].maxx = parseInt(mousePosition[0]);
      //     if (faksimile.pages[faksimile.actualPage - 1].maxy < (faksimile.size[1] - parseInt(mousePosition[1])))
      //       faksimile.pages[faksimile.actualPage - 1].maxy = faksimile.size[1] - parseInt(mousePosition[1]);
      //     //faksimile.pages[faksimile.actualPage - 1].cropCoord[id][0] = parseInt(mousePosition[0]);
      //     //faksimile.pages[faksimile.actualPage - 1].cropCoord[id][1] = faksimile.size[1]-parseInt(mousePosition[1]);
      //     // cutCoord[self.id] = mousePosition;
      //     console.log("cutCoord, mousePosition: " + id + " " + cutCoord + " ");
      //     container.removeEventListener('pointerup', function (event) { });

      //   });
      //   transformed();
      //   // faksimile.pages[faksimile.actualPage - 1].cropCoord = cutCoord;


      // }

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

    /**
     *
     */
    function drawpreview() {
      if (mouseDown) {
        point2 = d3.mouse(this);
        var previewPoints = createRectFromCoords(point1, point2);
        preview.attr('points', function () {
          return previewPoints;
        });
      }
    }

    /**
     * Called when the drawing is completed
     */
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
    }

    function dragged(d) {
      d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
    }
  }

  /**
   * Build the overlay SVG image for perspective transformation
   * @param map
   * @param faksimile
   */
  buildOverlaySVG(map: Map, faksimile: Faksimile) {
    var containt: any = faksimile.pages[faksimile.actualPage - 1].actualcontain;
    d3.select("#overlay" + faksimile.ID).selectAll("svg").remove();
    this.svg = d3.select("#overlay" + faksimile.ID).selectAll("svg")
      .data(["transform", "flat"])
      .enter()
      .append("svg")
      .attr("id", function (d) { return d; })
      .attr('viewBox', '0 0 ' + containt.canvas.width / map.getView().getResolution() + ' ' + containt.canvas.height / map.getView().getResolution())
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr("width", containt.canvas.width / map.getView().getResolution())
      .attr("height", containt.canvas.height / map.getView().getResolution())
      .classed("svg-content", true);
  }

  /**
   * Reset SVG overlay before starting new perspective transformation
   * @param faksimile
   */
  resetOverlaySVG(faksimile: Faksimile) {
    d3.select("#card-block" + faksimile.ID).selectAll("svg").remove();
  }

  /**
   * Generate complete Map including the Legends and all the buttons. The main function in this code.
   * @param faksimile
   * @param num
   * @returns
   */
  generateMap(faksimile: Faksimile, num: number) {
    if (num == null)
      num = 1;

    var imageProcessed = new MarvinImage();
    if (typeof faksimile.pages[num - 1] == "undefined")
      return;

    var containt: any = faksimile.pages[num - 1].actualcontain;
    var extent: [number, number, number, number]  = [0, 0, containt.canvas.width, containt.canvas.height];
    var projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent,
    });

    const attribution = new Attribution({
      collapsible: false,
    });

    containt.draw(containt.canvas);

    var url = containt.canvas.toDataURL();

    var mapfk: MapFaksimile = this.getMap(faksimile.ID);
    if (mapfk != null) {
      var map = mapfk.map;
      var layers = mapfk.map.getLayers();
      for (var i = layers.getArray().length - 1; i >= 0; --i) {
        mapfk.map.removeLayer(layers.getArray()[i]);
      }
    }
    else {
      var map = new Map(
      {
        target: 'card-block' + faksimile.ID,
        controls: [attribution],
        interactions: defaultInteractions({
          doubleClickZoom: false,
          dragPan: true,
          mouseWheelZoom: false,
          zoomDelta: 0.01,
        }),
        keyboardEventTarget: document,
        view: new View({
          resolution: 1,        // important for 100% image size!
          projection: projection,
          center: getCenter(extent),
          constrainRotation: false,
          constrainResolution: false,
          zoom:300,
        })
      });
      var mapf = new MapFaksimile(map, faksimile);
      this.mapService.addMap(mapf);
   }
    map.addControl(attribution);

    var layer: any = new ImageLayer({
        source: new Static({
          url: url,
          projection: projection,
          imageExtent: extent,
          attributions: [
            faksimile.title
          ]
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

    faksimile.size = [containt.canvas.width, containt.canvas.height];


    /**
     * To set the top panel of the page
     */
    var barTop = new Bar();
    map.addControl(barTop);
    barTop.setPosition("top");

    /*var legend = new Legend({
      title: faksimile.title,
      collapsed: false
    });*/
    //barTop.addControl(legend);

    /**
     * input the zoom factor for the page
     */
    var zoomFactor = new TextButton(
      {
        html: ' Zoom: <input id="zoom-div' + faksimile.ID + '" class= "fa fa-lg" style="width: 3em;" min="1" max="3000" step="0.001" type="number" value="' + map.getView().getZoom() + '"> ',
        title: "Zoom factor",
        handleClick: function (event: any) {
          self.bindZoomInputs(event, faksimile);
        }
      });
    barTop.addControl(zoomFactor);

    /**
     * input the rotation factor for the page
     */
    var rotation = new TextButton(
      {
        html: ' Rotation: <input id= "rotation-div' + faksimile.ID + '" class= "fa fa-lg" style="width: 3em;" min="-360" max="360" step="1.0" type="number" value="' + map.getView().getRotation() * 180 / Math.PI + '"> ',// * 180 / Math.PI + '"> ',
        title: "Rotation",
        handleClick: function (event: any) {
          self.bindRotationInputs(event, faksimile);
        }

      });
    barTop.addControl(rotation);


    /** Right side panel which contains hold and other action buttons */
    var barRight = new Bar();
    map.addControl(barRight);
    barRight.setPosition("top-right");
    barRight.set("id", "bar " + faksimile.ID);

    var self = this;

    /** Hold button */
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
    barRight.addControl(hold);


    /** Black color button */
    var blackwhite = new Button(
    {
      html: '<i class="fa fa-adjust"></i>',
      title: 'Black and White',
      handleClick: function () {
          self.anycolor_and_white(faksimile, 0, 0, 0, 250);
          self.fun_black_and_white = self.wrapFunction(self.anycolor_and_white, self, [faksimile]);
          faksimile.funqueue.push(self.fun_black_and_white);
      }
    });
    barRight.addControl(blackwhite);


    /** Red color button */
    var red_white = new Button(
    {
      html: '<i class="fa fa-adjust" style="color:#ffc0cb;"></i>',
      title: 'Red and White',
      handleClick: function () {
        self.anycolor_and_white(faksimile, 255, 130, 0, 200);
        self.fun_red_and_white = self.wrapFunction(self.anycolor_and_white, self, [faksimile]);
        faksimile.funqueue.push(self.fun_red_and_white);
      }
    });
    barRight.addControl(red_white);


    /** Blue color button */
    var blueWhite = new Button(
    {
      html: '<i class="fa fa-adjust" style="color:#0000ff;"></i>',
      title: 'Blue and White',
      handleClick: function () {
        self.anycolor_and_white(faksimile, 5, 139, 255, 170);
        self.fun_blue_and_white = self.wrapFunction(self.anycolor_and_white, self, [faksimile]);
        faksimile.funqueue.push(self.fun_blue_and_white);
      }
    });
    barRight.addControl(blueWhite);


    /** Green color button */
    var greenWhite = new Button(
    {
      html: '<i class="fa fa-adjust" style="color:#a9da42;"></i>',
      title: 'Green and White',
      handleClick: function () {
        self.anycolor_and_white(faksimile, 118, 167, 56, 170);
        self.fun_green_and_white = self.wrapFunction(self.anycolor_and_white, self, [faksimile]);
        faksimile.funqueue.push(self.fun_green_and_white);
      }
    });
    barRight.addControl(greenWhite);


    /** Beige color button */
    var beigeWhite = new Button(
    {
      html: '<i class="fa fa-adjust" style="color:#e8bd82;"></i>',
      title: 'Beige and White',
      handleClick: function () {
        self.anycolor_and_white(faksimile, 232, 189, 130, 170);
        self.fun_beige_and_white = self.wrapFunction(self.anycolor_and_white, self, [faksimile]);
        faksimile.funqueue.push(self.fun_beige_and_white);
      }
    });
    barRight.addControl(beigeWhite);


    /** Edge detection button */
    var edgeDetection = new Button(
    {
      html: '<i class="fa fa-music"  style="color:'+ faksimile.Color+'" ></i>',
      title: 'Edge Detection',
      handleClick: function () {
        self.edge_detection(faksimile);
        self.fun_edge_detection = self.wrapFunction(self.edge_detection, self, [faksimile]);
        faksimile.funqueue.push(self.fun_edge_detection);
      }
    });
    barRight.addControl(edgeDetection);


    /** Remove background button */
    var removeBackground = new Button(
    {
      html: '<i class="fa fa-eraser" style="color:' + faksimile.Color +'"></i>',
      title: 'Remove Background',
      handleClick: function () {
        self.remove_background(faksimile);
        self.fun_remove_background = self.wrapFunction(self.remove_background, self, [faksimile]);
        faksimile.funqueue.push(self.fun_remove_background);
      }
    });
    barRight.addControl(removeBackground);


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


    /**
     * Perspective Transformation button
     */
    var drawBox = new Toggle(
      {
        html: '<i class="fas fa-border-all" style="color:' + faksimile.Color +'"></i>',
        title: 'Perspective Transformation',
        active: false,
        onToggle: function (active) {
          if (active) {
            mergeArea.setActive(false);
            self.setOpacity(faksimile, 80, true);
            self.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], faksimile.pages[faksimile.actualPage - 1].actualcontain);
            setTimeout(() => {
              self.activateSVGMode(faksimile, map);
            });
          }
          else {
            self.svg.on('click', null).on('mousemove', null);
          }
        }
      });
    barRight.addControl(drawBox);

    // drawBox.on("change:disable", function (e) {
    //   console.log("Edition is " + (e.disable ? "disabled" : "enabled"));
    // });


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
      };
    }

    function save(url) {
      self.cropImageString(url, faksimile);
    }

    /** Merge button */
    var mergeArea = new Toggle(
      {
        html: '<i class="fas fa-link" style="color:' + faksimile.Color +'"></i>',
        title: 'Merge Area',
        active: false,
        onToggle: function (active) {
          if (active) {
            drawBox.setActive(false);
            map.removeInteraction(draw);
            map.removeInteraction(modify_interaction);
            map.removeInteraction(delete_interaction);

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
            map.removeInteraction(draw);
          }
        }
      });
    barRight.addControl(mergeArea);

    /** Undo button */
    var undo = new Button(
      {
        html: '<i class="fa fa-reply" style="color:' + faksimile.Color +'"></i>',
        title: 'Undo',
        handleClick: function () {
          map.removeInteraction(draw);
          if(faksimile.pages[num - 1]["previouscontain"]) {
            self.fileService.setActualContain(faksimile, faksimile.pages[num - 1], faksimile.pages[num - 1].previouscontain);
            setTimeout(() => {
              self.generateMap(faksimile, num);
            });
          }
        }
      });
    barRight.addControl(undo);


    /** Reset button */
    var reset = new Button(
      {
        html: '<i class="fa fa-reply-all" style="color:' + faksimile.Color +'"></i>',
        title: 'Reset',
        handleClick: function () {
          map.removeInteraction(draw);
          self.imageOriginal.load(faksimile.pages[num - 1].contain, imageLoaded);
          function imageLoaded() {
            imageProcessed = self.imageOriginal.clone();
            self.fileService.setPreviosContain(faksimile, faksimile.pages[num - 1], imageProcessed);
            self.fileService.setActualContain(faksimile, faksimile.pages[num - 1], imageProcessed);
            self.generateMap(faksimile, num);
          }
        }
      });
    barRight.addControl(reset);


    // Extent for Magnify Feature (Needs work in future)
    // var magnifyExtent: [number, number, number, number]  = [
    //   -containt.canvas.width/2, -containt.canvas.height/2,
    //   containt.canvas.width/2, containt.canvas.height/2
    // ];

    // Projection for Magnify Feature (Needs work in future)
    // var magnifyProjection = new Projection({
    //   code: 'xkcd-image',
    //   units: 'pixels',
    //   extent: magnifyExtent,
    // });

    // Layer for Magnify Feature (Needs work in future)
    // var magnifyLayer: any = new ImageLayer({
    //   source: new Static({
    //     url: url,
    //     projection: magnifyProjection,
    //     imageExtent: magnifyExtent,
    //     attributions: []
    //   })
    // });

    /** Magnify Button */
    // var magnify = new Toggle(
    // {
    //   html: '<i class="fa fa-search style="color:' + faksimile.Color +'"></i>',
    //   title: "Magnify",
    //   active: false,
    //   onToggle: function (active) {
    //     debugger;
    //     var ov = new Magnify(
    //     {
    //       layers: [magnifyLayer],
    //       zoomOffset: 1,
    //       // element: document.getElementById("overlay" + faksimile.ID)
    //     });
    //     if (active) {
    //       map.addOverlay(ov);
    //     }
    //     else {
    //       ov.stopEvent = true;
    //       map.removeOverlay(ov);
    //       map.getOverlays().getArray().forEach(function (element) {
    //          if (element.getElement().classList.contains("ol-magnify")) {
    //           map.removeOverlay(element);
    //          }
    //         })
    //     }
    //   }
    // });
    // barRight.addControl(magnify);


    // var mainbarbuttom = new Bar();
    //map.addControl(mainbarbuttom);
    //mainbarbuttom.setPosition("top-right");

    // mainbar.addControl(new Magnify(faksimile, map));

    barTop.addControl(new FullScreen());

    if (faksimile.type == "pdf") {
      /**
       * Synchronously go to previous page
       */
      var synchronous_previous = new Button(
        {
          html: '<i class="fa fa-backward" style="color:' + faksimile.Color +'"></i>',
          title: "Synchronous Previous",
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
      barTop.addControl(synchronous_previous);

      /**
       * Previous page button
       */
      var previous = new Button(
        {
          html: '<i class="fa fa-arrow-left" style="color:' + faksimile.Color +'"></i>',
          title: "Previous",
          handleClick: function () {
            if (faksimile.actualPage <= 1) {
              return;
            }
            faksimile.actualPage--;
            self.queueRenderPage(faksimile, faksimile.actualPage, faksimile.title, faksimile.numPages);


          }
        });
      barTop.addControl(previous);

      /**
       * Page number
       */
      var pagenum = new TextButton(
        {
          html: '<input class= "fa fa-lg" style="width: 2.5em;" type="number"  value = ' + faksimile.actualPage + ' (input) = "faksimile.actualPage  = event.target.value" > / ' + faksimile.numPages + '',
          title: "Page number",
          handleClick: function (event: any) {
            self.bindInputs(event, faksimile);
            const parent = document.getElementById('card-block' + faksimile.ID);
            var barRighth: any = parent.children[1].children[2].lastElementChild;
            var barTop: any = parent.children[1].children[2].children[5];
            barRighth.style.borderColor = faksimile.Color;
            barTop.style.borderColor = faksimile.Color;
          }
        });
      barTop.addControl(pagenum);

      /**
       * Next page button
       */
      var next = new Button(
        {
          html: '<i class="fa fa-arrow-right" style="color:' + faksimile.Color +'"></i>',
          title: "Next",
          handleClick: function () {
            if (faksimile.actualPage >= faksimile.numPages) {
              return;
            }
            faksimile.actualPage++;
            self.queueRenderPage(faksimile, faksimile.actualPage, faksimile.title, faksimile.numPages);

          }
        });
      barTop.addControl(next);

      /**
       * Synchronously go to next page
       */
      var synchronous_next = new Button(
        {
          html: '<i class="fa fa-forward" style="color:' + faksimile.Color +'"></i>',
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
      barTop.addControl(synchronous_next);
    }

    /**
     * Close button
     */
    var close = new Button(
      {
        html: '<i class="fa fa-times-circle" style="color:' + faksimile.Color +'"></i>',
        title: "Close",
        handleClick: function () {
          self.fileService.removeFaksimile(faksimile);
          self.faksimiles = self.fileService.getFaksimiles();
          self.updateMinPreview();
        }
    });
    barTop.addControl(close);


    /**
     * Export button
     */
    var download = new Button(
    {
      html: '<i class="far fa-file-image" style="color:' + faksimile.Color +'"></i>',
      title: "Export current Page",
      handleClick: function () {
        self.exportPNG(faksimile);
      }
    });
    barTop.addControl(download);


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
        currZoom = Math.round(currZoom * 1000) / 1000;
        zoomdiv.value = currZoom;


      }
      if (currRotation != newRotation) {
        currRotation = newRotation;
        var rotationdiv: any = document.getElementById("rotation-div" + faksimile.ID);
        var rotationDegree = currRotation * (180 / Math.PI);
        rotationdiv.value = rotationDegree;
        //rotationdiv.value = Math.round(rotationDegree);

      }
    });
  }

  cropImageString(cropImageString, faksimile: Faksimile): any {
    var cropImage1 = new MarvinImage();
    cropImage1.load(cropImageString, imageLoaded);
    var cropCoord = faksimile.pages[faksimile.actualPage - 1].cropCoord;
    var url;
    var self = this;

    function imageLoaded() {
      var cropImage = new MarvinImage();
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
      var canvas: any = document.createElement('canvas');
      canvas.id = "blankcanvas";
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.rect(0, 0, cropCoord[1][0] - cropCoord[0][0], cropCoord[3][1]- cropCoord[0][1]);
      ctx.fillStyle = "white";
      ctx.fill();
      var blankURL = canvas.toDataURL();

      var mergedImage = mergeImages([
        { src: origImgUrl, x: 0, y: 0, },
        { src: blankURL, x: cropCoord[0][0], y: cropCoord[0][1], },]).then((img) => {
          mergeImages([
            { src: img, x: 0, y: 0, },
            { src: url, x: minx, y: miny, },]).then((img2) => {
              self.updateImg(faksimile, img2);
            });
        });
    }
    return url;
  }

  /**
   *
   * @param faksimile
   * @param img
   */
  updateImg(faksimile, img) {
    var image = new MarvinImage();
    image.load(img, imageLoaded);
    var self = this;
    function imageLoaded() {
      self.fileService.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], image);
      self.setOpacity(faksimile, 170, true);
     // self.remove_background(faksimile);
      if (self.svg != null)
        self.svg.selectAll('g').remove();
      //self.generateMap(faksimile, faksimile.actualPage);
    }
    //faksimile.pages[faksimile.actualPage - 1].actualcontain = img;
    //this.setActualContain(faksimile, faksimile.pages[faksimile.actualPage - 1], faksimile.actualPage, img);

  }

  /**
   * To change page number in case of multiple page PDF document
   * @param event Page number change event which will change the page number
   * @param faksimile Faksimile Page which will be changed to show different page content
   */
  bindInputs(event: any, faksimile: Faksimile) {
    var idxInput = event.target;
    var self = this;
    idxInput.onchange = function () {
      if (idxInput.value > faksimile.numPages) {
        return;
      }
      if (idxInput.value <= 0) {
        return;
      }
      faksimile.actualPage = Number(idxInput.value);
      self.queueRenderPage(faksimile, faksimile.actualPage, faksimile.title, faksimile.numPages);
    };
  }

  /**
   * Setting zoom of the Page based on user input value
   * @param event Zoom change event to change the zoom value
   * @param faksimile Page to which the zoom value is applied
   */
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

  /**
   * Setting rotation of the Page based on user input change value
   * @param event Rotation change event to change the rotation value
   * @param faksimile Page to which the rotation value is applied
   */
   bindRotationInputs(event: any, faksimile: Faksimile) {
    var idxInput = event.target;
    //var idxInput: any = document.getElementById(id + faksimile.ID);
    // idxInput.value = 1;
    var self = this;
    idxInput.onchange = function () {
      if (parseInt(idxInput.value) > -361 && parseInt(idxInput.value) < 361) {
        var view = self.getMap(faksimile.ID).map.getView();
        var rotation = view.setRotation((idxInput.value * Math.PI) / 180);
       // var rotation = view.setRotation(Math.round(((idxInput.value * Math.PI) / 180)*100)/100);
        //var rotation = view.setRotation(parseInt(idxInput.value));
      }
    };

  }

  /**
   * Queue to render page. If another page rendering in progress, waits until the rendering is finised.
   * Otherwise, executes rendering immediately.
   * @param faksimile
   * @param num
   * @param title
   * @param numPages
   */
  queueRenderPage(faksimile: Faksimile, num: number, title: string, numPages: number) {
    if (this.pageRendering) {
      this.pageRenderQueue.push(faksimile);
    }
    else {
      this.renderPage(faksimile, num, title, numPages, faksimile.pdfDoc);

    }
  }

  /**
   * Render page for PDF document. Get page info from document, resize canvas accordingly, and render page.
   * @param faksimile
   * @param num Page number to render
   * @param filename Filename to process data from
   * @param numPages Total number of pages
   * @param pdfDoc PDF document to render to page
   */
  renderPage(faksimile: Faksimile, num: number, filename: string, numPages: number, pdfDoc: any) {

    // If no previous faksimile data is present
    if (faksimile === null || typeof faksimile.pages[num - 1] === "undefined" || typeof faksimile.pages[num - 1].contain === "undefined" || typeof faksimile.pages[num - 1].actualcontain === "undefined") {

      var self = this;
      this.pageRendering = true;

      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function (page) {
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
            var page: Pages = new Pages(num, faksimile.title, src, src, 0);
            faksimile.pages.push(page);
            self.fileService.addFaksimile(faksimile);
          } else {
            var page: Pages = new Pages(num, faksimile.title, src, src, 0);
            if (!self.fileService.checkPage(faksimile, page)) {
              self.fileService.addPage(faksimile, page);
            }
          }

          self.imageOriginal = new MarvinImage();
          self.imageOriginal.load(src, imageLoaded);

          function imageLoaded() {
            var imageProcessed = self.imageOriginal.clone();
            self.fileService.setPreviosContain(faksimile, faksimile.pages[faksimile.actualPage - 1], imageProcessed);
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
          if (self.pageRenderQueue.length != 0) {
            // New page rendering is pending
            var renderFaksimile: Faksimile = self.pageRenderQueue[0];
            self.renderPage(renderFaksimile, renderFaksimile.actualPage, renderFaksimile.title, renderFaksimile.numPages, renderFaksimile.pdfDoc);
            self.pageRenderQueue.shift();
          }
        });
      });
    }
    else {
      this.generateMap(faksimile, num);
      this.generateMinPreview(faksimile);
    }
  }

}
