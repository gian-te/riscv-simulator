
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { Word } from '../../../models/memory-word'
import { IdeSettings } from 'src/app/models/ide-settings';
// needed for search bar
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-memory-table',
  templateUrl: './memory-table.component.html',
  styleUrls: ['./memory-table.component.css']
})
export class MemoryTableComponent implements OnInit {
  instructions: Word[];
  data: string[]
  memory: any; // dictionary siguro. key value pair
  counter: number = 0;
  ideSettings: IdeSettings = 
    {
      numCacheBlocks: '4',
      cacheBlockSize: '4'
    };

  myDataControl = new FormControl();
  myInstructionControl = new FormControl();
  
  filteredDataOptions: string[];
  filteredInstructionOptions: Word[];
  
  currentInstruction: string;

  constructor(public ideService: IdeService) {
    // pano natin pagkakasyahin 1024 slots sa UI? lol
    // i-bibind natin ito dun sa service, sa service dapat naka lagay para auto update
    this.instructions = [
      // {
      //   address: "1000",
      //   value: "0x00000000",
      //   //color: 'lightblue'
      // }
    ];

    this.data = [
      // {
      //   address: "0000",
      //   value: "0x00000000",
      //   //color: 'lightblue'
      // }
    ];


  }

  ngOnInit() {
    this.memory = { };
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
        that.data = newData;
        that.filteredDataOptions = this.data;
      });
    
     // taga salo ng ide settings, pang divide ng tables
     this.ideService.state$
     .pipe(
       map(state => state.ideSettings),
       filter(data => data != null),
       distinctUntilChanged()
     )
     .subscribe(newData => {
       that.ideSettings = newData;
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
    });

    this.myInstructionControl.valueChanges.subscribe(newValue => {
      this.filteredInstructionOptions = this._filterInstructions(this.instructions, newValue);
    });

    
  }

  private highlightCurrentInstruction(): void{

    if (this.filteredInstructionOptions)
    {
      this.filteredInstructionOptions.forEach(item => {
        if (item.decimalAddress == this.currentInstruction) {
          item.color = '#edf8b1';
        }
        else {
          item.color = 'none';
        }
      });
    }
   
  }
  
  private _filterData(collection: string[], value: string): string[] {
    const filterValue = value.toUpperCase();
    let retVal: string[] = [];
    for (let i = 0; i > collection.length; i++)
    {
      let address = this.ideService.dec2hex(i, 4);
      if (address.toUpperCase() == filterValue)
      {
        retVal.push(collection[i]);
      }
    }

    return retVal;
  }

  private _filterInstructions(collection: Word[], value: string): Word[] {
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