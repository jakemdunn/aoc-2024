import run from "aocrunner";

const parseInput = (rawInput: string) => {
  const [a, b, c, program] = rawInput.matchAll(/([\d,]+)/g);
  return {
    registers: {
      a: BigInt(a[0]),
      b: BigInt(b[0]),
      c: BigInt(c[0]),
    },
    program: program[0].split(",").map((char) => parseInt(char)),
  };
};

const runInstructions = ({
  program,
  registers,
}: ReturnType<typeof parseInput>) => {
  let pointer = 0;

  const literalOperand = () => program[pointer + 1];
  const comboOperand = () => {
    const operand = literalOperand();
    switch (operand) {
      case 4:
        return registers.a;
      case 5:
        return registers.b;
      case 6:
        return registers.c;
      case 7:
        throw new Error("reserved");
      default:
        return BigInt(operand);
    }
  };
  type InstructionResult = "jumped" | BigInt;
  type Instruction = () => InstructionResult | void;

  const adv: Instruction = () => {
    registers.a = registers.a / 2n ** comboOperand();
  };
  const bxl: Instruction = () => {
    registers.b = registers.b ^ BigInt(literalOperand());
  };
  const bst: Instruction = () => {
    registers.b = comboOperand() % 8n;
  };
  const jnz: Instruction = () => {
    if (registers.a === 0n) return;
    pointer = literalOperand();
    return "jumped";
  };
  const bxc: Instruction = () => {
    registers.b = registers.b ^ registers.c;
  };
  const out: Instruction = () => comboOperand() % 8n;
  const bdv: Instruction = () => {
    registers.b = registers.a / 2n ** comboOperand();
  };
  const cdv: Instruction = () => {
    registers.c = registers.a / 2n ** comboOperand();
  };

  const instructions = [adv, bxl, bst, jnz, bxc, out, bdv, cdv];

  const outputs: BigInt[] = [];
  while (pointer < program.length - 1) {
    const result = instructions[program[pointer]]();
    if (result !== "jumped") {
      pointer += 2;
    }
    if (typeof result === "bigint") {
      outputs.push(result);
    }
  }

  return outputs;
};

const part1 = (rawInput: string) =>
  runInstructions(parseInput(rawInput)).join(",");

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const goal = input.program.join(",");
  const reversedProgram = [...input.program]
    .reverse()
    .map((int) => BigInt(int));

  const end = 8 ** input.program.length;
  const offsets = input.program.map((_) => 0n);
  const getOffset = () =>
    offsets.reduce((sum, offset, index) => {
      if (offset === 0n) return sum;
      return 8n ** BigInt(index) * offset + sum;
    }, 8n ** BigInt(input.program.length - 1));

  let a: bigint;
  let result: BigInt[];
  do {
    a = getOffset();
    result = runInstructions({
      program: [...input.program],
      registers: {
        ...input.registers,
        a,
      },
    });
    const misMatchedIndex =
      result.length -
      1 -
      [...result]
        .reverse()
        .findIndex((int, index) => int !== reversedProgram[index]);
    offsets[misMatchedIndex]++;
  } while (result.join(",") !== goal && a < end);

  return parseInt(a.toString());
};

run({
  part1: {
    tests: [
      {
        input: `Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0`,
        expected: "4,6,3,5,6,3,5,2,1,0",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Register A: 2024
Register B: 0
Register C: 0

Program: 0,3,5,4,3,0`,
        expected: 117440,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
