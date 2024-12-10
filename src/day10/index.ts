import run from "aocrunner";

interface Point {
  x: number;
  y: number;
}

interface Result {
  peaks: number;
  trails: number;
}

const results: Map<string, Result> = new Map();

const parseInput = (rawInput: string) => {
  if (results.has(rawInput)) {
    return results.get(rawInput) as Result;
  }
  const trailheads: Point[] = [];
  const grid = rawInput.split("\n").map((line, y) =>
    line.split("").map((digit, x) => {
      if (digit === "0") {
        trailheads.push({ x, y });
      }
      return parseInt(digit);
    }),
  );

  const getOptions = (point: Point) => [
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
  ];

  const getElevation = ({ x, y }: Point) => grid[y]?.[x];
  const result = trailheads.reduce(
    (sums, trailhead) => {
      let paths = [trailhead];
      const peaks = new Set<string>();
      let trails = 0;
      while (paths.length) {
        paths = paths.reduce<Point[]>((updated, path) => {
          const elevation = getElevation(path);

          // console.log("path", path, elevation);
          getOptions(path).forEach((option) => {
            const optionElevation = getElevation(option);
            if (!optionElevation) return;
            if (optionElevation === elevation + 1) {
              if (optionElevation === 9) {
                peaks.add(`${option.x}-${option.y}`);
                trails++;
                return;
              }
              updated.push(option);
            }
          });
          return updated;
        }, []);
      }
      return {
        peaks: sums.peaks + peaks.size,
        trails: sums.trails + trails,
      };
    },
    { peaks: 0, trails: 0 },
  );

  results.set(rawInput, result);
  return result;
};

const part1 = (rawInput: string) => parseInput(rawInput).peaks;

const part2 = (rawInput: string) => parseInput(rawInput).trails;

const input = `89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 36,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `..90..9
...1.98
...2..7
6543456
765.987
876....
987....`,
        expected: 13,
      },
      {
        input: `012345
123456
234567
345678
4.6789
56789.`,
        expected: 227,
      },
      {
        input,
        expected: 81,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
