import { Component, OnInit, ViewChild } from '@angular/core';
import { ExportComponent } from './user-guide/export/export.component';
import { ImportGuideComponent } from './user-guide/import-guide/import-guide.component';
import { VideoTutorialComponent } from './user-guide/video-tutorial/video-tutorial.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  activeElement = 'guideMenu'
  userGuideDropdown = 'none'

  @ViewChild('importGuide')
  importGuide: ImportGuideComponent;

  @ViewChild('exportGuide')
  exportGuide: ExportComponent;

  @ViewChild('videoTutorialGuide')
  videoTutorialGuide: VideoTutorialComponent;

  constructor() {}
  
  ngOnInit(): void {}

  public toggleGuideMenu()
  { 
    // this.userGuideDropdown = this.userGuideDropdown === 'none'?'block':'none'
    this.activeElement = 'guideMenu'
  }

  open(id){
    this.activeElement = id
  }

}