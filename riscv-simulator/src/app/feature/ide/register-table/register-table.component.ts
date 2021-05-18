
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
      'X0':'00000000',
      'X1':'00000000',
      'X2':'00000000',
      'X3':'00000000',
      'X4':'00000000',
      'X5':'00000000',
      'X6':'00000000',
      'X7':'00000000',
      'X8':'00000000',
      'X9':'00000000',
      'X10':'00000000',
      'X11':'00000000',
      'X12':'00000000',
      'X13':'00000000',
      'X14':'00000000',
      'X15':'00000000',
      'X16':'00000000',
      'X17':'00000000',
      'X18':'00000000',
      'X19':'00000000',
      'X20':'00000000',
      'X21':'00000000',
      'X22':'00000000',
      'X23':'00000000',
      'X24':'00000000',
      'X25':'00000000',
      'X26':'00000000',
      'X27':'00000000',
      'X28':'00000000',
      'X29':'00000000',
      'X30':'00000000',
      'X31':'00000000'};

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