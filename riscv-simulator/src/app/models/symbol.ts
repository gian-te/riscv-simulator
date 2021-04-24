// represents a 32-bitword in the memory
export interface Symbol {
  name: string; // aesthetic purposes
  type: string;
  address: string;
  colSpan?: "1";
  rowSpan?: "1";
}