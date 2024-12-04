import run from "aocrunner";

const reverseString = (input: string) => [...input].reverse().join("");
const getDiagonal = (input: string, type: "right" | "left" = "right") => {
  const grid = input.split("\n").map((line) => [...line]);
  return [...new Array(grid.length + grid[0].length - 1)]
    .reduce<string[][]>((output, _, index) => {
      for (let line = Math.min(index, grid.length - 1); line >= 0; line--) {
        const character =
          type === "right" ? grid[line].pop() : grid[line].shift();
        if (character) {
          output[index] = [...(output[index] ?? []), character];
        }
      }
      return output;
    }, [])
    .map((line) => line.join(""))
    .join("\n");
};

const parseInput = (forward: string) => {
  const vertical = forward
    .split("\n")
    .reduce<string[][]>((output, line) => {
      [...line].forEach((character, index) => {
        output[index] = [...(output[index] ?? []), character];
      });
      return output;
    }, [])
    .map((line) => line.join(""))
    .join("\n");

  const rightDiagonal = getDiagonal(forward);
  const leftDiagonal = getDiagonal(forward, "left");

  return {
    forward: forward,
    backward: reverseString(forward),
    vertical,
    verticalBackward: reverseString(vertical),
    rightDiagonal,
    rightDiagonalBackward: reverseString(rightDiagonal),
    leftDiagonal,
    leftDiagonalBackward: reverseString(leftDiagonal),
  };
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return Object.values(input).reduce(
    (sum, orientation) => sum + [...orientation.matchAll(/XMAS/g)].length,
    0,
  );
};

// TOO HIGH 1879
const part2 = (rawInput: string) => {
  const grid = rawInput.split("\n").map((line) => [...line]);
  const options: number[][][] = [
    [
      [-1, -1], // X00
      [0, 0], //   0X0
      [1, 1], //   00X
    ],
    [
      [1, -1], //  00X
      [0, 0], //   0X0
      [-1, 1], //  X00
    ],
  ];
  return grid.reduce((sum, line, lineIndex) => {
    return (
      sum +
      line.reduce((lineSum, character, characterIndex) => {
        if (character !== "A") return lineSum;
        const matches = options.every((option) => {
          const string = option
            .map(([x, y]) => grid[y + lineIndex]?.[x + characterIndex] ?? "")
            .join("");
          return string === "MAS" || string === "SAM";
        });
        return lineSum + (matches ? 1 : 0);
      }, 0)
    );
  }, 0);
};

const input = `MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 18,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 9,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
