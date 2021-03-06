import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IdeComponent } from './ide.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { SymbolTableComponent } from './symbol-table/symbol-table.component';
import { MemoryTableComponent } from './memory-table/memory-table.component';
import { IdeSettingsDialogComponent, MenuActionsComponent } from './menu-actions/menu-actions.component';
import { RegisterTableComponent } from './register-table/register-table.component';
import { CacheTableComponent  } from './cache-table/cache-table.component';



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
  IdeComponent, TextEditorComponent, SymbolTableComponent, MemoryTableComponent, MenuActionsComponent, RegisterTableComponent, IdeSettingsDialogComponent, CacheTableComponent
];

