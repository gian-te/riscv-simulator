
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
      'x0':'0x00000000',
      'x1':'0x00000000',
      'x2':'0x00000000',
      'x3':'0x00000000',
      'x4':'0x00000000',
      'x5':'0x00000000',
      'x6':'0x00000000',
      'x7':'0x00000000',
      'x8':'0x00000000',
      'x9':'0x00000000',
      'x10':'0x00000000',
      'x11':'0x00000000',
      'x12':'0x00000000',
      'x13':'0x00000000',
      'x14':'0x00000000',
      'x15':'0x00000000',
      'x16':'0x00000000',
      'x17':'0x00000000',
      'x18':'0x00000000',
      'x19':'0x00000000',
      'x20':'0x00000000',
      'x21':'0x00000000',
      'x22':'0x00000000',
      'x23':'0x00000000',
      'x24':'0x00000000',
      'x25':'0x00000000',
      'x26':'0x00000000',
      'x27':'0x00000000',
      'x28':'0x00000000',
      'x29':'0x00000000',
      'x30':'0x00000000',
      'x31':'0x00000000'};

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