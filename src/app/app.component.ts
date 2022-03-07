import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from "@angular/router";



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

 
  title = 'eHinman';
}
