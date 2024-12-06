import run from "aocrunner";

interface Guard {
  orientation: "n" | "s" | "e" | "w";
  x: number;
  y: number;
}

const parseInput = (rawInput: string) => {
  const grid = rawInput.split("\n").map((line) => line.split(""));
  const guardPosition = rawInput.indexOf("^");
  const guard: Guard = {
    orientation: "n",
    x: guardPosition % (grid[0].length + 1),
    y: Math.floor(guardPosition / (grid[0].length + 1)),
  };
  const nextStep: Record<Guard["orientation"], () => [number, number]> = {
    n: () => [guard.x, guard.y - 1],
    s: () => [guard.x, guard.y + 1],
    e: () => [guard.x + 1, guard.y],
    w: () => [guard.x - 1, guard.y],
  };
  const turn: Record<Guard["orientation"], Guard["orientation"]> = {
    n: "e",
    s: "w",
    e: "s",
    w: "n",
  };
  const history: Guard["orientation"][][][] = [...new Array(grid.length)].map(
    (_) => [...new Array(grid[0].length)].map((_) => []),
  );
  const runRoute = () => {
    while (
      guard.x >= 0 &&
      guard.x < grid[0].length &&
      guard.y >= 0 &&
      guard.y < grid.length
    ) {
      if (history[guard.y][guard.x].includes(guard.orientation)) {
        return false;
      }
      history[guard.y][guard.x].push(guard.orientation);
      grid[guard.y][guard.x] = "X";
      const [nextX, nextY] = nextStep[guard.orientation]();
      if (grid[nextY]?.[nextX] === "#") {
        guard.orientation = turn[guard.orientation];
      } else {
        guard.x = nextX;
        guard.y = nextY;
      }
    }
    return grid;
  };
  return {
    grid,
    guard,
    nextStep,
    turn,
    history,
    runRoute,
  };
};

const part1 = (rawInput: string) => {
  const { runRoute } = parseInput(rawInput);
  const grid = runRoute();
  if (!grid) {
    throw new Error("Unexpected loop");
  }
  const result = grid.map((line) => line.join("")).join("\n");
  return [...result.matchAll(/X/g)].length;
};

const part2 = (rawInput: string) => {
  let loops = 0;
  for (let index = 0; index < rawInput.length; index++) {
    const character = rawInput.charAt(index);
    if (["#", "^", "\n"].includes(character)) {
      continue;
    }
    const { runRoute } = parseInput(
      rawInput.substring(0, index) + "#" + rawInput.substring(index + 1),
    );
    if (runRoute() === false) {
      loops++;
    }
  }

  return loops;
};

const input = `....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 41,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 6,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
