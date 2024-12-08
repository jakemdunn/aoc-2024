import run from "aocrunner";

const parseInput = (rawInput: string) => {
  const grid = rawInput.split("\n");
  const nodes = grid.reduce<Record<string, { x: number; y: number }[]>>(
    (result, line, y) => {
      line.split("").forEach((symbol, x) => {
        if (symbol === ".") return;
        result[symbol] = [...(result[symbol] ?? []), { x, y }];
      });
      return result;
    },
    {},
  );

  return {
    nodes,
    inBounds: ({ x, y }: { x: number; y: number }) =>
      x > -1 && x < grid[0].length && y > -1 && y < grid.length,
  };
};

const part1 = (rawInput: string) => {
  const { nodes, inBounds } = parseInput(rawInput);

  const antinodes = Object.values(nodes).reduce<Record<string, true>>(
    (nodes, locations) => {
      locations.forEach((node, index) => {
        for (
          let siblingIndex = index + 1;
          siblingIndex < locations.length;
          siblingIndex++
        ) {
          const sibling = locations[siblingIndex];
          const difference = {
            x: sibling.x - node.x,
            y: sibling.y - node.y,
          };
          const options = [
            { x: sibling.x + difference.x, y: sibling.y + difference.y },
            { x: node.x - difference.x, y: node.y - difference.y },
          ];
          options.forEach((option) => {
            if (inBounds(option)) {
              nodes[`${option.x}-${option.y}`] = true;
            }
          });
        }
      });
      return nodes;
    },
    {},
  );

  return Object.values(antinodes).length;
};

const part2 = (rawInput: string) => {
  const { nodes, inBounds } = parseInput(rawInput);

  const antinodes = Object.values(nodes).reduce<Record<string, true>>(
    (nodes, locations) => {
      locations.forEach((node, index) => {
        for (
          let siblingIndex = index + 1;
          siblingIndex < locations.length;
          siblingIndex++
        ) {
          const sibling = locations[siblingIndex];
          const difference = {
            x: sibling.x - node.x,
            y: sibling.y - node.y,
          };
          let option = { ...node };
          while (inBounds(option)) {
            nodes[`${option.x}-${option.y}`] = true;
            option = { x: option.x - difference.x, y: option.y - difference.y };
          }
          option = { ...sibling };
          while (inBounds(option)) {
            nodes[`${option.x}-${option.y}`] = true;
            option = { x: option.x + difference.x, y: option.y + difference.y };
          }
        }
      });
      return nodes;
    },
    {},
  );

  return Object.values(antinodes).length;
};

const input = `............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 14,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 34,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
