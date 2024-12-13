import run from "aocrunner";

interface Offset {
  x: number;
  y: number;
}
const parsePart = (rawPart: string): Offset => {
  const [, x, y] = rawPart.match(/X.(\d+), Y.(\d+)/) ?? [];
  return {
    x: parseInt(x),
    y: parseInt(y),
  };
};
const parseInput = (rawInput: string, offset: Offset = { x: 0, y: 0 }) => {
  const machines = rawInput
    .split("\n\n")
    .map<{ a: Offset; b: Offset; prize: Offset }>((machine) => {
      const [rawA, rawB, rawPrize] = machine.split("\n");
      const a = parsePart(rawA);
      const b = parsePart(rawB);
      const prize = parsePart(rawPrize);
      return {
        a,
        b,
        prize: {
          x: prize.x + offset.x,
          y: prize.y + offset.y,
        },
      };
    });
  const cost = { a: 3, b: 1 };

  return machines.reduce((sum, { a, b, prize: { x, y } }) => {
    const bPresses = (y * a.x - a.y * x) / (a.x * b.y - a.y * b.x);
    const aPresses = (x - b.x * bPresses) / a.x;
    if (
      aPresses > 0 &&
      Math.round(aPresses) === aPresses &&
      bPresses > 0 &&
      Math.round(bPresses) === bPresses
    ) {
      return sum + bPresses * cost.b + aPresses * cost.a;
    }
    return sum;
  }, 0);
};
const part1 = (rawInput: string) => parseInput(rawInput);

const part2 = (rawInput: string) =>
  parseInput(rawInput, { x: 10000000000000, y: 10000000000000 });

const input = `Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 480,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 480,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
