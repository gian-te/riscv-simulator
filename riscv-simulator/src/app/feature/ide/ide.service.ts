import { Injectable, OnDestroy } from '@angular/core';
import { Word } from 'src/app/models/memory-word';

import { Store } from '../../core/state-management/state-management';

// components will subscribe here
export class IdeState {
  // the data structure for the code is not yet defined
  code: any = '';
  symbols: any; // most likely a dictionary
  instructions: Word[]; // most likely an array of opcodes 
  data: any;
  isAssembling: boolean = false;
  memory: any;
  registers: any;
}

@Injectable()
export class IdeService extends Store<IdeState> {
  error: boolean = false;
  listOfSupportedRegisters: string[] = ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20', 'X21', 'X22', 'X23', 'X24', 'X25', 'X26', 'X27', 'X28', 'X29', 'X30', 'X31'];
  listOfSupportedLoadStoreInstructions: string[] = ['LB', 'LH', 'LW', 'SB', 'SH', 'SW']
  listOfSupportedComputationInstructions: string[] = ['ADD', 'SLT'];
  listOfSupportedComputationImmediateInstructions: string[] = [ 'ADDI',  'SLTI'];
  listOfSupportedControlTransferInstructions: string[] = ['BEQ', 'BNE', 'BLT', 'BGE'];
  listOfSupportedDatatypes: string[] = ['.BYTE' , '.HALF', '.WORD'];


  constructor() {
    super(new IdeState());
  }

  public updateInstructions(inst): void {
    this.setState({
      ...this.state,
      instructions: inst,
    });
  }

  public updateData(data): void {
    this.setState({
      ...this.state,
      data: data,
    });
  }

  public updateMemoryDataSegment(memory): void{
    this.setState({
      ...this.state,
      memory: memory,
    });
  }

  updateRegisters(listOfSupportedRegisters: any) {
    this.setState({
      ...this.state,
      registers: listOfSupportedRegisters,
    });
  }

  public assembling(data: boolean) {
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

    const codeList: string[] = newCode.replace(/(\t|\n)/g, " ").replace(/,/g, "").split(" ").filter(_ => !!_)
    console.log('parsing', codeList)

    let section = ''
    let subsection = ''
    let isMacro = false

    const codeBySection = codeList.reduce((acc, cur) => {
      if (cur.match(/(.globl|.data|.macro|.text)/g)) {
        section = cur.slice(1);
        subsection = ''

        isMacro = cur === '.macro'
      } else {
        if (isMacro) {
          subsection = cur
          isMacro = false
        } else if (cur.substr(cur.length - 1) === ':') {
          subsection = cur.slice(0, -1)
        } else if (!subsection) {
          if (acc[section]) {
            acc[section] = {
              ...acc[section],
              default: [
                ...acc[section]['default'],
                cur
              ]
            }
          } else {
            acc[section] = {
              default: [cur]
            }
          }
        } else {
          if (acc[section]) {
            if (acc[section][subsection]) {
              acc[section] = {
                ...acc[section],
                [subsection]: [
                  ...acc[section][subsection],
                  cur
                ]
              }
            } else {
              acc[section] = {
                ...acc[section],
                [subsection]: [cur]
              }
            }
          } else {
            acc[section] = {
              ...acc[section],
              [subsection]: [cur]
            }
          }
        }
      }
      return acc
    }, {})


    console.log('code by section', codeBySection)

    this.setState({
      ...this.state,
      code: newCode,
    });

    let variableLines = this.parseDataSection(codeBySection);
    console.log(variableLines); // pwede na ipasa to dun sa state para ma render sa ibang table
    this.updateData(variableLines);
    
    let codeLines = this.parseTextSection(codeBySection);
    console.log(codeLines); // gagawin pa tong opcode

    this.error = false;
  }

