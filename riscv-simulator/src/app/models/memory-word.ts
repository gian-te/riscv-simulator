// represents a 32-bitword in the memory
export interface Word {
  color: string; // aesthetic purposes
  address: string;
  value: string;
  colSpan?: "1";
  rowSpan?: "1";
}