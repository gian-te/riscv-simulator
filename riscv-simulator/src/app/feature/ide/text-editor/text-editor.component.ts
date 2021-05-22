
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})

export class TextEditorComponent implements OnInit {
  constructor(private ideService: IdeService) { }

  assembleEventSubscription: Subscription;

  // code: any = '.globl main\n\n.data\nvar1: .byte 0x05\nvar2: .half 0x3456\nvar3: .word 0x12345600\nvar4: .byte 0x08\n\n.macro done\n\tli a7, 10\n\tecall\n.end_macro\n\n.text\nmain:\n\tadd x12, x10, x11\n\tlb x10, 0(x5)\n\tSLTI x12, x10, 0x03\n\taddi x12, x0, 0x004\n\taddi x11, x0, 0x01\n\tSLT x12, x10, x11\n\tlh x10, 0(x5)\n\tlw x5, 0(x5)\n\tBEQ x10, x11, L1\n\tlw x6, 0(x5)\n\tlb x11, 0(x6)\n\tsb x11, 0(x6)\n\tdone\n\tL1: addi x12, x0, 0x07'; // bind this to the ui

  code = `  .globl main


  .data
    var1: .byte 0x88
    var2: .byte 0x99
    var3: .word 0xBBAA
    var4: .word 0x234567
    var5: .byte 0xFF
    var6: .half 0x420
    var7: .word 0x01234567
    var8: .byte 0x69
    var9: .word 0x01234567


  .text
  main:
    addi x5, x0, 0
    addi x6, x0, 2
    lw x10, 0(x5)
    sh x10, 0(x6)
    add x12, x10, x11
  `

  ngOnInit() {


  }

  ngAfterViewInit() {
    const that = this;
    this.assembleEventSubscription = this.ideService.assemble().subscribe(() => {
      console.log('assembling...');
      if (this.code) {
        this.ideService.updateCode(this.code);  // update the string code
      }
    })
  }
}