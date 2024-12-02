import run from "aocrunner";

const parseInput = (rawInput: string) =>
  rawInput
    .split("\n")
    .map((row) => row.split(" ").map((level) => parseInt(level)));

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.reduce((safeRows, row) => {
    const direction = row[1] - row[0];
    const unsafe = row.some((level, index) => {
      if (index === 0) {
        return false;
      }
      const previousLevel = row[index - 1];
      const difference = level - previousLevel;
      if (
        difference === 0 ||
        (difference < 0 && direction > 0) ||
        (difference > 0 && direction < 0)
      ) {
        return true;
      }
      if (Math.abs(difference) > 3) {
        return true;
      }
      return false;
    });
    return safeRows + (unsafe ? 0 : 1);
  }, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const findUnsafeIndex = (row: number[]) => {
    const direction = row[1] - row[0];
    return row.findIndex((level, index) => {
      if (index === 0) {
        return false;
      }
      const previousLevel = row[index - 1];
      const difference = level - previousLevel;
      if (
        difference === 0 ||
        (difference < 0 && direction > 0) ||
        (difference > 0 && direction < 0)
      ) {
        return true;
      }
      if (Math.abs(difference) > 3) {
        return true;
      }
      return false;
    });
  };
  return input.reduce((safeRows, row) => {
    const unsafeIndex = findUnsafeIndex(row);
    if (unsafeIndex === -1) {
      return safeRows + 1;
    }
    for (let index = 0; index < row.length; index++) {
      const option = [...row];
      option.splice(index, 1);
      if (findUnsafeIndex(option) === -1) {
        return safeRows + 1;
      }
    }
    return safeRows;
  }, 0);
};

const input = `7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 2,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 4,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
