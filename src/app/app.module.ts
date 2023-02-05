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

import { HelpComponent } from './views/help/help.component';
import { OverviewComponent } from './views/overview/overview.component';
import { ImportComponent } from './views/import/import.component';
import { CollationComponent } from './views/collation/collation.component';
import { PublishingComponent } from './views/publishing/publishing.component';
import { EHinmanComponent } from './views/publishing/e-hinman/e-hinman.component';
import { ExportComponent } from './views/help/user-guide/export/export.component';
import { VideoTutorialComponent } from './views/help/user-guide/video-tutorial/video-tutorial.component';
import { ImportGuideComponent } from './views/help/user-guide/import-guide/import-guide.component';
import { NgxFlowchartModule } from 'ngx-flowchart';


@NgModule({
  declarations: [
    AppComponent,
    FileComponent,
    HelpComponent,
    OverviewComponent,
    PublishingComponent,
    ImportComponent,
    CollationComponent,
    EHinmanComponent,
    ExportComponent,
    VideoTutorialComponent,
    ImportGuideComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    AngularDraggableModule,
    DragDropModule,
    ResizableModule,
    NgxFlowchartModule
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
