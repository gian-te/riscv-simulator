import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { IdeComponent } from './ide.component';
import { IdeRoutingModule, routedComponents } from './ide.routing.module';
import { IdeService } from './ide.service';
import { IdeSettingsDialogComponent } from './menu-actions/menu-actions.component';


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
  entryComponents: [
    IdeSettingsDialogComponent
  ],
  imports: [
    CommonModule,
    IdeRoutingModule,
    // add as needed depending on what we want to plug in to our UI
    FormsModule, // angular forms modules
    ReactiveFormsModule, // needed for formControl
    MatMenuModule, MatGridListModule, MatCardModule, MatToolbarModule, MatButtonModule, MatDialogModule, MatInputModule, MatAutocompleteModule, MatTableModule, MatPaginatorModule// angular material modules
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