  public parseDataSection(codeBySection: any): any{
    let variableLines: any[] = [];
    let listOfSupportedDatatypes: string[] = this.listOfSupportedDatatypes

    let variables = Object.keys(codeBySection.data);

     /*
     * Grammar/Productions:
     * E => Line
     * Line => [type] [value]                    // production rule 1
     */
    let pattern1= ['type', 'value'];

    let pattern1Match = false;
    let error = false;

    for (let i = 0; i < variables.length; i++) {
      let variableTokens = codeBySection.data[variables[i]];
      let lineTokens: any = [];
      let lineTokenTypes: any = [];

      for (let j = 0; j < variableTokens.length; j++)
      {
        // check if the next few tokens are either production 1, production 2, or production 3
        // ideally this is a finite state machine or a pushdown automata but yeah we'll make it work like this for now.
        let token = variableTokens[j].toUpperCase();
        let tokenType: string = '';
        console.log(token);

        if (listOfSupportedDatatypes.includes(token)) {
          tokenType = 'type';
        } else tokenType = 'value'; // naive check lol
  
        lineTokens.push(token.toLowerCase());
        lineTokenTypes.push(tokenType);
        
        // pattern 1 checking: [instruction] [register],[register]   
        if (this.patternMatch(lineTokenTypes, ['type', 'value']))
        {
          pattern1Match = true;
        } else pattern1Match = false;


        if (pattern1Match) {
          variableLines.push({
            'name': variables[i],
            'type': lineTokens[0],
            'value': lineTokens[1]
          }); 
          lineTokenTypes = [];
          lineTokens = [];
          pattern1Match = false;
        }
        else if ( this.patternSimilar(lineTokenTypes, pattern1))  // if approaching exact match, continue
        {
          console.log('similar match, assembling .data line...');
        }
        else 
        {
          // error na
          alert("Compilation error in the .data section. The error was found around line " + (variableLines.length + 1) + " of this section, near " + "'" + lineTokens[j] + "'.");
          error = true;
          break; // break inner
        }

      }

      if (error) break; //break outer
    }
    this.error = error;
    return variableLines;
  }

