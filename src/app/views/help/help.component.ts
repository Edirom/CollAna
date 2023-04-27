import { Component, OnInit, ViewChild } from '@angular/core';
import { ContactComponent } from './contact/contact.component';
import { InstructionComponent } from './instruction/instruction.component';
import { IntroductionComponent } from './introduction/introduction.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  activeElement = 'introduction'
  userGuideDropdown = 'block'

  @ViewChild('contact')
  contact: ContactComponent;

  @ViewChild('introduction')
  introduction: IntroductionComponent;

  @ViewChild('instruction')
  instruction: InstructionComponent;

  constructor() {}
  

  ngOnInit(): void {
    document.getElementById('introduction').classList.add('active')
  }

  public toggleGuideMenu()
  { 
    if(this.userGuideDropdown === "none"){
      this.userGuideDropdown = 'block'
      this.removeActiveClass()
      this.activeElement = 'introduction'
      document.getElementById('introduction').classList.add('active')
    }else{
      this.userGuideDropdown = 'none'
    }
  }

  removeActiveClass(){
    document.getElementById('introduction').classList.remove('active')
    document.getElementById('instruction').classList.remove('active')
    document.getElementById('contact').classList.remove('active')
  }

  open(id){
    this.removeActiveClass()
    this.activeElement = id 
    document.getElementById(id).classList.add('active')
  }

}