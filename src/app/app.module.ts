import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularDraggableModule } from 'angular2-draggable';
import { Routes, RouterModule } from '@angular/router';
import { ResizableModule } from 'angular-resizable-element';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileComponent } from './file/file.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HelpComponent } from './views/help.component';
import { OverviewComponent } from './views/overview.component';
import { PublishingComponent } from './views/publishing.component';
import { ImportComponent } from './views/import.component';
import { CollationComponent } from './views/collation.component';
import { PublicationEHinmanComponent } from './views/publicationEHinman.component';


@NgModule({
  declarations: [
    AppComponent,
    FileComponent,
    HelpComponent,
    OverviewComponent,
    PublishingComponent,
    ImportComponent,
    CollationComponent,
    PublicationEHinmanComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    AngularDraggableModule,
    DragDropModule,
    ResizableModule
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
