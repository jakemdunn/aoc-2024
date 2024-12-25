import run from "aocrunner";

type Operation = "XOR" | "AND" | "OR";
type Instruction = {
  operation: Operation;
  keyA: string;
  keyB: string;
  keyOut: string;
};

const parseInput = (rawInput: string) => {
  const [rawBits, rawInstructions] = rawInput.split("\n\n");

  const bits = new Map<string, bigint>();
  const getAddress = (address: string) => {
    const [_, key, rawOffset] = address.match(/^([\D]+)(\d*)$/)!;
    const offset = rawOffset ? BigInt(rawOffset) : 0n;
    if (!bits.has(key)) {
      bits.set(key, 0n);
    }
    return { bits: bits.get(key)!, key, offset };
  };
  type Address = ReturnType<typeof getAddress>;

  const getBit = ({ bits: addressBits, offset }: Address) =>
    addressBits >> offset;
  const setBit = (bit: bigint, { bits: addressBits, offset, key }: Address) => {
    bits.set(key, addressBits | ((bit & 1n) << offset));
  };

  const completedKeys = new Set<string>();
  const initialKeys = new Set<string>();
  const currentKeys = new Set<string>();

  const doOperation =
    (operation: (a: bigint, b: bigint) => bigint) =>
    ({ keyA, keyB, keyOut }: Instruction) => {
      if (completedKeys.has(keyOut)) return keyOut;
      if (!completedKeys.has(keyA) || !completedKeys.has(keyB)) return;

      completedKeys.add(keyOut);

      const addressA = getAddress(keyA);
      const addressB = getAddress(keyB);
      const addressOut = getAddress(keyOut);

      const result = operation(getBit(addressA), getBit(addressB)) & 1n;

      setBit(result, addressOut);
      return keyOut;
    };

  const operations = {
    AND: doOperation((a, b) => a & b),
    OR: doOperation((a, b) => a | b),
    XOR: doOperation((a, b) => a ^ b),
  };

  const parents = new Map<string, string[]>();
  rawBits.split("\n").forEach((line) => {
    const [key, rawValue] = line.split(": ");
    initialKeys.add(key);
    completedKeys.add(key);
    currentKeys.add(key);
    if (rawValue === "1") setBit(1n, getAddress(key));
  });

  const instructions = new Map<
    string,
    { operation: Operation; keyA: string; keyB: string; keyOut: string }[]
  >();
  rawInstructions.split("\n").map((line) => {
    const [_, keyA, operation, keyB, keyOut] = line.match(
      /^(.*) (.*) (.*) -> (.*)$/,
    )!;
    const instruction = {
      operation: operation as keyof typeof operations,
      keyA,
      keyB,
      keyOut,
    };
    instructions.set(keyA, [
      ...(instructions.get(keyA) ?? []),
      { operation: operation as keyof typeof operations, keyA, keyB, keyOut },
    ]);
    instructions.set(keyB, [...(instructions.get(keyB) ?? []), instruction]);
    parents.set(keyOut, [keyA, keyB]);
  });

  const reset = (startBits: Map<string, bigint>) => {
    completedKeys.clear();
    currentKeys.clear();
    bits.clear();

    initialKeys.forEach((key) => {
      completedKeys.add(key);
      currentKeys.add(key);
    });
    startBits.forEach((value, key) => bits.set(key, value));
  };

  return {
    bits,
    completedKeys,
    currentKeys,
    instructions,
    operations,
    parents,
    reset,
  };
};

type Circuit = ReturnType<typeof parseInput>;

const getResults = (circuit: Circuit) => {
  while (circuit.currentKeys.size > 0) {
    circuit.currentKeys.forEach((address) => {
      const addressInstructions = circuit.instructions.get(address)!;
      const allDone = addressInstructions.reduce((done, instruction) => {
        const result = circuit.operations[instruction.operation](instruction);
        if (!result) {
          return false;
        }
        if (result.startsWith("z")) {
          return done;
        }
        circuit.currentKeys.add(result);
        return done;
      }, true);
      if (allDone) {
        circuit.currentKeys.delete(address);
      }
    });
  }
  return circuit;
};

const part1 = (rawInput: string) => {
  return getResults(parseInput(rawInput)).bits.get("z");
};

