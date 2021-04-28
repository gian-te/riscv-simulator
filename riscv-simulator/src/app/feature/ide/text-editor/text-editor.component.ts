
import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
  
export class TextEditorComponent implements OnInit {
  constructor(private ideService: IdeService) { }

  code: any = '.globl main\n.data\nvar1: .byte 0x05\nvar2: .byte 0x06\n\n.macro done\n\tli a7, 10\n\tecall\n.end_macro\n\n.text\nmain:\n\tlw x5, var1\n\tlw x6, var2\n\tlb x10, 0(x5)\n\tlb x11, 0(x6)\n\tadd x12, x10, x11\n\tdone'; // bind this to the ui

  ngOnInit() {


  }
  
  ngAfterViewInit() {
    const that = this;
    this.ideService.state$
      .pipe(
        map(state => state.isAssembling),
        distinctUntilChanged()
      )
      .subscribe(isAssembling => {
        if (isAssembling)
        {
          console.log('assembling...');
          this.ideService.updateCode(this.code);  // update the string code
          this.ideService.parseToOpcode();        // update the 32-bit opcodes, store to a list
          this.ideService.checkForErrors();
          this.ideService.storeOpcodesToMemory();
          this.ideService.updateInstructions(null);
          this.ideService.updateData(null);
          this.ideService.assembling(false);
        }
      });
  }
}