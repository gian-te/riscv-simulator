
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
  variables: any;

  constructor(private ideService: IdeService) {
    this.variables = [
      {
        address: "0",
        name: "sample_var",
        type: ".word"
      }
    ];
   }
  ngOnInit() { }
  
  ngAfterViewInit() {
    const that = this;
    this.ideService.state$
      .pipe(
        map(state => state.memory),
        filter(data => data != null),
        //distinctUntilChanged()
      )
      .subscribe(variables => {
        that.variables = variables;
      });
  }
}