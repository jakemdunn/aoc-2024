import run from "aocrunner";

const parseInput = (rawInput: string) =>
  rawInput.split("\n").reduce<{ left: number[]; right: number[] }>(
    (output, line) => {
      const parsed = line.match(/^(\d+)\s+(\d+)$/);
      if (!parsed) {
        return output;
      }
      return {
        left: [...output.left, parseInt(parsed![1])],
        right: [...output.right, parseInt(parsed![2])],
      };
    },
    { left: [], right: [] },
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const sorted = {
    left: input.left.sort(),
    right: input.right.sort(),
  }

  return sorted.left.reduce((sum,left, index)=> {
    return Math.abs(left - sorted.right[index]) + sum
  }, 0)
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const getCounts = (input: number[]) => input.reduce<Record<string, number>>((counts, item)=> 
    ({...counts, [item.toString()]: (counts[item.toString()] ?? 0 )+ 1}),{}
  );

  const counts = {
    left: getCounts(input.left),
    right: getCounts(input.right),
  }

  return Object.keys(counts.left).reduce((sum, key) => {
    if(!counts.right[key]) {
      return sum;
    }
    return sum + counts.left[key] * counts.right[key] * parseInt(key);
  },0);
};


const input = 
`3   4
4   3
2   5
1   3
3   9
3   3`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 11,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 31,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
