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
  //listOfSupportedLoadStoreInstructions: string[] = ['LB', 'LH', 'LW', 'SB', 'SH', 'SW']
  R_type: string[] = ['ADD', 'SLT'];
  I_type: string[] = ['ADDI', 'SLTI', 'LB', 'LH', 'LW'];
  S_type: string[] = ['SB', 'SH', 'SW'];
  SB_type: string[] = ['BEQ', 'BNE', 'BLT', 'BGE'];
  listOfSupportedDatatypes: string[] = ['.BYTE' , '.HALF', '.WORD'];
  R_opcodes: {
    'ADD': {
      'OPCODE': '0110011',
      'FUNCT3': '000',
      'FUNCT7': '0000000'
    },
    'SLT': {
      'OPCODE': '0110011',
      'FUNCT3': '010',
      'FUNCT7': '0000000'
    }
  };

  S_opcodes: {
    'SB': {
      'OPCODE': '0100011',
      'FUNCT3': '000'
    },
    'SH': {
      'OPCODE': '0100011',
      'FUNCT3': '010',
      'FUNCT7': '0000000'
    },
    'SW': {
      'OPCODE': '0100011',
      'FUNCT3': '010'
    }
  };

  I_opcodes: {
    'ADDI': {
      'OPCODE': '0010011',
      'FUNCT3': '000'
    },
    'SLTI': {
      'OPCODE': '0010011',
      'FUNCT3': '010'
    },
    'LB': {
      'OPCODE': '0000011',
      'FUNCT3': '000'
    },
    'LH': {
      'OPCODE': '0000011',
      'FUNCT3': '001'
    },
    'LW': {
      'OPCODE': '0000011',
      'FUNCT3': '010'
    }
  };

  SB_opcodes: {
    'BEQ': {
      'OPCODE': '1100011',
      'FUNCT3': '000'
    },
    'BNE': {
      'OPCODE': '1100011',
      'FUNCT3': '001'
    },
    'BLT': {
      'OPCODE': '1100011',
      'FUNCT3': '100'
    },
    'BGE': {
      'OPCODE': '1100011',
      'FUNCT3': '101'
    }
  };

  constructor() {
    super(new IdeState());
  }

  // Sasalohin ni memory table (instructions)
  public updateInstructions(inst): void {
    this.setState({
      ...this.state,
      instructions: inst,
    });
  }

  // Sasalohin ni memory table (data)
  public updateData(data): void {
    this.setState({
      ...this.state,
      data: data,
    });
  }

  // Sasalohin ni symbol table
  public updateMemoryDataSegment(memory): void{
    this.setState({
      ...this.state,
      memory: memory,
    });
  }

  // Sasalohin ni register table 
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
    if (!this.error)
    {
      this.updateData(variableLines);
    }
    
    let codeLines = this.parseTextSection(codeBySection);
    console.log(codeLines); // gagawin pa tong opcode

    // parse code to 32-bit instruction format here
    var instructionsIn32BitFormat = this.parseLinesTo32Bits(codeLines);
    if (!this.error)
    {
      this.updateInstructions(instructionsIn32BitFormat);
    }


    // reset error flag for next Assemble
    this.error = false;
  }

  public parseLinesTo32Bits(codeLines: any) {
    //throw new Error('Method not implemented.');
    var _32bitInstructions = [];
    for (let i = 0; i < codeLines.length; i++)
    {
      let line = codeLines[i];
      let instructionType = line[0].type;
      console.log('The instruction is a/an ' + instructionType + ' type.')
      let _32bitInstruction = '00000000000000000000000000000000'; // default value

      if (instructionType.toUpperCase() == 'R')
      {
        /*
         * 0-6: opcode
         * 7-11: rd
         * 12-14: funct3
         * 15-19: rs1
         * 20-24: rs2
         * 25-31: funct7
         */

      }
      else if (instructionType.toUpperCase() == 'I')
      {
        /*
         * 0-6: opcode
         * 7-11: rd
         * 12-14: funct3
         * 15-19: rs1
         * 20-31: imm
         */

      }
      else if (instructionType.toUpperCase() == 'S')
      {
        /*
         * 0-6: opcode
         * 7-11: imm
         * 12-14: funct3
         * 15-19: rs1
         * 20-24: rs2
         * 25-31: imm
         */

      }
      else if (instructionType.toUpperCase() == 'SB')
      {
        /*
         * 0-6: opcode
         * 7-11: imm
         * 12-14: funct3
         * 15-19: rs1
         * 20-24: rs2
         * 25-31: imm
         */

      }
    }

    return _32bitInstructions;
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
    let syntaxError = false;

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
          syntaxError = true;
          break; // break inner
        }

      }

      if (syntaxError) break; //break outer
    }
    let duplicateVariableNames = (new Set(variableLines.map(a => a.name))).size !== variableLines.length;
    if (duplicateVariableNames) { alert('Compilation error in the .data section. There seems to be a duplicate name in the variables.')}
    this.error = syntaxError || duplicateVariableNames;
    return variableLines;
  }

  public parseTextSection(codeBySection: any) : any
  {
    if (this.error) { return; }
    
    let codeLines: any[] = [];
    // ito lang yung nasa specs
    let R_type: string[] = this.R_type;
    let S_type: string[] = this.S_type;
    let I_type: string[] = this.I_type;
    let SB_type: string[] = this.SB_type;
    // lol dagdagan nalang para dun sa a1 a2
    let listOfSupportedRegisters: string[] = Object.keys(this.state.registers);
    listOfSupportedRegisters = listOfSupportedRegisters.map(function(x){ return x.toUpperCase(); })

    // need help here
    let pattern1= ['R', 'register', 'register', 'register'];
    let pattern2= ['I', 'register', 'register', 'immediate'];
    let pattern3= ['I', 'register', 'address'];
    let pattern4 = ['SB', 'register', 'register', 'offset_address'];
    let pattern5 = ['macro'];
    let pattern6= ['S', 'register', 'address'];

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
    let pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false, pattern6Match = false;
    
    for (let i = 0; i < tokens.length; i++)
    {
      // check if the next few tokens are either production 1, production 2, or production 3
      // ideally this is a finite state machine or a pushdown automata but yeah we'll make it work like this for now.
      let token = tokens[i].toUpperCase();
      let tokenType: string = '';
      console.log(token);
      
      // if (listOfSupportedComputationInstructions.includes(token)) tokenType = 'computation_instruction';
      // if (listOfSupportedComputationImmediateInstructions.includes(token)) tokenType = 'computation_immediate_instruction';
      // if (listOfSupportedLoadStoreInstructions.includes(token)) tokenType = 'loadstore_instruction';
      // if (listOfSupportedControlTransferInstructions.includes(token)) tokenType = 'conditional_branch_instruction';
      if (R_type.includes(token)) tokenType = 'R';
      if (I_type.includes(token)) tokenType = 'I';
      if (SB_type.includes(token)) tokenType = 'SB';
      if (S_type.includes(token)) tokenType = 'S';
      if (listOfSupportedRegisters.includes(token)) tokenType = 'register';
      if (token.includes('(') && token.includes(')')) tokenType = 'address'; // lol happy path
      if (token.includes('0x')) tokenType = 'immediate'; // lol happy path
      if (codeBySection.macro[token] != undefined || codeBySection.macro[token.toLowerCase()] != undefined) tokenType = 'macro';
      if (codeBySection.data[token] != undefined || codeBySection.data[token.toLowerCase()] != undefined) tokenType = 'variable'; // case-sensitive ba dapat to?

      lineTokens.push({ 'token': token, 'type': tokenType });
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

       // pattern 5 checking: [S type]  
       if (this.patternMatch(lineTokenTypes, pattern6))
       {
         pattern6Match = true;
      } else pattern6Match = false;
      
      // if exact match, add line
      if (pattern1Match || pattern2Match || pattern3Match || pattern4Match || pattern5Match || pattern6Match) {
        codeLines.push(lineTokens); // itong lines, later on ito yung gagawin nating op-code.
        lineTokenTypes = [];
        lineTokens = [];
        pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false, pattern6Match = false;
      }
      else if (this.patternSimilar(lineTokenTypes, pattern1) || this.patternSimilar(lineTokenTypes, pattern2) || this.patternSimilar(lineTokenTypes, pattern3) || this.patternSimilar(lineTokenTypes, pattern4) || this.patternSimilar(lineTokenTypes, pattern5) || this.patternSimilar(lineTokenTypes, pattern6))
      // if approaching exact match, continue
      {
        console.log('similar match, assembling .text line...');
      }
      else 
      {
        // error na, hanggang 4 tokens lang
        alert("Compilation error in the .text section. The error was found around line " + (codeLines.length + 1) + " of this section, near " + "'" + tokens[i] + "'.");
        this.error = true;
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

  
  public convertStringToHex(str): string {
    let num = Number(str);
    let hex = num.toString(16).toUpperCase();
    return hex;
  }
}