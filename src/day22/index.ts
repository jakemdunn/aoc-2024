import run from "aocrunner";

const parseInput = (rawInput: string) => {
  const parts = rawInput.split("\n\n");
  const iterations = parts.length > 1 ? parseInt(parts.shift()!) : 2000;
  const numbers = parts[0].split("\n").map(BigInt);
  return {
    numbers,
    iterations,
  };
};

const mix = (a: bigint, b: bigint) => a ^ b;
const prune = (a: bigint) => a % 16777216n;

const transformA = (input: bigint) => prune(mix(input * 64n, input));
const transformB = (input: bigint) => prune(mix(input / 32n, input));
const transformC = (input: bigint) => prune(mix(input * 2048n, input));

const transform = (input: bigint) => transformC(transformB(transformA(input)));

const part1 = (rawInput: string) => {
  const { numbers, iterations } = parseInput(rawInput);

  return numbers.reduce((sum, number) => {
    let current = number;
    for (let index = 0; index < iterations; index++) {
      current = transform(current);
    }
    return sum + current;
  }, 0n);
};

const part2 = (rawInput: string) => {
  const { numbers, iterations } = parseInput(rawInput);

  const options = new Map<string, Map<number, bigint>>();
  numbers.forEach((number, sellerIndex) => {
    let current = number;
    let previousDigit: bigint | undefined = undefined;
    const sequence: bigint[] = [];
    for (let index = 0; index < iterations; index++) {
      current = transform(current);
      const digit = current % 10n;
      if (previousDigit !== undefined) {
        const difference = previousDigit - digit;
        sequence.push(difference);
      }
      if (sequence.length > 4) sequence.shift();
      if (sequence.length === 4) {
        const key = sequence.join(",");
        if (!options.has(key)) {
          options.set(key, new Map());
        }
        if (!options.get(key)!.get(sellerIndex)) {
          options.get(key)!.set(sellerIndex, digit);
        }
      }

      previousDigit = digit;
    }
  });
  let biggest = 0n;
  let biggestKey = "";
  options.forEach((values, optionKey) => {
    let size = 0n;
    values.forEach((value) => {
      size += value;
    });
    biggestKey = size > biggest ? optionKey : biggestKey;
    biggest = size > biggest ? size : biggest;
  });
  return biggest;
};

const input = `1
10
100
2024`;

run({
  part1: {
    tests: [
      {
        input: `1

123`,
        expected: 15887950n,
      },
      {
        input,
        expected: 37327623n,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `1
2
3
2024`,
        expected: 23n,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
