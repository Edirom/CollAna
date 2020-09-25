import { Component, AfterViewInit } from '@angular/core';
import { FileService } from '../services';
import { MapService } from '../services/map.service';
import { Faksimile } from '../types/faksimile';
import { CdkDragEnd, CdkDragMove } from "@angular/cdk/drag-drop";
import { FileComponent } from '../file/file.component';

import { saveAs } from 'file-saver';

declare let html2canvas: any;
//import { Http } from '@angular/http';

@Component({
  selector: 'collation',
  template: `
  <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
  <div fxLayout="row" fxLayoutGap="10px">
    <div>
      <fileservice (complete)="import($event)"> </fileservice>
    </div>
    <div>
      <div class="btn btn-file btn-outline-primary" data-toggle="tooltip" data-placement="right" (click)="export()" title="Export Overlap"> <i class="fa fa-upload fa-lg"> </i> <span class="hidden-xs-down"> </span></div>
    </div>
  </div>
</nav>
<div style="font-size:20px">
  <div class="container-fluid"  *ngIf="faksimiles?.length > 0" fxLayoutAlign="space-between">
    <div fxFlex="93%" fxLayoutGap="5px" fxLayout="column"  id="capture" >
      <div id="{{ 'card-div' + a.ID}}" *ngFor="let a of faksimiles;">
        <div class="ol-boxnew" id="{{ 'card-block' + a.ID}}" cdkDrag (cdkDragMoved)="drag_maxi_block_Moved($event, a)" (cdkDragStarted)="drag_maxi_block_Started($event, a)" [style.border-color]="a.Color">
        </div>
        <div id="{{ 'overlay' + a.ID}}"></div>
      </div>

    </div>
    <div class="faksimile-mini-boundary">
      <div fxFlex="5%" fxLayoutGap="5px" fxLayout="column">
        <div *ngFor="let a of faksimiles; trackBy:trackByIndex">
          <div class="faksimile-box text " cdkDragBoundary=".faksimile-mini-boundary" cdkDragLockAxis="y" cdkDrag (cdkDragMoved)="drag_mini_block_Moved($event, a)" [style.border-color]="a.Color" [style.color]="a.Color" (cdkDragStarted)="drag_mini_block_Started($event, a)" (cdkDragEnded)="drag_mini_block_Ended($event, a)" id="{{ 'mini-card-canvas' + a.ID}}">  </div>

        </div>
      </div>
    </div>
  </div>
 </div>
  `,
 
})
export class CollationComponent implements AfterViewInit {
  faksimiles: Faksimile[];
  ngAfterViewInit() {
    this.faksimiles = this.fileService.getFaksimiles();
    // this.removeMaps();
    this.mapService.removeAllMaps();
    this.generateMap();
    
    

  }


  generateMap() {
    this.faksimiles = this.fileService.getFaksimiles();
    this.faksimiles.forEach(a => this.fileComponent.generateMap(a, a.actualPage));
    this.faksimiles.forEach(a => this.fileComponent.generateMinPreview(a));
  }

  constructor(
    private fileService: FileService, private fileComponent: FileComponent, private mapService: MapService) {
    this.faksimiles = this.fileService.getFaksimiles();
    //this.faksimiles.forEach(a => this.fileComponent.generateMap(a, a.actualPage)); 
  }



