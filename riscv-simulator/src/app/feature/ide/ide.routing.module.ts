import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IdeComponent } from './ide.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { SymbolTableComponent } from './symbol-table/symbol-table.component';
import { MemoryTableComponent } from './memory-table/memory-table.component';
import { MenuActionsComponent } from './menu-actions/menu-actions.component';



export const routes: Routes = [
  {
    path: '',
    component: IdeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdeRoutingModule { }

export const routedComponents = [
  // [GT] these are the components that get packaged in the feature module
  IdeComponent, TextEditorComponent, SymbolTableComponent, MemoryTableComponent, MenuActionsComponent
];

