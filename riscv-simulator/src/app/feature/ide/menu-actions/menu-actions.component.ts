
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';

  
@Component({
  selector: 'app-menu-actions',
  templateUrl: './menu-actions.component.html',
  styleUrls: ['./menu-actions.component.css']
})
  
export class MenuActionsComponent implements OnInit {

  constructor(private ideService: IdeService)
  {

  }
  
  menuClicked(e, menu: string) {
    console.log(e);
    console.log(menu);
    this.ideService.assembling(true);
  }
  
  ngOnInit(){}
}