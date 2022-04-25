import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from "@angular/router";

import 'zone.js';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{


  constructor(
    protected Sanitizer: DomSanitizer, private router: Router) {

  }

  routeIsActive(routePath: string) {
    return this.router.url == routePath;
  }


  title = 'CollAna';
}
