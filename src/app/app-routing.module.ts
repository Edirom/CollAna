import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './views/help.component';
import { OverviewComponent } from './views/overview.component';
import { PublishingComponent } from './views/publishing.component';
import { ImportComponent } from './views/import.component';
import { CollationComponent } from './views/collation.component';
import { PublicationEHinmanComponent } from './views/publicationEHinman..component';


const routes: Routes = [
  { path: 'collation', component: CollationComponent },
  { path: 'import', component: ImportComponent },
  { path: 'help', component: HelpComponent },
  { path: 'publishing', component: PublishingComponent },
  { path: 'publishing/eHinman', component: PublicationEHinmanComponent },
  { path: 'overview', component: OverviewComponent },
  { path: '**', redirectTo: 'overview' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
