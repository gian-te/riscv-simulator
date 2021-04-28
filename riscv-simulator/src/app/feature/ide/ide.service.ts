import { Injectable, OnDestroy } from '@angular/core';
import { Word } from 'src/app/models/memory-word';

import { Store } from '../../core/state-management/state-management';

// components will subscribe here
export class IdeState {
  // the data structure for the code is not yet defined
  code: any = '';
  symbols: any; // most likely a dictionary
  instructions: Word[]; // most likely an array of opcodes 
  data: Word[]
  isAssembling: boolean = false;
}

@Injectable()
export class IdeService extends Store<IdeState> {


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

    // so by this point we already have the tokens per section in the text editor.
    // we can parse these tokens sequentially, in order to figure out the lines of code.
    let lines = this.parseTokensToLines(codeBySection);
    console.log(lines);
  }

  public parseTokensToLines(codeBySection: any) : any
  {
    let lines: any[] = [];
    // ito lang yung nasa specs
    let listOfSupportedInstructions: string[] = ['LB', 'LH', 'LW', 'SB', 'SH', 'SW', 'ADD', 'ADDI', 'SLT', 'SLTI', 'BEQ', 'BNE', 'BLT', 'BGE'];
    // lol dagdagan nalang para dun sa a1 a2
    let listOfSupportedRegisters: string[] = ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20', 'X21', 'X22', 'X23', 'X24', 'X25', 'X26', 'X27', 'X28', 'X29', 'X30', 'X31'];

    /*
     * Grammars:
     * E => Line
     * Line => [instruction] [register],[register]                     // production rule 1
     * Line => [instruction] [register],[register],[register]          // production rule 2
     * Line => [instruction] [register],[address(address)]             // production rule 3
     * Line => [instruction] [register],[variable]                     // production rule 4
     * Line => [macro]                                                 // production rule 5
     */

    // we match the tokens in .text to get the line by line code
    let tokens = codeBySection.text.main;
    let lineTokenTypes: any[] = [];
    let lineTokens: any[] = [];
    let pattern1 = false, pattern2 = false, pattern3 = false, pattern4 = false, pattern5 = false;
    
    for (let i = 0; i < tokens.length; i++)
    {
      // check if the next few tokens are either production 1, production 2, or production 3
      // ideally this is a finite state machine or a pushdown automata but yeah we'll make it work like this for now.
      let token = tokens[i].toUpperCase();
      let tokenType: string = '';
      console.log(token);
      
      if (listOfSupportedInstructions.includes(token)) tokenType = 'instruction';
      if (listOfSupportedRegisters.includes(token)) tokenType = 'register';
      if (token.includes('(') && token.includes(')')) tokenType = 'address'; // lol happy path
      if (codeBySection.macro[token] != undefined || codeBySection.macro[token.toLowerCase()] != undefined) tokenType = 'macro';
      if (codeBySection.data[token] != undefined || codeBySection.data[token.toLowerCase()] != undefined) tokenType = 'variable'; // case-sensitive ba dapat to?

      lineTokens.push(token);
      lineTokenTypes.push(tokenType);

      
      // pattern 1 checking: [instruction] [register],[register]   
      if (this.patternMatch(lineTokenTypes, ['instruction', 'register', 'register']))
      {
        pattern1 = true;
      } else pattern1 = false;

      // pattern 2 checking: [instruction] [register],[register],[register] 
      if (this.patternMatch(lineTokenTypes, ['instruction', 'register', 'register', 'register']))
      {
        pattern2 = true;
      } else pattern2 = false;
  
      // pattern 3 checking: [instruction] [register],[address(address)]  
      if (this.patternMatch(lineTokenTypes, ['instruction', 'register', 'address']))
      {
        pattern3 = true; 
      }  else pattern3 = false;
   
      // pattern 4 checking: [macro]  
      if (this.patternMatch(lineTokenTypes ,['instruction', 'register', 'variable']))
      {
        pattern4 = true;
      } else pattern4 = false;

      // pattern 5 checking: [macro]  
      if (this.patternMatch(lineTokenTypes, ['macro']))
      {
        pattern5 = true;
      } else pattern5 = false;


      if (pattern1 || pattern2 || pattern3 || pattern4 || pattern5) {
        lines.push(lineTokens); // itong lines, later on ito yung gagawin nating op-code.
        lineTokenTypes = [];
        lineTokens = [];
        pattern1 = false, pattern2 = false, pattern3 = false, pattern4 = false, pattern5 = false;
      }
      else if (tokenType == '' || ( lineTokenTypes.length > 4))
      {
        // error na, hanggang 4 tokens lang
        alert("Compilation error in the .text section. The error was found around line " + (lines.length) + " of this section, near " + "'" + tokens[i] + "'.");
        break;
      }
    }

    return lines
  }

  private patternMatch(lineTokens: any, pattern: any): boolean{
    if(lineTokens.length !== pattern.length){
      return false;
   };
   for(let i = 0; i < lineTokens.length; i++){
      if(!pattern.includes(lineTokens[i])){
         return false;
      };
   };
   return true;
  }
}