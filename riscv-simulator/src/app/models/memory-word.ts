// represents a 32-bitword in the memory
export interface Word {
  color?: string; // aesthetic purposes
  hexAddress: string;
  decimalAddress: string;
  value: any;
  colSpan?: "1";
  rowSpan?: "1";
  memoryBlock?: string;
}

export interface SymbolModel {
  hexAddress: string;
  decimalAddress: string;
  value: any;
}


export interface InstructionModel{
  address: string,
  decimalAddress: string,
  hexAddress: string,
  value: string,
  basic: {
    token: string;
    type: string;
  }[],
  memoryBlock: string,
  lineOfCode?: string
}
