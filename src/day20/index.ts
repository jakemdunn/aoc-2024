import run from "aocrunner";
import { Point, Node, dijkstra } from "../utils/dijkstra.js";

type EntityType = "start" | "end" | "path" | "wall";
const entityTypeSymbols: Record<string, EntityType> = {
  "#": "wall",
  ".": "path",
  S: "start",
  E: "end",
};
interface Entity extends Point {
  type: EntityType;
}
type Orientation = "N" | "S" | "E" | "W";
const orientations = ["N", "S", "E", "W"] as Orientation[];

const movement: Record<Orientation, (source: Point, offset?: number) => Point> =
  {
    N: ({ x, y }, offset = 1) => ({ x, y: y - offset }),
    S: ({ x, y }, offset = 1) => ({ x, y: y + offset }),
    E: ({ x, y }, offset = 1) => ({ x: x + offset, y }),
    W: ({ x, y }, offset = 1) => ({ x: x - offset, y }),
  };
const getKey = ({ x, y }: Point) => `${x},${y}`;

const parseInput = (rawInput: string) => {
  const rawParts = rawInput.split("\n\n");
  const savings =
    rawParts.length > 1
      ? parseInt(rawParts.shift()!.replace(/[^\d]*/, ""))
      : 99;
  let startEntity = {} as Entity,
    endEntity = {} as Entity;
  const grid = rawParts[0].split("\n").map((line, y) =>
    line.split("").map<Entity>((symbol, x) => {
      const node: Entity = {
        type: entityTypeSymbols[symbol],
        x,
        y,
      };
      if (node.type === "start") startEntity = node;
      if (node.type === "end") endEntity = node;
      return node;
    }),
  );

  const graph = new Map<string, Node>();
  const getOptions = (sourceNode: Node) => {
    const newNodes: Node[] = [];
    sourceNode.neighbors = orientations.reduce<Map<Node, number>>(
      (nodes, orientation) => {
        const { x, y } = movement[orientation](sourceNode);
        const entity = grid[y]?.[x];
        if (entity.type === "wall") return nodes;
        const key = getKey({ x, y });
        if (!graph.has(key)) {
          graph.set(key, {
            x,
            y,
          });
          newNodes.push(graph.get(key)!);
        }
        nodes.set(graph.get(key)!, 1);
        return nodes;
      },
      new Map(),
    );
    return newNodes;
  };

  const startNode: Node = {
    ...startEntity,
  };
  graph.set(getKey(startNode), startNode);

  let currentPaint: Node[] = [startNode];
  while (currentPaint.length > 0) {
    currentPaint = currentPaint.reduce<Node[]>((nextNodes, node) => {
      return [...nextNodes, ...getOptions(node)];
    }, []);
  }

  return {
    grid,
    graph,
    savings,
    startNode,
    endNode: graph.get(getKey(endEntity))!,
  };
};

const part1 = (rawInput: string) => {
  const { savings, grid, graph, endNode } = parseInput(rawInput);
  const { distances } = dijkstra(graph, endNode);
  let shortcuts = 0;
  graph.forEach((node) => {
    orientations.forEach((orientation) => {
      const near = movement[orientation](node);
      const nearEntity = grid[near.y]?.[near.x];
      if (nearEntity?.type !== "wall") return;

      const far = movement[orientation](node, 2);
      const farEntity = grid[far.y]?.[far.x];
      if (!farEntity || farEntity.type === "wall") return;

      const difference =
        distances.get(graph.get(getKey(farEntity))!)! -
        distances.get(node)! -
        2;

      if (difference > savings) {
        shortcuts++;
      }
    });
  });

  return shortcuts;
};

const cheatZone = [...new Array(41)]
  .map((_, y) => {
    const offsetY = y - 20;
    const offsetX = 20 - Math.abs(offsetY);
    return [...new Array((20 - Math.abs(offsetY)) * 2 + 1)].map<Point>(
      (_, x) => ({ x: x - offsetX, y: offsetY }),
    );
  })
  .flat()
  .filter((point) => Math.abs(point.x) > 1 || Math.abs(point.y) > 1);

const part2 = (rawInput: string) => {
  const { savings, grid, graph, endNode } = parseInput(rawInput);
  const { distances } = dijkstra(graph, endNode);
  let shortcuts = 0;
  graph.forEach((node) => {
    cheatZone.forEach((offset) => {
      const farEntity = grid[offset.y + node.y]?.[offset.x + node.x];
      if (!farEntity || farEntity.type === "wall") return;

      const difference =
        distances.get(graph.get(getKey(farEntity))!)! -
        distances.get(node)! -
        (Math.abs(offset.x) + Math.abs(offset.y));

      if (difference > savings) {
        shortcuts++;
      }
    });
  });

  return shortcuts;
};

const input = `###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############`;

run({
  part1: {
    tests: [
      {
        input: ">2\n\n" + input,
        expected: 30,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: ">49\n\n" + input,
        expected: 285,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
