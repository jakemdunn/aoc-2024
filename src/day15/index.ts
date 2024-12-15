import run from "aocrunner";

interface Point {
  x: number;
  y: number;
}

type Direction = "N" | "S" | "E" | "W";
type EntityType = "robot" | "box" | "wall";

interface Entity {
  type: EntityType;
  current: Point[];
  destination: Point[];
}

const EntitySymbols: Record<string, Entity["type"]> = {
  "#": "wall",
  O: "box",
  "@": "robot",
  "[": "box",
};
const DirectionSymbols: Record<string, Direction> = {
  "^": "N",
  v: "S",
  ">": "E",
  "<": "W",
};

const parseInput = (rawInput: string) => {
  const [rawGrid, rawMoves] = rawInput.split("\n\n");
  const boxes: Entity[] = [];
  let robot: Entity = {} as Entity;
  let previousBox: Entity;
  const grid = rawGrid.split("\n").map((line, y) =>
    line.split("").map<Entity | undefined>((symbol, x) => {
      if (symbol === ".") return undefined;
      if (symbol === "]") {
        previousBox?.current.push({ x, y });
        return previousBox;
      }
      const entity: Entity = {
        current: [{ x, y }],
        destination: [{ x, y }],
        type: EntitySymbols[symbol],
      };
      if (entity.type === "box") {
        previousBox = entity;
        boxes.push(entity);
      } else if (entity.type === "robot") {
        robot = entity;
      }
      return entity;
    }),
  );
  const moves = rawMoves
    .replace(/\n/g, "")
    .split("")
    .map((symbol) => DirectionSymbols[symbol]);

  const movement: Record<Direction, (source: Point) => Point> = {
    N: ({ x, y }) => ({ x, y: y - 1 }),
    S: ({ x, y }) => ({ x, y: y + 1 }),
    E: ({ x, y }) => ({ x: x + 1, y }),
    W: ({ x, y }) => ({ x: x - 1, y }),
  };
  const movements = (direction: Direction, sources: Point[]) =>
    sources.map((source) => movement[direction](source));

  moves.forEach((move) => {
    let moving: Entity[][] = [[robot]];
    let maxLoops = 10000;
    while (maxLoops-- > 0) {
      const currentGroup = moving[moving.length - 1];
      let nextGroup = new Set<Entity>();
      const blocked = currentGroup.some((entity) => {
        entity.destination = movements(move, entity.current);
        let nextPoints = entity.destination;
        if (move === "W") {
          nextPoints = [entity.destination[0]];
        } else if (move === "E") {
          nextPoints = [entity.destination[entity.destination.length - 1]];
        }
        return nextPoints.some(({ x, y }) => {
          let nextEntity = grid[y][x];
          if (nextEntity === undefined) {
            return false;
          }
          if (nextEntity?.type === "wall") {
            return true;
          }
          nextGroup.add(nextEntity);
          return false;
        });
      });
      if (blocked) return;
      if (nextGroup.size === 0) {
        moving.flat().forEach((entity) => {
          entity.current.forEach(({ x, y }) => {
            if (grid[y][x] === entity) {
              grid[y][x] = undefined;
            }
          });
          entity.current = entity.destination;
          entity.current.forEach(({ x, y }) => (grid[y][x] = entity));
        });
        // outputGrid();
        return;
      }
      moving.push([...nextGroup.values()]);
    }
  });
  return boxes.reduce(
    (sum, box) => sum + 100 * box.current[0].y + box.current[0].x,
    0,
  );
};

const part1 = (rawInput: string) => parseInput(rawInput);

const part2 = (rawInput: string) =>
  parseInput(
    rawInput
      .replace(/\#/g, "##")
      .replace(/O/g, "[]")
      .replace(/\./g, "..")
      .replace(/\@/g, "@."),
  );

const input = `##########
#..O..O.O#
#......O.#
#.OO..O.O#
#..O@..O.#
#O#..O...#
#O..O..O.#
#.OO.O.OO#
#....O...#
##########

<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 10092,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `#######
#...#.#
#.....#
#..OO@#
#..O..#
#.....#
#######

<vv<<^^<<^^`,
        expected: 618,
      },
      {
        input,
        expected: 9021,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