  public parseTextSection(codeBySection: any) : any
  {
    if (this.error) { return; }
    
    let codeLines: any[] = [];
    // ito lang yung nasa specs
    let listOfSupportedComputationInstructions: string[] = this.listOfSupportedComputationInstructions;
    let listOfSupportedComputationImmediateInstructions: string[] = this.listOfSupportedComputationImmediateInstructions;
    let listOfSupportedLoadStoreInstructions: string[] = this.listOfSupportedLoadStoreInstructions;
    let listOfSupportedControlTransferInstructions: string[] = this.listOfSupportedControlTransferInstructions;
    // lol dagdagan nalang para dun sa a1 a2
    let listOfSupportedRegisters: string[] = Object.keys(this.state.registers);
    listOfSupportedRegisters = listOfSupportedRegisters.map(function(x){ return x.toUpperCase(); })

    
    let pattern1= ['computation_instruction', 'register', 'register', 'register'];
    let pattern2= ['computation_immediate_instruction', 'register', 'register', 'register'];
    let pattern3= ['loadstore_instruction', 'register', 'address'];
    let pattern4 = ['conditional_branch_instruction', 'register', 'register', 'offset_address'];
    let pattern5 = ['macro'];

    /*
     * Grammar/Productions:
     * E => Line
     * Line => [instruction] [register],[register],[register]          // production rule 1
     * Line => [instruction] [register],[register]                     // production rule 2
     * Line => [instruction] [register],[address(address)]             // production rule 3
     * Line => [instruction] [register],[variable]                     // production rule 4
     * Line => [macro]                                                 // production rule 5
     */

    // we match the tokens in .text to get the line by line code
    let tokens = codeBySection.text.main;
    let lineTokenTypes: any[] = [];
    let lineTokens: any[] = [];
    let pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false;
    
    for (let i = 0; i < tokens.length; i++)
    {
      // check if the next few tokens are either production 1, production 2, or production 3
      // ideally this is a finite state machine or a pushdown automata but yeah we'll make it work like this for now.
      let token = tokens[i].toUpperCase();
      let tokenType: string = '';
      console.log(token);
      
      if (listOfSupportedComputationInstructions.includes(token)) tokenType = 'computation_instruction';
      if (listOfSupportedComputationImmediateInstructions.includes(token)) tokenType = 'computation_immediate_instruction';
      if (listOfSupportedLoadStoreInstructions.includes(token)) tokenType = 'loadstore_instruction';
      if (listOfSupportedControlTransferInstructions.includes(token)) tokenType = 'conditional_branch_instruction';
      if (listOfSupportedRegisters.includes(token)) tokenType = 'register';
      if (token.includes('(') && token.includes(')')) tokenType = 'address'; // lol happy path
      if (codeBySection.macro[token] != undefined || codeBySection.macro[token.toLowerCase()] != undefined) tokenType = 'macro';
      if (codeBySection.data[token] != undefined || codeBySection.data[token.toLowerCase()] != undefined) tokenType = 'variable'; // case-sensitive ba dapat to?

      lineTokens.push(token);
      lineTokenTypes.push(tokenType);


      // pattern 1 checking: [computation_instruction] [register],[register],[register]   
      if (this.patternMatch(lineTokenTypes, pattern1))
      {
        pattern1Match = true;
      } else pattern1Match = false;

      // pattern 1 checking: [computation_immediate_instruction] [register],[register],[register]   
      if (this.patternMatch(lineTokenTypes, pattern2))
      {
        pattern2Match = true;
      } else pattern2Match = false;
  
      // pattern 3 checking: [loadstore_instruction] [register],[address(address)]  
      if (this.patternMatch(lineTokenTypes, pattern3 ))
      {
        pattern3Match = true; 
      }  else pattern3Match = false;
   
      // pattern 4 checking: [conditional_branch_instruction] => mahirap to. wag muna gawin
      if (this.patternMatch(lineTokenTypes, pattern4))
      {
        pattern4Match = true;
      } else pattern4Match = false;

      // pattern 5 checking: [macro]  
      if (this.patternMatch(lineTokenTypes, pattern5))
      {
        pattern5Match = true;
      } else pattern5Match = false;

      // if exact match, add line
      if (pattern1Match || pattern2Match || pattern3Match || pattern4Match || pattern5Match) {
        codeLines.push(lineTokens); // itong lines, later on ito yung gagawin nating op-code.
        lineTokenTypes = [];
        lineTokens = [];
        pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false;
      }
      else if ( this.patternSimilar(lineTokenTypes, pattern1) || this.patternSimilar(lineTokenTypes, pattern2) || this.patternSimilar(lineTokenTypes, pattern3) || this.patternSimilar(lineTokenTypes, pattern4) || this.patternSimilar(lineTokenTypes, pattern5)    )  // if approaching exact match, continue
      {
        console.log('similar match, assembling .text line...');
      }
      else 
      {
        // error na, hanggang 4 tokens lang
        alert("Compilation error in the .text section. The error was found around line " + (codeLines.length + 1) + " of this section, near " + "'" + tokens[i] + "'.");
        break;
      }
    }

    return codeLines
  }

  // check for an exact pattern match
  private patternMatch(lineTokens: any, pattern: any): boolean{
    if(lineTokens.length !== pattern.length){
      return false;
   };
   for(let i = 0; i < lineTokens.length; i++){
      if(pattern[i] != lineTokens[i]){
         return false;
      };
   };
   return true;
  }

  // check for a similar pattern match while assembling the line
  private patternSimilar(lineTokens: any, pattern: any): boolean{
    for(let i = 0; i < lineTokens.length; i++){
      if(pattern[i] != lineTokens[i]){
         return false;
      };
    };
    return true;
  }
}