import run from "aocrunner";

interface Point {
  x: number;
  y: number;
}

const parseInput = (rawInput: string) => {
  const rawDimensions = rawInput.match(/(\d+)x(\d)\n\n/);
  let dimensions = { width: 101, height: 103 };
  if (rawDimensions) {
    rawInput = rawInput.replace(rawDimensions[0], "");
    dimensions = {
      width: parseInt(rawDimensions[1]),
      height: parseInt(rawDimensions[2]),
    };
  }
  const robots = rawInput.split("\n").map((rawRobot) => {
    const parsed = rawRobot.match(/p=(\d+),(\d+) v=([\d\-]+),([\d\-]+)/);
    return {
      position: {
        x: parseInt(parsed![1]),
        y: parseInt(parsed![2]),
      },
      velocity: {
        x: parseInt(parsed![3]),
        y: parseInt(parsed![4]),
      },
      origin: {
        x: parseInt(parsed![1]),
        y: parseInt(parsed![2]),
      },
    };
  });
  return { robots, dimensions };
};

type QuadrantCounts = {
  NW: number;
  NE: number;
  SE: number;
  SW: number;
};

// TOO LOW: 6511
const part1 = (rawInput: string) => {
  const seconds = 100;
  const {
    robots,
    dimensions: { width, height },
  } = parseInput(rawInput);

  const wrapped = (offset: number, bounds: number) => {
    const bounded = offset % bounds;
    return bounded >= 0 ? bounded : bounds + bounded;
  };
  const deadZone = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  const quadrantCounts = robots.reduce<QuadrantCounts>(
    (counts, robot) => {
      robot.position = {
        x: wrapped(robot.position.x + robot.velocity.x * seconds, width),
        y: wrapped(robot.position.y + robot.velocity.y * seconds, height),
      };
      if (robot.position.x === deadZone.x || robot.position.y === deadZone.y) {
        return counts;
      }
      const vertical = robot.position.y > deadZone.y ? "S" : "N";
      const horizontal = robot.position.x > deadZone.x ? "E" : "W";
      counts[`${vertical}${horizontal}`]++;
      return counts;
    },
    { NW: 0, NE: 0, SE: 0, SW: 0 },
  );

  return Object.values(quadrantCounts).reduce((sum, count) => sum * count);
};

const part2 = (rawInput: string) => {
  const {
    robots,
    dimensions: { width, height },
  } = parseInput(rawInput);

  const wrapped = (offset: number, bounds: number) => {
    const bounded = offset % bounds;
    return bounded >= 0 ? bounded : bounds + bounded;
  };
  const runRobots = (seconds: number) => {
    robots.forEach((robot) => {
      robot.position = {
        x: wrapped(robot.position.x + robot.velocity.x * seconds, width),
        y: wrapped(robot.position.y + robot.velocity.y * seconds, height),
      };
    });
  };
  const getGrid = () => {
    const grid = [...Array(height)].map((_, y) =>
      [...Array(width)].map(
        (_, x) =>
          robots.filter(
            (robot) => robot.position.x === x && robot.position.y === y,
          ).length || ".",
      ),
    );
    return grid.map((line) => line.join("")).join("\n");
  };

  let prevIndex = 0;
  for (let index = 6511; index < 10000; index++) {
    runRobots(index - prevIndex);
    prevIndex = index;
    const grid = getGrid();
    if (grid.match(/1{10}/)) {
      console.log(grid);
      return index;
    }
  }

  return 0;
};

const input = `11x7

p=0,4 v=3,-3
p=6,3 v=-1,-3
p=10,3 v=-1,2
p=2,0 v=2,-1
p=0,0 v=1,3
p=3,0 v=-2,-2
p=7,6 v=-1,-3
p=3,0 v=-1,-2
p=9,3 v=2,3
p=7,3 v=-1,2
p=2,4 v=2,-3
p=9,5 v=-3,-3`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 12,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
