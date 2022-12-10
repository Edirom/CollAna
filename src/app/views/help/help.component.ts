import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatDrawerMode} from '@angular/material/sidenav';


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  constructor() { }
  mode = new FormControl('over' as MatDrawerMode);
  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);

  ngOnInit(): void {
  }

}