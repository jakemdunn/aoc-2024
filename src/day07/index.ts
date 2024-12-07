import run from "aocrunner";

const parseInput = (
  rawInput: string,
  addCalculation: (options: number[], number: number) => number[],
) => {
  const equations = rawInput.split("\n").map((line) => {
    const [solution, numbers] = line.split(": ");
    return {
      solution: parseInt(solution),
      numbers: numbers.split(" ").map((part) => parseInt(part)),
    };
  });
  return equations.reduce((sum, equation) => {
    const options = equation.numbers.reduce<number[]>((current, number) => {
      if (!current.length) {
        return [number];
      }
      return addCalculation(current, number);
    }, []);
    if (options.includes(equation.solution)) {
      return sum + equation.solution;
    }
    return sum;
  }, 0);
};

const part1 = (rawInput: string) => {
  return parseInput(rawInput, (options, number) => [
    ...options.map((option) => option * number),
    ...options.map((option) => option + number),
  ]);
};

const part2 = (rawInput: string) => {
  return parseInput(rawInput, (options, number) => [
    ...options.map((option) => option * number),
    ...options.map((option) => option + number),
    ...options.map((option) => parseInt(`${option}${number}`)),
  ]);
};

const input = `190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20`;
run({
  part1: {
    tests: [
      {
        input,
        expected: 3749,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 11387,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
