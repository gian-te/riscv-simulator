
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { Symbol } from '../../../models/symbol'
  
@Component({
  selector: 'app-symbol-table',
  templateUrl: './symbol-table.component.html',
  styleUrls: ['./symbol-table.component.css']
})
export class SymbolTableComponent implements OnInit {
  variables: Symbol[];

  constructor(private ideService: IdeService) {
    this.variables = [
      {
        address: "0x1111",
        name: "var1",
        type: ".float"
      }
    ];
   }
  ngOnInit(){}
}