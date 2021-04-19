import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IdeComponent } from './ide.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { SymbolTableComponent } from './symbol-table/symbol-table.component';
import { MemoryTableComponent } from './memory-table/memory-table.component';



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
  IdeComponent, TextEditorComponent, SymbolTableComponent, MemoryTableComponent
];

