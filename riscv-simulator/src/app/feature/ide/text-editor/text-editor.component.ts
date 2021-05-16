
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

  code: any = '.globl main\n\n.data\nvar1: .byte 0x05\nvar2: .half 0x06\nvar3: .word 0x07\nvar4: .byte 0x08\n\n.macro done\n\tli a7, 10\n\tecall\n.end_macro\n\n.text\nmain:\n\tlw x5, 0(x5)\n\tBEQ x10, x11, L1\n\tlw x6, 0(x5)\n\tlb x10, 0(x5)\n\tlb x11, 0(x6)\n\tsb x11, 0(x6)\n\tadd x12, x10, x11\n\taddi x12, x0, 0x004\n\tdone\n\tL1: addi x12, x0, 0x07'; // bind this to the ui

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
        if (isAssembling) {
          console.log('assembling...');
          this.ideService.updateCode(this.code);  // update the string code
          this.ideService.assembling(false);
        }
      });
  }
}