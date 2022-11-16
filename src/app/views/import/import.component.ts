import { Component } from '@angular/core';
import { FileService } from '../../services';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent {

  constructor(
    private fileService: FileService) {
  }
}