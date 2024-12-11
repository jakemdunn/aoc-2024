import run from "aocrunner";

const parseInput = (rawInput: string) => {
  const stones = rawInput.split(" ");
  const memo = new Map<string, number>();
  function* iterateStone(
    stone: string,
    iterations: number,
  ): Generator<unknown, number> {
    if (iterations === 0) {
      return 1;
    }

    const key = `${stone}-${iterations}`;
    if (memo.has(key)) {
      return memo.get(key) as number;
    }
    const nextIteration = iterations - 1;
    let count = 0;

    if (stone === "0") {
      count = yield* iterateStone("1", nextIteration);
    } else if (stone.length % 2 === 0) {
      count =
        (yield* iterateStone(stone.slice(0, stone.length / 2), nextIteration)) +
        (yield* iterateStone(
          parseInt(stone.slice(stone.length / 2)).toString(),
          nextIteration,
        ));
    } else {
      count = yield* iterateStone(
        (parseInt(stone) * 2024).toString(),
        nextIteration,
      );
    }

    memo.set(key, count);
    return count;
  }

  return (iterations = 25) =>
    stones.reduce((sum, stone) => {
      const generator = iterateStone(stone, iterations);
      let result = generator.next();
      while (!result.done) {
        result = generator.next();
      }
      return sum + result.value;
    }, 0);
};

const part1 = (rawInput: string) => parseInput(rawInput)();
const part2 = (rawInput: string) => parseInput(rawInput)(75);

run({
  part1: {
    tests: [
      {
        input: `125 17`,
        expected: 55312,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
