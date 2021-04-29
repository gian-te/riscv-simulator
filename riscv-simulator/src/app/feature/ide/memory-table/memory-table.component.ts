
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { Word } from '../../../models/memory-word'


@Component({
  selector: 'app-memory-table',
  templateUrl: './memory-table.component.html',
  styleUrls: ['./memory-table.component.css']
})
export class MemoryTableComponent implements OnInit {
  instructions: Word[];
  data: Word[]
  memory: any; // dictionary siguro. key value pair
  counter: number = 0;

  constructor(private ideService: IdeService) {
    // i-bibind natin ito dun sa service, sa service dapat naka lagay para auto update
    this.instructions = [
      {
        address: "0x1000",
        value: "0x00000000",
        //color: 'lightblue'
      }
    ];

    this.data = [
      {
        address: "0x0000",
        value: "0x00000000",
        //color: 'lightblue'
      }
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
        // pagka salo ng data, kailangan natin sabihin bigyan ng address yung data
        this.populateMemoryDataSegment();
      });
  }
  
  populateMemoryDataSegment()
  {
    this.memory = {};
    this.counter = 0;
    // pano i popopulate to?
    for (let i = 0; i < this.data.length; i++)
    {
      this.memory[this.counter.toString()] = this.data[i];
      this.counter += 4;
    }
      this.ideService.updateMemoryDataSegment(this.memory);
      console.log(Object.keys(this.memory));
  }
}