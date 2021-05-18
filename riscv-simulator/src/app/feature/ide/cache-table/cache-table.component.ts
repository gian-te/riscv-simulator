
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { Word } from '../../../models/memory-word'
import { IdeSettings } from 'src/app/models/ide-settings';

// needed for search bar
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-cache-table',
  templateUrl: './cache-table.component.html',
  styleUrls: ['./cache-table.component.css']
})
export class CacheTableComponent implements OnInit {
  instructions: Word[];
  data: Word[]
  memory: any; // dictionary siguro. key value pair
  counter: number = 0;
  ideSettings: IdeSettings = 
    {
      numCacheBlocks: '4', // number of blocks
      cacheBlockSize: '4'    // 4 words per block
    };
  blocks = Array(Number(this.ideSettings.numCacheBlocks)).fill(0).map((x,i)=>i);

  myCacheBlockControl = new FormControl();

  filteredCacheBlockOptions: number[];

  constructor(private ideService: IdeService) {
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
    this.filteredCacheBlockOptions = this.blocks;
  }
  
  ngAfterViewInit() {
    const that = this;
    this.ideService.updateSettings(this.ideSettings);
    // taga salo ng code
    this.ideService.state$
      .pipe(
        map(state => state.instructions),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newInstructions => {
        that.instructions = newInstructions;
      });
    
      // taga salo ng data
      this.ideService.state$
      .pipe(
        map(state => state.data),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newData => {
        that.data = newData;
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
       that.blocks = Array(Number(that.ideSettings.numCacheBlocks)).fill(0).map((x, i) => i);
       that.filteredCacheBlockOptions = that.blocks;
     });
    
     this.myCacheBlockControl.valueChanges.subscribe(newValue => {
      this.filteredCacheBlockOptions = this._filter(this.blocks, newValue);
    });
  }
  
  private _filter(collection: number[], value: string): number[] {
    const filterValue = value;

    return collection.filter(option => option.toString().includes(filterValue));
  }
  
  // hack
  sorting() { }
}