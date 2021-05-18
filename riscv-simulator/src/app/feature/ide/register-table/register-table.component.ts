
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import { Word } from '../../../models/memory-word'


@Component({
  selector: 'app-register-table',
  templateUrl: './register-table.component.html',
  styleUrls: ['./register-table.component.css']
})
export class RegisterTableComponent implements OnInit {
  instructions: Word[];
  data: Word[]
  memory: any; // dictionary siguro. key value pair
  counter: number = 0;
  listOfSupportedRegisters: any = 
    {
      'x0':'00000000',
      'x1':'00000000',
      'x2':'00000000',
      'x3':'00000000',
      'x4':'00000000',
      'x5':'00000000',
      'x6':'00000000',
      'x7':'00000000',
      'x8':'00000000',
      'x9':'00000000',
      'x10':'00000000',
      'x11':'00000000',
      'x12':'00000000',
      'x13':'00000000',
      'x14':'00000000',
      'x15':'00000000',
      'x16':'00000000',
      'x17':'00000000',
      'x18':'00000000',
      'x19':'00000000',
      'x20':'00000000',
      'x21':'00000000',
      'x22':'00000000',
      'x23':'00000000',
      'x24':'00000000',
      'x25':'00000000',
      'x26':'00000000',
      'x27':'00000000',
      'x28':'00000000',
      'x29':'00000000',
      'x30':'00000000',
      'x31':'00000000'};

  constructor(private ideService: IdeService) {


  }

  ngOnInit() {
    this.memory = {};
    
    this.ideService.updateRegisters(this.listOfSupportedRegisters);
  }
  
  ngAfterViewInit() {

    const that = this;
    // dito sasaluhin natin yung changes sa registers, habang nag rurun yung code mag seset state yung runner natin pag may changes sa values ng registers
    this.ideService.state$
      .pipe(
        map(state => state.registers),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(updatedRegisters => {
        that.listOfSupportedRegisters = updatedRegisters;
      });
    
    
  }
}