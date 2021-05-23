import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { InstructionModel, DataModel } from '../../../models/memory-word'
import { IdeSettings } from 'src/app/models/ide-settings';
// needed for search bar
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-memory-table',
  templateUrl: './memory-table.component.html',
  styleUrls: ['./memory-table.component.css']
})
export class MemoryTableComponent implements OnInit {
  instructions: InstructionModel[];
  data: DataModel[];
  memory: any; // dictionary siguro. key value pair
  counter: number = 0;
  ideSettings: IdeSettings = 
    {
      numCacheBlocks: '4',
      cacheBlockSize: '4'
    };

  myDataControl = new FormControl();
  myInstructionControl = new FormControl();
  
  // additional layer for filtering
  filteredDataOptions: DataModel[];
  filteredInstructionOptions: InstructionModel[];
  
  // for binding to table and paginator
  dataSource: any;
  instructionSource: any;

  currentInstruction: string;
  @ViewChild('dataPaginator') dataPaginator: MatPaginator;
  @ViewChild('instructionPaginator') instructionPaginator: MatPaginator;
  
  constructor(public ideService: IdeService) {

  }

  ngOnInit() {
    this.memory = {};
    
  }
  
  ngAfterViewInit() {
    const that = this;
    // taga salo ng code
    this.ideService.state$
      .pipe(
        map(state => state.instructions),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newInstructions => {
        that.filteredInstructionOptions = [];
        that.instructions = [];
        that.instructions = newInstructions;
        that.filteredInstructionOptions = this.instructions;
        that.highlightCurrentInstruction();
        this.refreshInstructionTableBindings();
      });
    
      // taga salo ng data
      this.ideService.state$
      .pipe(
        map(state => state.data),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newData => {
        that.filteredDataOptions = [];
        that.data = [];
        newData.map(function (elem, index){
          that.data.push(
            {
              decimalAddress: index.toString(),
              hexAddress: that.ideService.dec2hex(index, 4).toString(),
              value: elem,
              memoryBlock: that.getBlockNumber(index).toString()
            }
          );
        });
        that.filteredDataOptions = this.data;
        this.refreshDataTableBindings();
      });
    
     // taga salo ng ide settings, pang divide ng tables
     this.ideService.state$
     .pipe(
       map(state => state.ideSettings),
       filter(data => data != null),
       distinctUntilChanged()
     )
     .subscribe(newSettings => {
       that.ideSettings = newSettings;
     });
    
     // taga salo ng currently running instruction
     this.ideService.state$
     .pipe(
       map(state => state.currentInstructionAddress),
       filter(data => data != null),
       distinctUntilChanged()
     )
       .subscribe(newInstructionAddress => {
         that.currentInstruction = newInstructionAddress.toString();
         that.highlightCurrentInstruction();   
     });
    
     // handle filters
    this.myDataControl.valueChanges.subscribe(newValue => {
      this.filteredDataOptions = this._filterData(this.data, newValue);
      this.refreshDataTableBindings();
    });

    this.myInstructionControl.valueChanges.subscribe(newValue => {
      this.filteredInstructionOptions = this._filterInstructions(this.instructions, newValue);
      this.refreshInstructionTableBindings();
    });

    
  }

  private refreshDataTableBindings() {
    if (this.filteredDataOptions)
    {
      this.dataSource = new MatTableDataSource<DataModel>(this.filteredDataOptions);
      this.dataSource.paginator = this.dataPaginator;  
    }
  }

  private refreshInstructionTableBindings() {
    if (this.filteredInstructionOptions)
    {
      this.instructionSource = new MatTableDataSource<InstructionModel>(this.filteredInstructionOptions);
      this.instructionSource.paginator = this.instructionPaginator;
    }
  }

  private refreshPaginationBasedOnCurrentInstruction(idx: number) {
    if (this.filteredInstructionOptions)
    {
      this.instructionSource = new MatTableDataSource<DataModel>(this.filteredInstructionOptions);
      this.instructionPaginator.pageIndex = Math.floor(idx / 4);
      this.instructionSource.paginator = this.instructionPaginator;
    }
  }


  private highlightCurrentInstruction(): void{

    if (this.instructions)
    {
      let idx = 0;
      this.instructions.forEach( (item , index) => {
        if (item.decimalAddress == this.currentInstruction) {
          item.color = '#edf8b1';
          idx = index;
        }
        else {
          item.color = 'none';
        }
      });

      this.filteredInstructionOptions = this.instructions;
      this.refreshPaginationBasedOnCurrentInstruction(idx);
    }
  }
  
  private _filterData(collection: DataModel[], value: string): DataModel[] {
    const filterValue = value.toUpperCase();
    
    
    return collection.filter(option => option.hexAddress.toUpperCase().includes(filterValue));
  }

  private _filterInstructions(collection: InstructionModel[], value: string): InstructionModel[] {
    const filterValue = value.toUpperCase();

    return collection.filter(option => option.hexAddress.toUpperCase().includes(filterValue));
  }
  
  private getBlockNumber(i: number)
  {
    return Math.floor(i / (Number(this.ideSettings.cacheBlockSize) * 4));
  }

  // populateMemoryDataSegment()
  // {
  //   this.memory = {};
  //   this.counter = 0;
    
  //   for (let i = 0; i < this.data.length; i++)
  //   {
  //     let item:any = this.data[i];
  //     this.memory[this.counter.toString()] = item;
  //     if (item.type == '.byte')
  //     {
  //       this.counter += 1;
  //     }
  //     if (item.type == '.word')
  //     {
  //       this.counter += 4;
  //     }
  //     if (item.type == '.half')
  //     {
  //       this.counter += 2;
  //     }
  //   }
  //   // reformat the data array to contain the correct addresses
  //   this.data = [];
  //   for (var key in this.memory) {
  //     if (this.memory.hasOwnProperty(key)) {
  //       this.data.push( {address: key, value: this.memory[key]} );
  //     }
  //   }
    

  //     // send an update that Symbol Table will catch
  //     this.ideService.updateMemoryDataSegment(this.data);
  //     console.log(Object.keys(this.memory));
  // }


  // hack
  sorting() { }
}