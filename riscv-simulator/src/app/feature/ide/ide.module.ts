import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

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
    IdeRoutingModule
    // add as needed depending on what we want to plug in to our UI
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
