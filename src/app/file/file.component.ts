import { Output, Component, EventEmitter } from '@angular/core';
import { FileService } from '../services';
import { Faksimile } from '../types/faksimile';

@Component({
  selector: 'fileservice',
  template: '<div class="btn btn-file btn-outline-primary"><i class= "fa fa-upload fa-lg" > </i><span class= "hidden-xs-down" > Import </span><input type="file"   (change)="onSelectFile($event)" accept=".jpg, .png, .*" /></div>',
  styleUrls: ['./file.component.css']
})

export class FileComponent {
  @Output() complete: EventEmitter<any> = new EventEmitter();


  faksimile: Faksimile;
  contain = '';
  constructor(private fileService: FileService) {

  }

  onSelectFile(event: any) {
    var self = this;
    var file: File = event.target.files[0];
    var myReader: FileReader = new FileReader();

    myReader.readAsDataURL(file);
    //var resultSet = [];
    myReader.onloadend = function (e) {
      self.contain = e.target.result;
      var faksimile = new Faksimile(file.name, self.contain);
      self.fileService.addFaksimile(faksimile);
      self.complete.next({
        fileContent: myReader.result,
        fileName: file.name
      }); // pass along the data which whould be used by the parent component

    };

    //self.fileService.setUrl(self.contain);
    
  }


}