type InputOperation = "+" | "&";
const part2 = (junkInput: string) => {
  const parts = junkInput.split("!!!!");
  const operation = (parts.length > 1 ? parts.shift() : "+") as InputOperation;
  const rawInput = parts.shift() as string;
  const circuit = parseInput(rawInput);

  const bitLength = [...circuit.currentKeys.values()].filter((key) =>
    key.startsWith("x"),
  ).length;

  const getInstruction = (options: Instruction[], target: Operation) =>
    options.find(({ operation }) => operation === target);
  const getInstructions = (key: string): Instruction[] => [
    ...(circuit.instructions.get(key) ?? []),
  ];
  type PredictedInstruction = {
    operation: Operation | "c";
    outputTo: PredictedInstructions;
  };
  type PredictedInstructions = (PredictedInstruction | "solution" | "c")[];
  const halfAdder: PredictedInstructions = [
    { operation: "AND", outputTo: ["c"] },
    { operation: "XOR", outputTo: ["solution"] },
  ];
  const solutionAND: PredictedInstruction = {
    operation: "AND",
    outputTo: ["solution"],
  };
  const solutionXOR: PredictedInstruction = {
    operation: "XOR",
    outputTo: ["solution"],
  };
  const cOR: PredictedInstruction = {
    operation: "OR",
    outputTo: ["c"],
  };
  const joiningAND: PredictedInstruction = {
    operation: "AND",
    outputTo: [cOR],
  };
  const fullAdder: PredictedInstructions = [
    {
      operation: "XOR",
      outputTo: [solutionXOR, joiningAND],
    },
    {
      operation: "AND",
      outputTo: [cOR],
    },
    { operation: "c", outputTo: [solutionXOR, joiningAND] },
  ];
  type CheckOperationResults = {
    errors?: string[];
    c?: string;
  };
  const checkOperation = (
    key: string,
    cKey: string | undefined,
    solution: string,
    predicted: PredictedInstructions,
    existingOperations = new Map<PredictedInstructions, string>(),
  ): CheckOperationResults => {
    if (existingOperations.has(predicted)) {
      if (existingOperations.get(predicted) !== key) {
        console.log(
          "misspoint to wrong node",
          existingOperations.get(predicted),
          key,
        );
        return {
          errors: [existingOperations.get(predicted)!, key],
        };
      }
    } else {
      existingOperations.set(predicted, key);
    }
    const instructions = getInstructions(key);
    return predicted.reduce<CheckOperationResults>((results, operation) => {
      const merge = (operationResults: CheckOperationResults) => ({
        ...results,
        ...operationResults,
        errors: [...(results.errors ?? []), ...(operationResults.errors ?? [])],
      });
      if (operation === "c") return merge({ c: key });
      if (operation === "solution") {
        if (solution !== key) {
          console.log("misspoint to solution", key, solution);
          return merge({ errors: [key] });
        }
        return {};
      }
      if (operation.operation === "c") {
        if (!cKey) {
          throw new Error(
            `No cKey provided for operation involving c at ${key}`,
          );
        }
        return merge(checkOperation(cKey, cKey, solution, operation.outputTo));
      }

      const instruction = getInstruction(instructions, operation.operation);
      if (!instruction) {
        console.log("misspoint to wrong instruction", key, operation.operation);
        return merge({ errors: [key] });
      }
      return merge(
        checkOperation(instruction.keyOut, cKey, solution, operation.outputTo),
      );
    }, {});
  };
  let badKeys = new Set<string>();
  let c: string | undefined;
  for (let index = 0; index < bitLength; index++) {
    const keyX = `x${index.toString().padStart(2, "0")}`;
    let predicted: PredictedInstructions;
    if (operation === "&") {
      // Junk prediction for Junk test ୧༼ಠ益ಠ༽୨
      predicted = [solutionAND];
    } else {
      predicted = index === 0 ? halfAdder : fullAdder;
    }
    const result = checkOperation(keyX, c, keyX.replace("x", "z"), predicted);
    if (result.errors) badKeys = badKeys.union(new Set(result.errors));
    c = result.c;
  }

  return [...badKeys].sort().join(",");
};

const input = `x00: 1
x01: 0
x02: 1
x03: 1
x04: 0
y00: 1
y01: 1
y02: 1
y03: 1
y04: 1

ntg XOR fgs -> mjb
y02 OR x01 -> tnw
kwq OR kpj -> z05
x00 OR x03 -> fst
tgd XOR rvg -> z01
vdt OR tnw -> bfw
bfw AND frj -> z10
ffh OR nrd -> bqk
y00 AND y03 -> djm
y03 OR y00 -> psh
bqk OR frj -> z08
tnw OR fst -> frj
gnj AND tgd -> z11
bfw XOR mjb -> z00
x03 OR x00 -> vdt
gnj AND wpb -> z02
x04 AND y00 -> kjc
djm OR pbm -> qhw
nrd AND vdt -> hwm
kjc AND fst -> rvg
y04 OR y02 -> fgs
y01 AND x02 -> pbm
ntg OR kjc -> kwq
psh XOR fgs -> tgd
qhw XOR tgd -> z09
pbm OR djm -> kpj
x03 XOR y03 -> ffh
x00 XOR y04 -> ntg
bfw OR bqk -> z06
nrd XOR fgs -> wpb
frj XOR qhw -> z04
bqk OR frj -> z07
y03 OR x01 -> nrd
hwm AND bqk -> z03
tgd XOR rvg -> z12
tnw OR pbm -> gnj`;

run({
  part1: {
    tests: [
      {
        input: `x00: 1
x01: 1
x02: 1
y00: 0
y01: 1
y02: 0

x00 AND y00 -> z00
x01 XOR y01 -> z01
x02 OR y02 -> z02`,
        expected: 4n,
      },
      {
        input,
        expected: 2024n,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `&!!!!x00: 0
x01: 1
x02: 0
x03: 1
x04: 0
x05: 1
y00: 0
y01: 0
y02: 1
y03: 1
y04: 0
y05: 1

x00 AND y00 -> z05
x01 AND y01 -> z02
x02 AND y02 -> z01
x03 AND y03 -> z03
x04 AND y04 -> z04
x05 AND y05 -> z00`,
        expected: "z00,z01,z02,z05",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