  inc_index = 100;
  //data = '<h1 align="center"><em>eHinman &ndash; Kollationstool für Musikdrucke </em></h1> <p>&nbsp; </p><center> <img class="displayed" src="../assets/images/Mockup.png" width="80%"></center><p>&nbsp; </p> <p>&nbsp; </p><p> Kleine Differenzen zwischen historischen Drucken eines musikalischen Werks können große Auswirkung auf deren Einordnung in die Entstehungs - bzw. Überlieferungsgeschichte haben. </p><p> Das &bdquo; <em>Zentrum Musik &ndash; Edition &ndash; Medien </em>&ldquo; (<em>ZenMEM</em>) hat seinen besonderen Schwerpunkt auf dem Gebiet nichttextueller bzw. hybrider Objekte im Umfeld von Musikeditionen. Das Erstellen historisch - kritischer Ausgaben musikalischer Werke basiert auf der Auswertung von Autografen der Komponisten, von Abschriften, von Drucken unterschiedlichster Verleger sowie zusätzlicher sekundärer Quellen, z.B. Briefen oder Tagebüchern. Dabei muss der Editor die verfügbaren Quellen analysieren, kleinste Unterschiede erkennen, dokumentieren und die Abweichungen bewerten. Insbesondere bei den in der Regel undatierten Druckausgaben mit ihren mehrfachen und teils überarbeiteten späteren Abzügen stellt die chronologische Ordnung eine Herausforderung dar. Bislang bereitet der hierzu nötige akribische Vergleich dieser Abzüge ohne dafür geeignete Werkzeuge einen enormen Arbeitsaufwand für den Musikwissenschaftler. Deshalb soll mit dem eHinman ein Tool geschaffen werden, das Wissenschaftlerinnen und Wissenschaftlern diese Arbeit künftig erleichtert &ndash; dieses Tool käme aber zugleich auch praktischen Musikerinnen und Musikern, z.B. Dirigenten oder Notensetzern, zugute: Mithilfe des hier beschriebenen Tools lassen sich verfügbare unterschiedliche Druckstadien einer Sinfonie oder Oper oder ähnlich strukturierte Ausgaben direkt am Computer miteinander vergleichen. Mittels Algorithmen sollen längerfristig automatisch Unterschiede erkannt und farblich markiert werden, gleichzeitig hat der Editor die Möglichkeit, einzelne Kopien übereinanderzulegen, um kleinste, für das menschliche Auge oft erst nach intensivem Vergleich ersichtliche Differenzen, wie z.B. unterschiedliche Tonhöhen, abweichende Bögen, Artikulations - oder Dynamikzeichen sowie unterschiedliche Schlüsselformen, Balkensteigungen, Notenabstände etc. erkennen zu können &ndash; zuvor eine aufwendige manuelle Prozedur. Mit einem solchen Werkzeug lassen sich die auf dem eingehenden Vergleich von Vorlagen beruhenden Datierungshypothesen in Zukunft sehr viel müheloser und erheblich schneller erstellen und überprüfen, zugleich erhalten Notensetzer für ihre Herstellungsprozesse ein sehr effizientes Kontrollinstrument. </p><p> Eine Anbindung des Werkzeugs an das IIIF - Format ist geplant &ndash; damit könnten dann auch Ausgaben aus unterschiedlichen Bibliotheken und Archiven direkt am Bildschirm kollationiert werden. </p><p>Die Idee dieses Werkzeugs knüpft an den in den 1940 - er Jahren von Charlton Hinman entwickelten und in der Shakespeare - Forschung eingesetzten &bdquo;Hinman - Collator &ldquo; an, bei dem unterschiedliche Auflagen über ein kompliziertes Beleuchtungsverfahren mit Hilfe von Spiegel übereinandergeblendet wurden, so dass Eingriffe in die Druckplatten leicht erkennbar wurden. Ein vergleichbares Tool hat vor einigen Jahren Laurent Pugin im Rahmen des Aruspix - Projekts an der McGill - Universität entwickelt &ndash; sein, auf Musikdrucke des 16. / 17. Jahrhunderts zentriertes Verfahren war aber als Vorstufe eines Optical Music - Recognition - Prozesses konzipiert. Das nun entwickelte Werkzeug soll auf Musik mit größerer Zeichendichte und - vielfalt, aber auch auf Texte anwendbar sein und eine aufgabenspezifische Vorbereitung der Vorlagen ermöglichen.</p>';

  mini_old_boundingClientRect: any;
  maxi_old_boundingClientRect: any;




  trackByIndex(index: number, faksimile: Faksimile): any {
    faksimile.index = index;
    return index;
  }

  import(data: any): void {
    this.faksimiles = this.fileService.getFaksimiles();
  }

  export() {
    if (this.faksimiles.length == 0) {
      window.alert("No Data to export!");
      return;
    }
    var input = "";
    var output = "";
    this.faksimiles.forEach(function (faksimile) {
      input = faksimile.title;
      output = output + input.substr(0, input.lastIndexOf('.')) + "_" + "Page" + faksimile.actualPage + "_";
    });
    html2canvas(document.querySelector("#capture")).then(canvas => {
      canvas.toBlob(function (blob) {
        saveAs(blob, output + ".png");
      });
    });
  }


  drag_maxi_block_Moved(event: CdkDragMove, faksimile: Faksimile) {
    let element = document.getElementById('card-block' + faksimile.ID);
    let boundingClientRect: any = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    let drag_element = document.getElementById('mini-card-canvas' + faksimile.ID);

    //console.log("boundingClientRect.y" + boundingClientRect.y);

    var newPos = ((boundingClientRect.y * 100) / boundingClientRect.height);
    if (newPos < 0)
      newPos = 0;
    drag_element.style.top = newPos + "px";
    this.inc_index = ++this.inc_index
    drag_element.style.zIndex = this.inc_index.toString();

   // console.log("Moved" + parentPosition.top)
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
