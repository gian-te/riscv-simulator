// represents a 32-bitword in the memory
export interface Word {
  color?: string; // aesthetic purposes
  hexAddress: string;
  decimalAddress: string;
  value: string;
  colSpan?: "1";
  rowSpan?: "1";
}