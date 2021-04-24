
import { Injectable, OnDestroy } from '@angular/core';

import { Store } from '../../core/state-management/state-management';

// components will subscribe here
export class IdeState {
  // the data structure for the code is not yet defined
  code: any = '';
  symbols: any; // most likely a dictionary
  memoryWords: any; // most likely an array of objects 
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

  public assemble(): void
  {
    // parse the variables here
    // parse the opcodes
    // assign them to memory
    // call updateMemoryWords()
  }
}