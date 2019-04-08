import { Component, OnDestroy } from '@angular/core';
import { FileService } from './services';
import { Faksimile } from './types/faksimile';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  faksimiles: Faksimile[];

  constructor(private fileService: FileService) {
    //this.page = 0;
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

  title = 'ng7-pre';
}
