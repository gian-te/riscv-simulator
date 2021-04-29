import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ide'
  },
  {
    path: 'ide',
    pathMatch: 'full',
    loadChildren: () => import(`./feature/ide/ide.module`).then(m => m.IdeModule)
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
