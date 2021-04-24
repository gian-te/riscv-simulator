import { Injectable, OnDestroy } from '@angular/core';
import { Word } from 'src/app/models/memory-word';

import { Store } from '../../core/state-management/state-management';

// components will subscribe here
export class IdeState {
  // the data structure for the code is not yet defined
  code: any = '';
  symbols: any; // most likely a dictionary
  memoryWords: Word[]; // most likely an array of opcodes 
  isAssembling: boolean = false;
}

@Injectable()
export class IdeService extends Store<IdeState> {


    constructor() {
      super(new IdeState());
  }

  public updateMemoryWords(data): void {
    this.setState({
          ...this.state,
          memoryWords: data,
        });
  }

  public assembling(data: boolean)
  {
    console.log('setting isAssembling to ' + data);
    this.setState({
      ...this.state,
      isAssembling: data,
    });
    console.log(this.state.isAssembling);
  }

  public checkForErrors() {
    // check opcodes maybe?
  }

  public parseToOpcode() {
    let code = this.state.code;
    
  }

  public storeOpcodesToMemory() {
    
  }

  public updateCode(newCode) {
    console.log('setting code to: ' + newCode);
    this.setState({
      ...this.state,
      code: newCode,
    });
  }
}