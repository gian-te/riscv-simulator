
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
  memoryWords: Word[];

  constructor(private ideService: IdeService) {
    // i-bibind natin ito dun sa service, sa service dapat naka lagay para auto update
    this.memoryWords = [
      {
        address: "0x1111",
        value: "0x00000000",
        color: 'lightblue'
      }
    ];

  }

  menuClicked(e, menu: string) {
    console.log(e);
    console.log(menu);
    this.ideService.assembling(true);
  }

  ngOnInit() { }
  
  ngAfterViewInit() {
    const that = this;
    this.ideService.state$
      .pipe(
        map(state => state.memoryWords),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(newWords => {
        that.memoryWords = newWords;
      });
  }
}