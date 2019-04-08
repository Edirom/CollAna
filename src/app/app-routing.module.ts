import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import { Page1Component } from './page1/page1.component'

const routes: Routes = [];
/*const routes: Routes = [
  { path: 'page1', component: Page1Component }
];*/

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
