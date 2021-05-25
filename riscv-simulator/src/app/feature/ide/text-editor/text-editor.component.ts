
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
    var1: .byte 0x88
    var2: .byte 0x99
    var3: .word 0xBBAA
    var4: .byte 0xFF
    var5: .half 0x420
    var6: .word 0x01234567
    var7: .byte 0x69
    var8: .word 0x01234567

  .text
    main:
    LB x10, 0(x5)
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