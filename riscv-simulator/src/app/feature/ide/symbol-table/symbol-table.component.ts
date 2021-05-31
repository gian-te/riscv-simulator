
import { Component, OnInit, ViewChild } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { MatPaginator } from '@angular/material/paginator';
import { SymbolModel } from '../../../models/memory-word'
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-symbol-table',
  templateUrl: './symbol-table.component.html',
  styleUrls: ['./symbol-table.component.css']
})
export class SymbolTableComponent implements OnInit {
  symbols: any;

  filteredSymbolOptions: SymbolModel[];

  symbolSource: any = new MatTableDataSource<SymbolModel>([]);
  @ViewChild('symbolPaginator') symbolPaginator: MatPaginator;

  constructor(private ideService: IdeService) {
    this.symbols = [
    ];
   }
  ngOnInit() { }
  
  ngAfterViewInit() {
    const that = this;
    this.ideService.state$
      .pipe(
        map(state => state.symbols),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newSymbols => {
        that.symbols = [];
        that.filteredSymbolOptions = [];
        that.symbols = newSymbols;
        that.filteredSymbolOptions = that.symbols;
        
        this.refreshSymbolTableBindings();
      });
  }

  refreshSymbolTableBindings() {
      if (this.symbols)
    {
      this.symbolSource = new MatTableDataSource<SymbolModel>(this.filteredSymbolOptions);
      this.symbolSource.paginator = this.symbolPaginator;  
    }
  }

  sorting()
  {
    
  }
}