import { Component } from '@angular/core';
import { FileService } from '../services';
//import { Http } from '@angular/http';

@Component({
  selector: 'import',
  template: `
    <h1></h1>
  `,
})
export class ImportComponent {

  constructor(
    private fileService: FileService) {

  }
}
