import run from "aocrunner";

type Input = { keys: bigint[]; locks: bigint[] };
type InputType = keyof Input;
const parseInput = (rawInput: string) =>
  rawInput.split("\n\n").reduce<Input>(
    (output, rawObject) => {
      const type: InputType = rawObject[0] === "#" ? "locks" : "keys";
      const lines = rawObject.split("\n");

      // Junk
      lines.pop();
      lines.shift();

      let object = 0n;
      lines.forEach((line, y) =>
        line.split("").forEach((symbol, x) => {
          if (symbol === "#") object |= 1n << BigInt(x * line.length + y);
        }),
      );
      output[type].push(object);
      return output;
    },
    { keys: [], locks: [] },
  );

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let sum = 0;
  input.locks.forEach((lock) =>
    input.keys.forEach((key) => {
      if ((key & lock) === 0n) sum++;
    }),
  );
  return sum;
};

const input = `#####
.####
.####
.####
.#.#.
.#...
.....

#####
##.##
.#.##
...##
...#.
...#.
.....

.....
#....
#....
#...#
#.#.#
#.###
#####

.....
.....
#.#..
###..
###.#
###.#
#####

.....
.....
.....
#....
#.#..
#.#.#
#####`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 3,
      },
    ],
    solution: part1,
  },
  trimTestInputs: true,
  onlyTests: false,
});
