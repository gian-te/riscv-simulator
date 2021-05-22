
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
    
      this.ideService.state$
      .pipe(
        map(state => state.modifiedRegister),
        filter(data => data != null),
        distinctUntilChanged()
      )
      .subscribe(registerThatWasModified => {
        var elem = document.getElementById(registerThatWasModified);
        blinkingHighlight(elem);
        // for (let i = 0; i < 3;)
        // {
        //   setTimeout(() => {
        //     elem.style.background = "#ffffb2"
        //     setTimeout(() => {
        //       elem.style.background = "none"
        //       i++;
        //     }, (200), i);
        //   }, 500, i);
          
        // }
      });
    
    async function blinkingHighlight(elem: any)
    {
      const timer = ms => new Promise(res => setTimeout(res, ms))

      for (let i = 0; i < 3;) {
        console.log(i);
        elem.style.background = "#ffffb2"
        await timer(200); // then the created Promise can be awaited
        elem.style.background = "none"
        await timer(200); // then the created Promise can be awaited
        i++;
      }
    }
  }
}