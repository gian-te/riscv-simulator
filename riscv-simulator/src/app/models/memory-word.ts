// represents a 32-bitword in the memory
export interface Word {
  
  hexAddress: string;
  decimalAddress: string;
  value: any;
  colSpan?: "1";
  rowSpan?: "1";
  memoryBlock?: string;
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
  lineOfCode?: string,
  color?: string; // aesthetic purposes
}

export interface DataModel{
  decimalAddress: string,
  hexAddress: string,
  value: string,
  memoryBlock: string,
}

export interface SymbolModel{
  name: string,
  type: string,
  hexAddress: string
  decimalAddress: string;
  value: any;
}

export interface CacheModel
{
  cacheBlock: string,
  memoryBlock?: string,
  validBit?: string,
  tag?: string,
  data?: string
}