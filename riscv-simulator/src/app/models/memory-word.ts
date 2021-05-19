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