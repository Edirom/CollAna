import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxFlowChatOptions, NgxFlowChatData } from 'ngx-flowchart'


@Component({
  selector: 'app-import-guide',
  templateUrl: './import-guide.component.html',
  styleUrls: ['./import-guide.component.css']
})
export class ImportGuideComponent implements OnInit {
  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  flowData: NgxFlowChatData[] = [
    {
      id: "1",
      name: "Import zwei Quellen",
      groupData: [{
        id: "2",
        name: "unterstützte Formate: pdf, jpg, png",
      }]
    },
    {
      id: "3",
      name: "Übereinanderlegen"
    },
    {
      id: "4",
      name: "Passend skalieren und rotieren",
    },
    {
      id: "5",
      name: "Zeichenfarbe anpassen",
      groupData: [{
        id: "6",
        name: "Unterstützte Farben: rot, blau, grün, orange",
      }]
    },
    {
      id: "7",
      name: "Hintergrund entfernen",
    },
    {
      id: "8",
      name: "Falls nötig ist, die einzelne Bildbereiche mit  Funktion “perspektivischen Transformation” anpassen",
    },
    {
      id: "9",
      name: "Quellen vergleichen",
    },
    {
      id: "10",
      name: "das Ergebnis exportieren",
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
    width: '200px'
  };

  clickN(event) {
    console.log(event);
  }

  open(content) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result;
	}

}
