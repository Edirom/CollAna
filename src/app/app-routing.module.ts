import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './views/help/help.component';
import { OverviewComponent } from './views/overview/overview.component';
import { ImportComponent } from './views/import/import.component';
import { CollationComponent } from './views/collation/collation.component';
import { PublishingComponent } from './views/publishing/publishing.component';
import { EHinmanComponent } from './views/publishing/e-hinman/e-hinman.component';


const routes: Routes = [
  { path: 'collation', component: CollationComponent },
  { path: 'import', component: ImportComponent },
  { path: 'help', component: HelpComponent },
  { path: 'publishing', component: PublishingComponent },
  { path: 'publishing/eHinman', component: EHinmanComponent },
  { path: 'overview', component: OverviewComponent },
  { path: '', redirectTo: '/overview', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
