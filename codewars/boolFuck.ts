import { assert } from "chai";

type Command = "+" | "," | ";" | "<" | ">" | "[" | "]";

const pointerToCellIndex = (pointer: number) => Math.floor(pointer / 8);
const pointerToBitIndex = (pointer: number) => (pointer % 8);

export function boolfuck(code: string, input: string = ""): string {
  let memory = [0];
  let memoryPointer = 0;
  let codePointer = 0;
  let inputPointer = 0;
  let output: number[] = [];
  let outputSize = 0;

  const getCommand = () => code[codePointer] as Command;
  const readInputBit = () => {
    const cell = input.charCodeAt(pointerToCellIndex(inputPointer));
    const bitIndex = pointerToBitIndex(inputPointer);
    return cell & (1 << bitIndex);
  };
  const getCurrentBit = () => {
    const cell = memory[pointerToCellIndex(memoryPointer)];
    const mask = 1 << (7 - pointerToBitIndex(memoryPointer));
    return (cell & mask) >> (7 - pointerToBitIndex(memoryPointer));
  }

  while (codePointer < code.length) {
    console.log(memory.map((n) => n.toString(2)), output.map((n) => n.toString(2)));

    switch(getCommand()) {
      case '+': // Flips the value of the bit under the pointer
        memory[pointerToCellIndex(memoryPointer)] ^= 1 << (7 - pointerToBitIndex(memoryPointer));
        break;
      case ',': // Reads a bit from the input stream, storing it under the pointer
        memory[pointerToCellIndex(memoryPointer)] &=  readInputBit();
        break;
      case ';': // Outputs the bit under the pointer to the output stream
        if (outputSize % 8 == 0) output.push(0);
        outputSize += 1;
        const cell = output[output.length - 1];
        const bitIndex = 7 - pointerToBitIndex(outputSize);
        output[output.length - 1] = cell & getCurrentBit() << bitIndex;
        break;
      case '<': // Moves the pointer left by 1 bit
        memoryPointer = memoryPointer - 1;
      case '>': // Moves the pointer left by 1 bit
        memoryPointer = memoryPointer + 1;
      case '[': // If the value under the pointer is 0 then skip to the corresponding ]
        if (getCurrentBit() == 0) {
          while (getCommand() != ']') {
            codePointer += 1;
          }
          codePointer -= 1;
        }
        break;
      case ']': // Jumps back to the matching [ character, if the value under the pointer is 1
        if (getCurrentBit() == 1) {
          while (getCommand() != '[') {
            codePointer -= 1;
          }
          codePointer += 1;
        }
        break;
    }

    codePointer += 1;
  }

  return output.map((byte) => String.fromCharCode(byte)).join('');
}

describe("solution", function(){  
  it("should work for the \"Hello World\" program provided on the official website", function () {
    assert.equal(boolfuck(`;;;+;+;;+;+;
+;+;+;+;;+;;+;
;;+;;+;+;;+;
;;+;;+;+;;+;
+;;;;+;+;;+;
;;+;;+;+;+;;
;;;;;+;+;;
+;;;+;+;;;+;
+;;;;+;+;;+;
;+;+;;+;;;+;
;;+;;+;+;;+;
;;+;+;;+;;+;
+;+;;;;+;+;;
;+;+;+;`), "Hello, world!\n", "Your interpreter did not work with the code example provided on the official website");
  });
  it("should work with more example test cases", function () {
    // Echo until byte(255) encountered
    assert.equal(boolfuck(">,>,>,>,>,>,>,>,<<<<<<<[>]+<[+<]>>>>>>>>>[+]+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+]<<<<<<<<;>;>;>;>;>;>;>;<<<<<<<,>,>,>,>,>,>,>,<<<<<<<[>]+<[+<]>>>>>>>>>[+]+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]", "Codewars" + String.fromCharCode(255)), "Codewars");
    // Echo until byte(0) encountered
    assert.equal(boolfuck(">,>,>,>,>,>,>,>,>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]>;>;>;>;>;>;>;>;>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+]+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]>,>,>,>,>,>,>,>,>+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]", "Codewars" + String.fromCharCode(0)), "Codewars");
    // Two numbers multiplier
    assert.equal(boolfuck(">,>,>,>,>,>,>,>,>>,>,>,>,>,>,>,>,<<<<<<<<+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]>>>>>>>>>>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+]>[>]+<[+<]>>>>>>>>>[+]>[>]+<[+<]>>>>>>>>>[+]<<<<<<<<<<<<<<<<<<+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]>>>>>>>>>>>>>>>>>>>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+<<<<<<<<[>]+<[+<]>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>[+]<<<<<<<<<<<<<<<<<<<<<<<<<<[>]+<[+<]>>>>>>>>>[+]>>>>>>>>>>>>>>>>>>+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]<<<<<<<<<<<<<<<<<<+<<<<<<<<+[>+]<[<]>>>>>>>>>[+]+<<<<<<<<+[>+]<[<]>>>>>>>>>]<[+<]>>>>>>>>>>>>>>>>>>>;>;>;>;>;>;>;>;<<<<<<<<", String.fromCharCode(8, 9)), String.fromCharCode(72));
  });
});
