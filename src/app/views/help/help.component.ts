import { Component, OnInit, ViewChild } from '@angular/core';
import { display } from 'html2canvas/dist/types/css/property-descriptors/display';
import { GuideType } from 'src/app/types/guidetype';
import { ExportComponent } from './user-guide/export/export.component';
import { ImportGuideComponent } from './user-guide/import-guide/import-guide.component';
import { VideoTutorialComponent } from './user-guide/video-tutorial/video-tutorial.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  isCollapsed: Boolean = true;
  isContact: Boolean;

  @ViewChild('importGuide')
  importGuide: ImportGuideComponent;

  @ViewChild('exportGuide')
  exportGuide: ExportComponent;

  @ViewChild('videoTutorialGuide')
  videoTutorialGuide: VideoTutorialComponent;

  guideType: typeof GuideType= GuideType

  activeGuideType: GuideType;

  showList: boolean =true;

  contactMenu = document.getElementById("contact-menu");

  constructor() { }
  
  ngOnInit(): void {
    this.collapse()
  }

  public collapse()
  { 
    this.showList = true;
    this.isContact = false;
    var content = document.getElementById("content");
    var guideMenu = document.getElementById("guide-menu")
    var contactMenu = document.getElementById("contact-menu");
    contactMenu.classList.remove("active")
    guideMenu.classList.add("active")
    console.log(content)
    if(content.style.display === "block")
    {
      this.activeGuideType = null;
      this.isCollapsed = true;
      content.style.display="none"
    }
    else 
    {
      this.isCollapsed = false;
      content.style.display = "block"
    }
  }

  show(guideType: GuideType)
  {
    var contactMenu = document.getElementById("contact-menu");
    contactMenu.classList.remove("active")
    this.isContact = false;
    this.showList = false;
    this.activeGuideType = guideType;
  }

  contact()
  {
    this.isContact = true;
    this.activeGuideType = null;
    this.showList = false;
    var guideMenu = document.getElementById("guide-menu");
    var contactMenu = document.getElementById("contact-menu");
    guideMenu.classList.remove("active");
    contactMenu.classList.add("active")
  }

}