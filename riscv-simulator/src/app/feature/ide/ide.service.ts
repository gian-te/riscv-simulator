import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject, UnsubscriptionError } from 'rxjs';
import { IdeSettings } from 'src/app/models/ide-settings';
import { Word } from 'src/app/models/memory-word';

import { Store } from '../../core/state-management/state-management';

type TInstruction = {
  address: string,
  decimalAddress: string,
  hexAddress: string,
  value: string,
  basic: {
    token: string;
    type: string;
  }[],
  memoryBlock: string;
}

// components will subscribe here

export class IdeState {
  // the data structure for the code is not yet defined
  code: any = '';
  symbols: Word[]; // most likely a dictionary
  instructions: TInstruction[]; // most likely an array of opcodes
  instructionByAddress: {
    [address: string]: {
      value: string;
      basic: {
        token: string;
        type: string;
      }[]
    }
  };
  data: Word[];
  isAssembling: boolean = false;
  registers: any = {};
  ideSettings: IdeSettings;
  currentInstructionAddress: number = 4096;
  codeLines: { token: string; type: string }[][];
  registerList: string[];
  dataSegmentList: string[];
  dataSegmentPointer: number = 0;
}


@Injectable()
export class IdeService extends Store<IdeState> {

  private assembleSubject = new Subject<any>();
  sendAssembleEvent() {
    // reset counter on assemble
    this.state.currentInstructionAddress = 4096;
    this.setState({
      ...this.state,
      currentInstructionAddress: this.state.currentInstructionAddress
    })
    this.assembleSubject.next();
  }

  assemble(): Observable<any> {
    return this.assembleSubject.asObservable();
  }

