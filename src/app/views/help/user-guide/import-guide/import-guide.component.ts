import { Component, OnInit } from '@angular/core';
import { NgxFlowChatOptions, NgxFlowChatData } from 'ngx-flowchart'


@Component({
  selector: 'app-import-guide',
  templateUrl: './import-guide.component.html',
  styleUrls: ['./import-guide.component.css']
})
export class ImportGuideComponent implements OnInit {
  active = 'flowchart';
  constructor() { }

  ngOnInit(): void {
  }

  
  flowData: NgxFlowChatData[] = [
    {
      id: "1",
      name: "Import sources for comparision",
      groupData: [{
        id: "2",
        name: "Two sources can be imported and the supported formats are: *.pdf, *.jpg, *.png",
      }]
    },
    {
      id: "3",
      name: "Change the color of imported source",
      groupData: [{
        id: "4",
        name: "The color of both the source files can be changed for better differentiation. The supported colors are: Red, Blue, Green, Orange",
      }]
    },
    {
      id: "5",
      name: "Drag and drop for comparision between two sources",
      groupData: [{
        id: "6",
        name: "The superimposing using the drag and drop function can help to see the content on top of one another. The removal of background in the sources is also possible for more clarity.",
      }]
    },
    {
      id: "7",
      name: "Scaling and Rotation to adjust pages",
      groupData: [{
        id: "8",
        name: "Both the source file displays can be scale and rotated as per the user's requirement for the best results.",
      }]
    },
    {
      id: "9",
      name: "Perspective Transformation",
      groupData: [{
        id: "10",
        name: "If neccessary, the individual image areas can be adjusted using this function.",
      }]
    },
    {
      id: "11",
      name: "Compare sources",
      groupData: [{
        id: "12",
        name: "After all the above preparatory steps, the sources can be compared before the the final export of the pictures so that the differences are now quickly noticed.",
      }]
    },
    {
      id: "13",
      name: "Export corrected prints",
      groupData: [{
        id: "14",
        name: "For documentation, the view of superimposed sources can be exported as an image. The final result can be exported in any of the following formats: *.jpg,*.png.",
      }]
    },
  ];

  flowOptions: NgxFlowChatOptions = {
    groupBackground: 'linear-gradient(rgb(185, 185, 185) 0px, rgb(254, 254, 254) 100%)',
    groupShadow: '0 0.3rem 0.5rem 0 rgba(44,51,73,.5)',
    groupBorderRadius: '3px',
    groupTextColor: '#000',
    background: '#0e3e7d',
    shadow: '0 2px 4px 0 #333',
    borderRadius: '5px',
    textColor: '#fff',
    width: '300px'
  };

  clickN(event) {
    console.log(event);
  }

}
