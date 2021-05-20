
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

  listOfSupportedRegisters: any;
  constructor(private ideService: IdeService) {

  }

  ngOnInit() {

    this.listOfSupportedRegisters = this.ideService.Register_Default_Values;
  }
  
  ngAfterViewInit() {

    // dito sasaluhin natin yung changes sa registers, habang nag rurun yung code mag seset state yung runner natin pag may changes sa values ng registers
    this.ideService.state$
      .pipe(
        map(state => state.registers),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(updatedRegisters => {
        console.log('list of registers updated');
        this.listOfSupportedRegisters = updatedRegisters;
      });
  }
}