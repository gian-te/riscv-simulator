
import { Component, OnInit, ViewChild } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { CacheModel, Word } from '../../../models/memory-word'
import { IdeSettings } from 'src/app/models/ide-settings';

// needed for search bar
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


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
  blocks: any = Array(Number(this.ideSettings.numCacheBlocks)).fill(0).map((x,i)=>i);
  unique: any = [];
  
  myCacheBlockControl = new FormControl();

  filteredCacheBlockOptions: CacheModel[];

  cacheSource: any =  new MatTableDataSource<CacheModel>([]);;

  hits: number = 0;
  misses: number = 0;
  hitRate: number = 0;
  missRate: number = 0;

  @ViewChild('cachePaginator') cachePaginator: MatPaginator;

  constructor(private ideService: IdeService) {

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
        map(state => state.cache),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newCacheItems => {
        that.blocks = []
        that.blocks = newCacheItems;
        that.unique = [...new Set(newCacheItems.filter(item => item.cacheBlock).map(item => item.cacheBlock))];
        that.filteredCacheBlockOptions = this.blocks;
        that.refreshCacheTableBindings();
      });
    
      this.ideService.state$
      .pipe(
        map(state => state.cacheHit),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newCacheHitTally => {
        this.hits = newCacheHitTally;
        if (Number(this.hits) == 0)
        {
          this.hitRate = 0;
          
        }
        else if (Number(this.misses) > 0 || Number(this.hits) > 0) // avoid divide by 0
        {
          this.hitRate = this.hits/ (this.hits + this.misses) * 100
          this.missRate = this.misses/ (this.hits + this.misses) * 100
        }        

      });
    
      this.ideService.state$
      .pipe(
        map(state => state.cacheMiss),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newCacheMissTally => {
        this.misses = newCacheMissTally;
        if (Number(this.misses) == 0)
        {
          this.missRate = 0;
          
        }
        else if (Number(this.misses) > 0 || Number(this.hits) > 0) // avoid divide by 0
        {
          this.missRate = this.misses/ (this.hits + this.misses) * 100
          this.hitRate = this.hits/ (this.hits + this.misses) * 100
        }
       
      });
    
     // taga salo ng ide settings, pang divide ng blocks
     this.ideService.state$
     .pipe(
       map(state => state.ideSettings),
       filter(data => data != null),
       distinctUntilChanged()
     )
     .subscribe(newSettings => {
       that.ideSettings = newSettings;
       that.blocks = Array(Number(that.ideSettings.numCacheBlocks)).fill(null).map((x, i) => ({  }));
       that.filteredCacheBlockOptions = that.blocks;
     });
    
     this.myCacheBlockControl.valueChanges.subscribe(newValue => {
       this.filteredCacheBlockOptions = this.filterCacheBlocks(this.blocks, newValue);
       this.refreshCacheTableBindings();
    });
  }

  private refreshCacheTableBindings() {
    if (this.filteredCacheBlockOptions)
    {
      this.cacheSource = new MatTableDataSource<CacheModel>(this.filteredCacheBlockOptions);
      this.cacheSource.paginator = this.cachePaginator;  
    }
  }
  
  private filterCacheBlocks(collection: CacheModel[], value: string): CacheModel[] {
    const filterValue = value.toUpperCase();

    return collection.filter(option => option.cacheBlock.toUpperCase().includes(filterValue));
  }
  
  // hack
  sorting() { }
}