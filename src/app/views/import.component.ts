import { Component } from '@angular/core';
import { FileService } from '../services';

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
