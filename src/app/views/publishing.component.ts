import { Component } from '@angular/core';

@Component({
  selector: 'publishing',
  template: `
    <br/><em><h1>Catalog</h1></em>
    <font size="5">
      <p class="center">
        <li> <a href="/publishing/Kollationsvorgang_mit_eHinman" routerLink="/publishing/Kollationsvorgang_mit_eHinman">eHinman &ndash; Kollationstool für Musikdrucke</a>
      </p>
    </font>
  `,
  styles: [`
    .displayed {
      display:block;
      margin-left:auto;
      margin-right:auto;
      }
    .center {
      display:block;
      margin-left:5%;
      margin-right:5%;
      }
    h1 {
        text-align:center;
    }
  `],
})
export class PublishingComponent {

}
