import run from "aocrunner";
import { memo } from "../utils/memo.js";

interface Point {
  x: number;
  y: number;
}

const getLineBounds = (items: number[]) =>
  items.reduce<{ in: number[]; out: number[] }>(
    (bounds, item, index) => {
      if (index === 0 && items.length === 1)
        return { in: [item], out: [item + 1] };
      if (index === 0) return { in: [item], out: [] };

      const prev = items[index - 1];
      if (item - prev > 1) {
        bounds.out = [...bounds.out, prev + 1];
        bounds.in = [...bounds.in, item];
      }
      if (index >= items.length - 1) {
        bounds.out = [...bounds.out, item + 1];
      }
      return bounds;
    },
    { in: [], out: [] },
  );

const getOptions = ({ x, y }: Point) => [
  { x, y: y - 1 },
  { x, y: y + 1 },
  { x: x - 1, y },
  { x: x + 1, y },
];

const parseInput = memo((rawInput: string) => {
  const grid = rawInput.split("\n").map((line) => line.split(""));
  const getGridValue = ({ x, y }: Point) => grid[y]?.[x];
  const measurements = grid.reduce<{ price: number; bulkPrice: number }>(
    (sums, line, y) => {
      line.forEach((character, x) => {
        if (character === character.toLowerCase()) return;
        let currentPoints = [{ x, y }];
        let perimiter = 0;
        let area = 0;
        const yPlot: Record<number, Record<number, true>> = {};
        const xPlot: Record<number, Record<number, true>> = {};
        while (currentPoints.length > 0) {
          currentPoints = currentPoints.reduce<Point[]>((newPoints, point) => {
            if (getGridValue(point) === character) {
              yPlot[point.y] = { ...yPlot[point.y], [point.x]: true };
              xPlot[point.x] = { ...xPlot[point.x], [point.y]: true };
              grid[point.y][point.x] = character.toLowerCase();
              area++;
              newPoints = newPoints.concat(getOptions(point));
            } else if (getGridValue(point) !== character.toLowerCase()) {
              perimiter++;
            }
            return newPoints;
          }, []);
        }
        const sides = [xPlot, yPlot].reduce((sideSum, plot) => {
          return (
            Object.values(plot).reduce<{
              previous: { in: number[]; out: number[] };
              sides: number;
            }>(
              ({ previous, sides }, line) => {
                const bounds = getLineBounds(
                  Object.keys(line).map((key) => parseInt(key)),
                );
                const newIns = bounds.in.filter(
                  (item) => !previous.in.includes(item),
                );
                const newOuts = bounds.out.filter(
                  (item) => !previous.out.includes(item),
                );
                return {
                  previous: bounds,
                  sides: sides + newIns.length + newOuts.length,
                };
              },
              { previous: { in: [], out: [] }, sides: 0 },
            ).sides + sideSum
          );
        }, 0);
        sums.price += perimiter * area;
        sums.bulkPrice += sides * area;
      });

      return sums;
    },
    { price: 0, bulkPrice: 0 },
  );

  return measurements;
});

const part1 = (rawInput: string) => {
  return parseInput(rawInput).price;
};

const part2 = (rawInput: string) => {
  return parseInput(rawInput).bulkPrice;
};

const input = `RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 1930,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 1206,
      },
      {
        input: `AAAA
BBCD
BBCC
EEEC`,
        expected: 80,
      },
      {
        input: `EEEEE
EXXXX
EEEEE
EXXXX
EEEEE`,
        expected: 236,
      },
      {
        input: `AAAAAA
AAABBA
AAABBA
ABBAAA
ABBAAA
AAAAAA`,
        expected: 368,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