  branch_address = {}
  error: boolean = false;
  listOfSupportedRegisters: string[] = ['X0', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10', 'X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20', 'X21', 'X22', 'X23', 'X24', 'X25', 'X26', 'X27', 'X28', 'X29', 'X30', 'X31'];
  //listOfSupportedLoadStoreInstructions: string[] = ['LB', 'LH', 'LW', 'SB', 'SH', 'SW']
  R_type: string[] = ['ADD', 'SLT', 'ADDI', 'SLTI'];
  I_type: string[] = ['LB', 'LH', 'LW'];
  S_type: string[] = ['SB', 'SH', 'SW'];
  SB_type: string[] = ['BEQ', 'BNE', 'BLT', 'BGE'];
  listOfSupportedDatatypes: string[] = ['.BYTE', '.HALF', '.WORD'];
  R_opcodes = {
    'ADD': {
      'OPCODE': '0110011',
      'FUNCT3': '000',
      'FUNCT7': '0000000'
    },
    'SLT': {
      'OPCODE': '0110011',
      'FUNCT3': '010',
      'FUNCT7': '0000000'
    },
    'ADDI': {
      'OPCODE': '0010011',
      'FUNCT3': '000'
    },
    'SLTI': {
      'OPCODE': '0010011',
      'FUNCT3': '010'
    },
  };
  S_opcodes = {
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
  I_opcodes = {
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
  SB_opcodes = {
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
  Register_opcodes = {
    'X0': '00000',
    'X1': '00001',
    'X2': '00010',
    'X3': '00011',
    'X4': '00100',
    'X5': '00101',
    'X6': '00110',
    'X7': '00111',
    'X8': '01000',
    'X9': '01001',
    'X10': '01010',
    'X11': '01011',
    'X12': '01100',
    'X13': '01101',
    'X14': '01110',
    'X15': '01111',
    'X16': '10000',
    'X17': '10001',
    'X18': '10010',
    'X19': '10011',
    'X20': '10100',
    'X21': '10101',
    'X22': '10110',
    'X23': '10111',
    'X24': '11000',
    'X25': '11001',
    'X26': '11010',
    'X27': '11011',
    'X28': '11100',
    'X29': '11101',
    'X30': '11110',
    'X31': '11111',
  }

  constructor() {
    super(new IdeState());
    this.setState({
      ...this.state,
      registerList: Array(33).fill('0'.repeat(8)), // initialize register
      dataSegmentList: Array(524).fill('0'.repeat(8)) // initialize data segment section in memory
    })
    /** mock data */
    this.state.registerList[5] = '00000004'
    this.state.dataSegmentList[1] = '10001000'
    this.state.dataSegmentList[2] = '10011001'
    this.state.dataSegmentList[3] = '10101010'
    this.state.dataSegmentList[4] = '10111011'
    this.state.registerList[10] = 'FFFFFFFF'
    this.state.registerList[11] = '00000004'

  }

  public runOnce(): void {
    console.log('running one step');
    // start with 4096 decimal (1000 hex)
    const currentInstruction = this.state.instructionByAddress[this.state.currentInstructionAddress].basic
    console.log(this.state.currentInstructionAddress, currentInstruction)

    switch (currentInstruction[0].token) {
      case 'ADD':
        this.add(currentInstruction);
        break;
      case 'SLT':
        this.slt(currentInstruction);
        break;
      case 'ADDI':
        this.addi(currentInstruction);
        break;
      case 'SLTI':
        this.slti(currentInstruction);
        break;
      case 'SB':
        break;
      case 'SH':
        break;
      case 'SW':
        break;
      case 'LB':
        this.lb(currentInstruction);
        break;
      case 'LH':
        this.lh(currentInstruction)
        break;
      case 'LW':
        this.lw(currentInstruction)
        break;
      case 'BEQ':
        break;
      case 'BNE':
        break;
      case 'BLT':
        break;
      case 'BGE':
        break;
    }

    this.setState({
      ...this.state,
      currentInstructionAddress: this.state.currentInstructionAddress + 4,
      registers: this.state.registers
    })
  }

  private add(instruction) {
    const rd_index = instruction[1].token.slice(1)
    const rs1_index = instruction[2].token.slice(1)
    const rs2_index = instruction[3].token.slice(1)
    const rs1Dec = this.hex2dec(this.state.registerList[Number(rs1_index)])
    const rs2Dec = this.hex2dec(this.state.registerList[Number(rs2_index)])
    const rdDec = rs1Dec + rs2Dec;
    this.state.registerList[rd_index] = this.dec2hex(rdDec, 8)
    this.state.registers[instruction[1].token] = this.dec2hex(rdDec, 8);
    console.log(this.state.registerList)
  }

  private slt(instruction) {
    const rd_index = instruction[1].token.slice(1)
    const rs1_index = instruction[2].token.slice(1)
    const rs2_index = instruction[3].token.slice(1)
    const rs1Dec = this.hex2dec(this.state.registerList[Number(rs1_index)])
    const rs2Dec = this.hex2dec(this.state.registerList[Number(rs2_index)])
    let rd = 0;

    if (rs1Dec < rs2Dec) {
      rd = 1
    }

    this.state.registerList[rd_index] = this.dec2hex(rd, 8);
    this.state.registers[instruction[1].token] = this.dec2hex(rd, 8);
    console.log(this.state.registerList)
  }

  private addi(instruction) {
    const rd_index = instruction[1].token.slice(1)
    const rs1_index = instruction[2].token.slice(1)
    const immediateDec = instruction[3].token.includes('0x') ? this.hex2dec(instruction[3].token.slice(2)) : Number(instruction[3].token)
    const rs1Dec = this.hex2dec(this.state.registerList[Number(rs1_index)])
    const rd = rs1Dec + immediateDec;

    this.state.registerList[rd_index] = this.dec2hex(rd, 8)
    this.state.registers[instruction[1].token] = this.dec2hex(rd, 8);
    console.log(this.state.registerList)
  }

  private slti(instruction) {
    const rd_index = instruction[1].token.slice(1)
    const rs1_index = instruction[2].token.slice(1)
    const immediateDec = instruction[3].token.includes('0x') ? this.hex2dec(instruction[3].token.slice(2)) : Number(instruction[3].token)
    const rs1Dec = this.hex2dec(this.state.registerList[Number(rs1_index)])
    let rd = 0;

    if (rs1Dec < immediateDec) {
      rd = 1
    }

    this.state.registerList[rd_index] = this.dec2hex(rd, 8);
    this.state.registers[instruction[1].token] = this.dec2hex(rd, 8);
    console.log(this.state.registerList)
  }

  private lb(instruction) {
    const rd_index = instruction[1].token.slice(1);
    const indexOpeningBracket = instruction[2].token.indexOf('(')
    const indexClosingBracket = instruction[2].token.indexOf(')')
    const rs1_index = instruction[2].token.slice(indexOpeningBracket + 1, indexClosingBracket).slice(1);
    const memoryAddress = instruction[2].token.slice(0, indexOpeningBracket)
    const effectiveAddress = this.hex2dec(Number(this.state.registerList[Number(rs1_index)])) + this.hex2dec(memoryAddress);
    let byteBinary = this.state.dataSegmentList[effectiveAddress / 4]

    // sign extension
    if (byteBinary.slice(0, 1) === '0') {
      byteBinary = `${'0'.repeat(24)}${byteBinary}`
    } else {
      byteBinary = `${'1'.repeat(24)}${byteBinary}`
    }

    const byteHex = this.bin2hex(byteBinary)
    this.state.registerList[rd_index] = byteHex;
    console.log(this.state.registerList)
    this.state.registers[instruction[1].token] = byteHex;
  }

  private lh(instruction) {
    const rd_index = instruction[1].token.slice(1);
    const indexOpeningBracket = instruction[2].token.indexOf('(')
    const indexClosingBracket = instruction[2].token.indexOf(')')
    const rs1_index = instruction[2].token.slice(indexOpeningBracket + 1, indexClosingBracket).slice(1);
    const memoryAddress = instruction[2].token.slice(0, indexOpeningBracket)
    const effectiveAddress = this.hex2dec(Number(this.state.registerList[Number(rs1_index)])) + this.hex2dec(memoryAddress);
    const lowerByteBinary = this.state.dataSegmentList[effectiveAddress / 4]
    const upperByteBinary = this.state.dataSegmentList[(effectiveAddress / 4) + 1]
    let halfWordBinary = ''
    // sign extension
    if (upperByteBinary.slice(0, 1) === '0') {
      halfWordBinary = `${'0'.repeat(16)}${upperByteBinary}${lowerByteBinary}`
    } else {
      halfWordBinary = `${'1'.repeat(16)}${upperByteBinary}${lowerByteBinary}`
    }

    const halfWordHex = this.bin2hex(halfWordBinary);
    this.state.registerList[rd_index] = halfWordHex;
    console.log(this.state.registerList)
    this.state.registers[instruction[1].token] = halfWordHex;
  }

  private lw(instruction) {
    const rd_index = instruction[1].token.slice(1);
    const indexOpeningBracket = instruction[2].token.indexOf('(')
    const indexClosingBracket = instruction[2].token.indexOf(')')
    const rs1_index = instruction[2].token.slice(indexOpeningBracket + 1, indexClosingBracket).slice(1);
    const memoryAddress = instruction[2].token.slice(0, indexOpeningBracket)
    const effectiveAddress = this.hex2dec(Number(this.state.registerList[Number(rs1_index)])) + this.hex2dec(memoryAddress);
    const byte1Binary = this.state.dataSegmentList[effectiveAddress / 4];
    const byte2Binary = this.state.dataSegmentList[(effectiveAddress / 4) + 1];
    const byte3Binary = this.state.dataSegmentList[(effectiveAddress / 4) + 2];
    const byte4Binary = this.state.dataSegmentList[(effectiveAddress / 4) + 3];
    const wordBinary = `${byte4Binary}${byte3Binary}${byte2Binary}${byte1Binary}`;
    const wordHex = this.bin2hex(wordBinary);
    this.state.registerList[rd_index] = wordHex;
    this.state.registers[instruction[1].token] = wordHex;

    console.log(this.state.registerList)
  }

  public runAll(): void {
    console.log('running all steps');
    // start with 4096 decimal (1000 hex)
    this.state.currentInstructionAddress = 4096;
    let addr = this.state.currentInstructionAddress;
    // let instrctn = this.state.instructions.filter(instruction => instruction.decimalAddress == addr);
    // console.log(instrctn);
    // add logic here to run the instruction
    // loop and then increment this.state.currentInstructionAddress by 4 words (32 bits to go to the next instruction)?
  }
  // Sasalohin ni memory table (instructions)
  public updateInstructions(inst): void {
    let newInstructions: TInstruction[] = [];
    for (let i = 0; i < inst.length; i++) {
      let j = i + 4096; // 0x1000 daw ung start sabi ni sir eh
      if (j != 4096) { j += 3 * i; }
      // try to simulate +4 hex (tama ba to?)
      // 1 word in the memory is 8 bits/1 byte.
      // 32 bits = 4 words. kaya +4 hex ng +4 hex kasi sure na 32 bits ung pinapasok dahil 32 bits ung opcode

      let word: TInstruction =
      {
        address: j.toString(),
        value: inst[i],
        basic: this.state.codeLines[i],
        decimalAddress: j.toString(),
        hexAddress: this.convertStringToHex(j.toString()),
        memoryBlock: (Math.floor((newInstructions.length + this.state.data.length) / Number(this.state.ideSettings.cacheBlockSize))).toString()
      }
      newInstructions.push(word);
    }

    const normalizeInstruction = newInstructions.reduce((acc, cur) => {
      acc[cur.address] = {
        value: cur.value,
        basic: cur.basic
      }
      return acc
    }, {})

    this.setState({
      ...this.state,
      instructions: newInstructions, // itong $state.instructions, pwedeng ito na yung papasadahan ng runner. +4 +4 per instruction na lang siguro
      instructionByAddress: normalizeInstruction
    });
  }

  // Sasalohin ni memory table (data)
  public updateData(data): void {
    let newData: Word[] = [];
    let addressOfNextInstruction = 0; // 0x0000 daw ung start sabi ni sir eh
    for (let i = 0; i < data.length; i++) {
      let j = addressOfNextInstruction;
      //if (i != 0) {

      // try to simulate +4 hex (tama ba to?)
      // .byte = 8 bits = 1 word
      // .half = 16 bits = 2 words
      // .word = 32 bits = 4 words

      let item: any = data[i];
      if (item.type == '.byte') {
        j = addressOfNextInstruction + 1;
      }
      if (item.type == '.half') {
        j = addressOfNextInstruction + 2;
      }
      if (item.type == '.word') {
        j = addressOfNextInstruction + 4;
      }


      //}
      /*
      0 = 2048 %
      1 =
      2 =
      3 =
      4 =
      5 =
      ...
      2047 =
      */
      let word: Word =
      {
        decimalAddress: addressOfNextInstruction.toString(),
        hexAddress: this.convertStringToHex(addressOfNextInstruction.toString()),
        value: data[i],
        memoryBlock: (Math.floor((newData.length) / Number(this.state.ideSettings.cacheBlockSize))).toString()
      }
      addressOfNextInstruction = j;

      newData.push(word);
    }

    this.setState({
      ...this.state,
      data: newData,
    });

    this.setState({
      ...this.state,
      symbols: newData,
    });
  }

  // Sasalohin ni register table 
  updateRegisters(listOfSupportedRegisters: any) {
    this.setState({
      ...this.state,
      registers: listOfSupportedRegisters,
    });
  }

  // sasalohin ni memory table
  public updateSettings(ideSettings: IdeSettings) {
    this.setState({
      ...this.state,
      ideSettings: ideSettings,
    });

    if (this.state.code) {
      // refresh the memory by trigerring a new build
      this.updateCode(this.state.code);
    }
  }

  public updateCode(newCode) {
    console.log('setting code to: ' + newCode);

    const codeList: string[] = newCode.replace(/(\t|\n)/g, " ").replace(/,/g, "").split(" ").filter(_ => !!_)
    console.log('parsing', codeList)

    let section = ''
    let subsection = ''
    let isMacro = false
    let isTextSection = false

    const codeBySection = codeList.reduce((acc, cur) => {
      let isMain = cur === 'main:'
      if (cur.match(/(.globl|.data|.macro|.text)/g)) {
        section = cur.slice(1);
        subsection = ''

        isMacro = cur === '.macro'
        isTextSection = cur === '.text'
      } else {
        if (isMacro) {
          subsection = cur
          isMacro = false
        } else if (isMain) {
          subsection = cur.slice(0, -1)
        } else if (cur.substr(cur.length - 1) === ':' && !isTextSection) {
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
    if (!this.error) {
      this.updateData(variableLines);
    }

    let codeLines = this.parseTextSection(codeBySection);
    console.log(codeLines); // gagawin pa tong opcode

    this.setState({
      ...this.state,
      codeLines
    })

    // parse code to 32-bit instruction format here
    var instructionsIn32BitFormat = this.parseLinesTo32Bits(codeLines);
    if (!this.error) {
      this.updateInstructions(instructionsIn32BitFormat);
    }


    // reset error flag for next Assemble
    this.error = false;
  }

  public parseLinesTo32Bits(codeLines: any) {
    //throw new Error('Method not implemented.');
    let _32bitInstructions = [];
    for (let i = 0; i < codeLines.length; i++) {
      let line = codeLines[i];

      let instructionType = line[0].type;
      const instruction = line[0].token;
      console.log('The instruction is a/an ' + instructionType + ' type.')
      let _32bitInstruction = '0'.repeat(32); // default value

      if (instructionType.toUpperCase() == 'R') {
        /*
         * 0-6: opcode
         * 7-11: rd
         * 12-14: funct3
         * 15-19: rs1
         * 20-24: rs2
         * 25-31: funct7
         */
        const opcode = this.R_opcodes[instruction].OPCODE
        const rd = this.Register_opcodes[line[1].token]
        const funct3 = this.R_opcodes[instruction].FUNCT3
        const rs1 = this.Register_opcodes[line[2].token]

        if (instruction === 'ADDI' || instruction === 'SLTI') {
          const imm = this.hex2bin(line[3].token.includes('0x') ? line[3].token.slice(2) : line[3].token, 12);

          _32bitInstruction = `${imm}${rs1}${funct3}${rd}${opcode}`
        } else {
          const rs2 = this.Register_opcodes[line[3].token];
          const funct7 = this.R_opcodes[instruction].FUNCT7;

          _32bitInstruction = `${funct7}${rs2}${rs1}${funct3}${rd}${opcode}`
        }
      }
      else if (instructionType.toUpperCase() == 'I') {
        /*
         * 0-6: opcode
         * 7-11: rd
         * 12-14: funct3
         * 15-19: rs1
         * 20-31: imm
         */
        const opcode = this.I_opcodes[instruction].OPCODE;
        const rd = this.Register_opcodes[line[1].token];
        const funct3 = this.I_opcodes[instruction].FUNCT3;
        const indexOpeningBracket = line[2].token.indexOf('(')
        const indexClosingBracket = line[2].token.indexOf(')')
        const rs1 = this.Register_opcodes[line[2].token.slice(indexOpeningBracket + 1, indexClosingBracket)]
        const memoryAddress = line[2].token.slice(0, indexOpeningBracket)
        const imm = this.hex2bin(memoryAddress || 0, 12);

        _32bitInstruction = `${imm}${rs1}${funct3}${rd}${opcode}`
      }
      else if (instructionType.toUpperCase() == 'S') {
        /*
         * 0-6: opcode
         * 7-11: imm
         * 12-14: funct3
         * 15-19: rs1
         * 20-24: rs2
         * 25-31: imm
         */
        const opcode = this.S_opcodes[instruction].OPCODE
        const funct3 = this.S_opcodes[instruction].FUNCT3
        const indexOpeningBracket = line[2].token.indexOf('(')
        const indexClosingBracket = line[2].token.indexOf(')')
        const rs1 = this.Register_opcodes[line[1].token]
        const rs2 = this.Register_opcodes[line[2].token.slice(indexOpeningBracket + 1, indexClosingBracket)]
        const memoryAddress = line[2].token.slice(0, indexOpeningBracket)
        const imm1 = this.hex2bin(memoryAddress.slice(0, 8) || 0, 7)
        const imm2 = this.hex2bin(memoryAddress.slice(8) || 0, 5)

        _32bitInstruction = `${imm1}${rs2}${rs1}${funct3}${imm2}${opcode}`
      }
      else if (instructionType.toUpperCase() == 'SB') {
        /*
         * 0-6: opcode
         * 7-11: imm
         * 12-14: funct3
         * 15-19: rs1
         * 20-24: rs2
         * 25-31: imm
         */
        const opcode = this.SB_opcodes[instruction].OPCODE
        const funct3 = this.SB_opcodes[instruction].FUNCT3
        const branchaAddress = this.hex2bin(this.branch_address[line[3].token], 12)
        const imm1 = branchaAddress.slice(0, 1)
        const imm2 = branchaAddress.slice(2, 8)
        const imm3 = branchaAddress.slice(8)
        const imm4 = branchaAddress.slice(1, 2)
        const rs1 = this.Register_opcodes[line[1].token]
        const rs2 = this.Register_opcodes[line[2].token]

        _32bitInstruction = `${imm1}${imm2}${rs2}${rs1}${funct3}${imm3}${imm4}${opcode}`
      }

      _32bitInstructions[i] = _32bitInstruction;
    }

    return _32bitInstructions;
  }

  public parseDataSection(codeBySection: any): any {
    let variableLines: any[] = [];
    let listOfSupportedDatatypes: string[] = this.listOfSupportedDatatypes

    let variables = Object.keys(codeBySection.data);

    /*
    * Grammar/Productions:
    * E => Line
    * Line => [type] [value]                    // production rule 1
    */
    let pattern1 = ['type', 'value'];

    let pattern1Match = false;
    let syntaxError = false;

    for (let i = 0; i < variables.length; i++) {
      let variableTokens = codeBySection.data[variables[i]];
      let lineTokens: any = [];
      let lineTokenTypes: any = [];

      for (let j = 0; j < variableTokens.length; j++) {
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
        if (this.patternMatch(lineTokenTypes, ['type', 'value'])) {
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
        else if (this.patternSimilar(lineTokenTypes, pattern1))  // if approaching exact match, continue
        {
          // console.log('similar match, assembling .data line...');
          // do nothing, continue assembling the line
        }
        else {
          // error na
          alert("Compilation error in the .data section. The error was found around line " + (variableLines.length + 1) + " of this section, near " + "'" + lineTokens[j] + "'.");
          syntaxError = true;
          break; // break inner
        }

      }

      if (syntaxError) break; //break outer
    }
    let duplicateVariableNames = (new Set(variableLines.map(a => a.name))).size !== variableLines.length;
    if (duplicateVariableNames) { alert('Compilation error in the .data section. There seems to be a duplicate name in the variables.') }
    this.error = syntaxError || duplicateVariableNames;
    return variableLines;
  }

  public parseTextSection(codeBySection: any): any {
    if (this.error) { return; }

    let codeLines: any[] = [];
    // ito lang yung nasa specs
    let R_type: string[] = this.R_type;
    let S_type: string[] = this.S_type;
    let I_type: string[] = this.I_type;
    let SB_type: string[] = this.SB_type;
    // lol dagdagan nalang para dun sa a1 a2
    let listOfSupportedRegisters: string[] = Object.keys(this.state.registers);
    listOfSupportedRegisters = listOfSupportedRegisters.map(function (x) { return x.toUpperCase(); })

    // need help here
    let pattern1 = ['R', 'register', 'register', 'register'];
    let pattern2 = ['R', 'register', 'register', 'immediate'];
    let pattern3 = ['I', 'register', 'address'];
    let pattern4 = ['SB', 'register', 'register', 'branch'];
    let pattern5 = ['macro'];
    let pattern6 = ['S', 'register', 'address'];
    let pattern7 = ['branch', 'R', 'register', 'register', 'register'];
    let pattern8 = ['branch', 'R', 'register', 'register', 'immediate'];
    let pattern9 = ['branch', 'I', 'register', 'address'];
    let pattern10 = ['branch', 'S', 'register', 'address'];

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
    let lineTokens: { [key: string]: string }[] = [];
    let pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false, pattern6Match = false, patternBranchMatch = false;
    let symbolList: string[] = []

    for (let i = 0; i < tokens.length; i++) {
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
      else if (I_type.includes(token)) tokenType = 'I';
      else if (SB_type.includes(token)) tokenType = 'SB';
      else if (S_type.includes(token)) tokenType = 'S';
      else if (listOfSupportedRegisters.includes(token)) tokenType = 'register';
      else if (token.includes('(') && token.includes(')')) tokenType = 'address'; // lol happy path
      else if (token.includes('0X') || token.match(/^\-?(\d*)$/)) tokenType = 'immediate'; // lol happy path
      else if (token.slice(-1) === ':') {
        if (symbolList.includes(token.slice(0, -1))) {
          tokenType = 'branch';
        } else {
          alert(`${token.slice(0, -1)} not found in symbol table`);
          this.error = true;
          break;
        }
      }
      else if (codeBySection.macro[token] != undefined || codeBySection.macro[token.toLowerCase()] != undefined) tokenType = 'macro';
      else if (token.match(/^[a-z0-9]+$/i)) {
        symbolList.push(token);
        tokenType = 'branch';
      }
      else if (codeBySection.data[token] != undefined || codeBySection.data[token.toLowerCase()] != undefined) tokenType = 'variable'; // case-sensitive ba dapat to?

      lineTokens.push({ 'token': token, 'type': tokenType });
      lineTokenTypes.push(tokenType);

      // pattern checking if it is inside a branch
      if (this.patternMatch(lineTokenTypes, pattern7) || this.patternMatch(lineTokenTypes, pattern8) || this.patternMatch(lineTokenTypes, pattern9) || this.patternMatch(lineTokenTypes, pattern10)) {
        patternBranchMatch = true;
      } else patternBranchMatch = false;

      // pattern 1 checking: [computation_instruction] [register],[register],[register]   
      if (this.patternMatch(lineTokenTypes, pattern1)) {
        pattern1Match = true;
      } else pattern1Match = false;

      // pattern 1 checking: [computation_immediate_instruction] [register],[register],[register]   
      if (this.patternMatch(lineTokenTypes, pattern2)) {
        pattern2Match = true;
      } else pattern2Match = false;

      // pattern 3 checking: [loadstore_instruction] [register],[address(address)]  
      if (this.patternMatch(lineTokenTypes, pattern3)) {
        pattern3Match = true;
      } else pattern3Match = false;

      // pattern 4 checking: [conditional_branch_instruction] => mahirap to. wag muna gawin
      if (this.patternMatch(lineTokenTypes, pattern4)) {
        pattern4Match = true;
      } else pattern4Match = false;

      // pattern 5 checking: [macro]  
      if (this.patternMatch(lineTokenTypes, pattern5)) {
        pattern5Match = true;
      } else pattern5Match = false;

      // pattern 5 checking: [S type]  
      if (this.patternMatch(lineTokenTypes, pattern6)) {
        pattern6Match = true;
      } else pattern6Match = false;

      // if exact match, add line
      if (pattern1Match || pattern2Match || pattern3Match || pattern4Match || pattern5Match || pattern6Match) {
        codeLines.push(lineTokens); // itong lines, later on ito yung gagawin nating op-code.
        lineTokenTypes = [];
        lineTokens = [];
        pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false, pattern6Match = false, patternBranchMatch = false;
      }
      else if (patternBranchMatch) {
        const branchAddress = 4096 + (i * 4);
        this.branch_address[lineTokens.slice(0, 1)[0].token.slice(0, -1)] = branchAddress.toString(16);
        lineTokens.push({ 'token': `${branchAddress.toString(16)}`, 'type': 'address' })
        codeLines.push(lineTokens.slice(1));
        lineTokenTypes = [];
        lineTokens = [];
        pattern1Match = false, pattern2Match = false, pattern3Match = false, pattern4Match = false, pattern5Match = false, pattern6Match = false, patternBranchMatch = false;
      }
      else if (this.patternSimilar(lineTokenTypes, pattern1)
        || this.patternSimilar(lineTokenTypes, pattern2)
        || this.patternSimilar(lineTokenTypes, pattern3)
        || this.patternSimilar(lineTokenTypes, pattern4)
        || this.patternSimilar(lineTokenTypes, pattern5)
        || this.patternSimilar(lineTokenTypes, pattern6)
        || this.patternSimilar(lineTokenTypes, pattern7)
        || this.patternSimilar(lineTokenTypes, pattern8)
        || this.patternSimilar(lineTokenTypes, pattern9)
        || this.patternSimilar(lineTokenTypes, pattern10))
      // if approaching exact match, continue
      {
        // console.log('similar match, assembling .text line...');
        // do nothing, assemble next line
      }
      else {
        console.log('error at ', codeLines)
        // error na, hanggang 4 tokens lang
        alert("Compilation error in the .text section. The error was found around line " + (codeLines.length + 1) + " of this section, near " + "'" + tokens[i] + "'.");
        this.error = true;
        break;
      }
    }

    return codeLines
  }

  // check for an exact pattern match
  private patternMatch(lineTokens: any, pattern: any): boolean {
    if (lineTokens.length !== pattern.length) {
      return false;
    };
    for (let i = 0; i < lineTokens.length; i++) {
      if (pattern[i] != lineTokens[i]) {
        return false;
      };
    };
    return true;
  }

  // check for a similar pattern match while assembling the line
  private patternSimilar(lineTokens: any, pattern: any): boolean {
    for (let i = 0; i < lineTokens.length; i++) {
      if (pattern[i] != lineTokens[i]) {
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

  public convertBinaryToHex(bin): string {
    let digit = parseInt(bin, 2);
    let num = Number(digit);
    let hex = num.toString(16).toUpperCase();
    return hex;
  }

  private hex2bin(hex, n) {
    return ("0".repeat(n) + (parseInt(hex, 16)).toString(2)).substr(-n);
  }

  private bin2hex(bin: string) {
    return parseInt(bin, 2).toString(16).toUpperCase();
  }

  private dec2hex(dec, n) {
    return ("0".repeat(n) + (dec >>> 0).toString(16).toUpperCase()).substr(-n);
  }

  private hex2dec(hex) {
    if (hex.length % 2 != 0) {
      hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
      num = num - maxVal
    }
    return num;
  }
}