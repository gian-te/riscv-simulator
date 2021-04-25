import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule } from '@angular/forms'
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button';

import { IdeComponent } from './ide.component';
import { IdeRoutingModule, routedComponents } from './ide.routing.module';
import { IdeService } from './ide.service';


export const routes: Routes = [
  {
    path: '',
    component: IdeComponent,
  }
];


@NgModule({
  declarations: [
    routedComponents,
    // container component
    IdeComponent,
  ],
  imports: [
    CommonModule,
    IdeRoutingModule,
    // add as needed depending on what we want to plug in to our UI
    FormsModule, // angular forms modules
    MatMenuModule, MatGridListModule, MatCardModule, MatToolbarModule, MatButtonModule// angular material modules
  ],
  exports:
    [
      IdeComponent
    ],
  providers: [
    IdeService
  ],
})
export class IdeModule { }
