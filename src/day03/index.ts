import run from "aocrunner";

const mul = (sum: number, matches: RegExpExecArray) =>
  sum + parseInt(matches[1]) * parseInt(matches[2]);

const part1 = (rawInput: string) =>
  [...rawInput.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/gs)].reduce(mul, 0);

const part2 = (rawInput: string) =>
  [
    ...rawInput.matchAll(
      /(?<!don't\(\)(?:(?!do\(\)).)*)mul\((\d{1,3}),(\d{1,3})\)/gs,
    ),
  ].reduce(mul, 0);

run({
  part1: {
    tests: [
      {
        input: `xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))`,
        expected: 161,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))`,
        expected: 48,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
