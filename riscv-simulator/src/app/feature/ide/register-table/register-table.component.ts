
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

  onRegisterEdit(event: any)
  {
    let value = event.target.value.startsWith('0x') ? event.target.value.slice(2) : event.target.value;
    let register = event.target.id;
    this.ideService.updateRegisterFromUi(register, value)
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
        // console.log('list of registers updated');
        this.listOfSupportedRegisters = updatedRegisters;
      });
    
      this.ideService.state$
      .pipe(
        map(state => state.modifiedRegister),
        filter(data => data != null)
      )
      .subscribe(registerThatWasModified => {
        var elem = document.getElementById(registerThatWasModified);
        blinkingHighlight(elem);
      });
    
    async function blinkingHighlight(elem: any)
    {
      const timer = ms => new Promise(res => setTimeout(res, ms))

      for (let i = 0; i < 3;) {
        // console.log(i);
        elem.style.background = "#ffffb2"
        await timer(200); // then the created Promise can be awaited
        elem.style.background = "none"
        await timer(200); // then the created Promise can be awaited
        i++;
      }
    }

    
  }
  

}