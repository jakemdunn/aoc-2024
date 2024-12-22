import run from "aocrunner";
import { Point } from "../utils/dijkstra.js";
import { memo } from "../utils/memo.js";

const parseInput = (rawInput: string) =>
  rawInput.split(`\n`).map((line) => line.split(""));

const grids: Record<"keypad" | "controls", Record<string, Point>> = {
  // +---+---+---+
  // | 7 | 8 | 9 |
  // +---+---+---+
  // | 4 | 5 | 6 |
  // +---+---+---+
  // | 1 | 2 | 3 |
  // +---+---+---+
  //     | 0 | A |
  //     +---+---+
  keypad: {
    "7": { x: 0, y: 0 },
    "8": { x: 1, y: 0 },
    "9": { x: 2, y: 0 },
    "4": { x: 0, y: 1 },
    "5": { x: 1, y: 1 },
    "6": { x: 2, y: 1 },
    "1": { x: 0, y: 2 },
    "2": { x: 1, y: 2 },
    "3": { x: 2, y: 2 },
    "0": { x: 1, y: 3 },
    A: { x: 2, y: 3 },
  },

  //     +---+---+
  //     | ^ | A |
  // +---+---+---+
  // | < | v | > |
  // +---+---+---+
  controls: {
    "^": { x: 1, y: 0 },
    A: { x: 2, y: 0 },
    "<": { x: 0, y: 1 },
    v: { x: 1, y: 1 },
    ">": { x: 2, y: 1 },
  },
} as const;

type Grid = keyof typeof grids;
interface Robot extends Point {
  grid: Grid;
  levels: number;
}
interface Step {
  robot: Robot;
  value: string[];
}
interface StepResult {
  robot: Robot;
  value: bigint;
}

const getRobot = (levels: number, grid: Grid = "controls"): Robot => ({
  ...grids[grid].A,
  grid,
  levels,
});

const getInputsToTarget = memo((target: Point, robot: Robot): StepResult => {
  const diff = {
    x: target.x - robot.x,
    y: target.y - robot.y,
  };
  const xInputs = [...new Array(Math.abs(diff.x))].map((_) =>
    diff.x > 0 ? ">" : "<",
  );
  const yInputs = [...new Array(Math.abs(diff.y))].map((_) =>
    diff.y > 0 ? "v" : "^",
  );

  let options: Step[] = [];
  if (!xInputs.length || !yInputs.length) {
    options.push({ value: [...yInputs, ...xInputs, "A"], robot });
  } else {
    if (robot.y === grids[robot.grid]["A"].y && target.x === 0) {
      options.push({ value: [...yInputs, ...xInputs, "A"], robot });
    } else if (robot.x === 0 && target.y === grids[robot.grid]["A"].y) {
      options.push({ value: [...xInputs, ...yInputs, "A"], robot });
    } else {
      options = [
        { value: [...yInputs, ...xInputs, "A"], robot },
        { value: [...xInputs, ...yInputs, "A"], robot },
      ];
    }
  }

  if (robot.levels > 0) {
    const results = options.map((option) =>
      getSequence({
        value: option.value,
        robot: getRobot(robot.levels - 1),
      }),
    );

    let shortest: StepResult = results[0];
    for (let index = 1; index < results.length; index++) {
      const step = results[index];
      if (!shortest || step.value < shortest.value) {
        shortest = step;
      }
    }

    return {
      value: shortest.value,
      robot: {
        ...robot,
        ...target,
        levels: robot.levels,
      },
    } as StepResult;
  }

  return {
    value: BigInt(options[0].value.length),
    robot: {
      ...robot,
      ...target,
      levels: robot.levels,
    },
  } as StepResult;
});

const getSequence = ({ value, robot }: Step): StepResult =>
  value.reduce<StepResult>(
    (accumulated, target) => {
      const targetPoint = grids[accumulated.robot.grid][target];
      const step = getInputsToTarget(targetPoint, accumulated.robot);
      return {
        value: accumulated.value + step.value,
        robot: step.robot,
      };
    },
    { value: 0n, robot },
  );

const calculateEndInput = (codes: string[][], levels = 2) => {
  return codes
    .reduce((sum, code) => {
      const robot = getRobot(levels, "keypad");
      const { value } = getSequence({ value: code, robot });
      const complexity = value * BigInt(code.join("").replace(/[^\d]*/g, ""));
      return sum + complexity;
    }, 0n)
    .toString();
};

const part1 = (rawInput: string) => {
  const codes = parseInput(rawInput);
  return calculateEndInput(codes);
};

const part2 = (rawInput: string) => {
  const codes = parseInput(rawInput);
  return calculateEndInput(codes, 25);
};

const input = `029A
980A
179A
456A
379A`;

run({
  part1: {
    tests: [
      {
        input,
        expected: "126384",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: "154115708116294",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
