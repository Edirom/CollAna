import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { DomSanitizer } from '@angular/platform-browser';
import { Faksimile } from './types/faksimile';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  faksimiles: Faksimile[];

  constructor(
    private fileService: FileService,
    protected Sanitizer: DomSanitizer) {

  }

 
  import(data: any): void {
    this.faksimiles = this.fileService.getFaksimiles();
  }


  title = 'ng7-pre';
}
