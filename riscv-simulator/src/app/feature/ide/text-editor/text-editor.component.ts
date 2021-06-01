
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

  code = `  .globl main

  .data
    var1: .byte 0x88, 0x77, 0x66, 0x2f, 0xDF
    var2: .byte 0x99
    var3: .word 0xBBAA,0xABBA
    var4: .byte 0xFF
    var5: .half 0x420
    var6: .word 0x01234567
    var7: .byte 0x69
    var8: .word 0x01234567
    var9: .byte 0x15

  .text
    main:
    addi x10, x0, 0x08
    addi x11, x0, 0x18
    blt x10, x11, L1
    addi x9, x0, 0x08
    L1: addi x12, x0, 0x07
    Lw x4, var3(x5)
    LB x11, 1(x5)
    LW x31, 0(x5)
    LB x2, C(x5)
    LB x1, E(x5)
    LB x3, 15(x5)
    LW x29, F(x5)
    SW x11, 1(x0)
    SB x29, 2(x0)
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