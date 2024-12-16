import run from "aocrunner";
import { memo } from "../utils/memo.js";

interface Point {
  x: number;
  y: number;
}

type Orientation = "N" | "S" | "E" | "W";
const orientations = ["N", "S", "E", "W"] as Orientation[];

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

interface Node extends Point {
  orientation: Orientation;
  options?: Map<Node, number>;
  history?: Node[];
}

const oppositeOrientation: Record<Orientation, Orientation> = {
  N: "S",
  S: "N",
  W: "E",
  E: "W",
};
const movement: Record<Orientation, (source: Point) => Point> = {
  N: ({ x, y }) => ({ x, y: y - 1 }),
  S: ({ x, y }) => ({ x, y: y + 1 }),
  E: ({ x, y }) => ({ x: x + 1, y }),
  W: ({ x, y }) => ({ x: x - 1, y }),
};

const dijkstra = (
  graph: Map<string, Node>,
  startNode: Node,
  endNodes: Node[],
) => {
  const distances = new Map<Node, number>();
  const visited = new Set<Node>();
  const allNodes = [...graph.values()];

  allNodes.forEach((node) => distances.set(node, Infinity));
  distances.set(startNode, 0);
  startNode.history = [startNode];

  while (!endNodes.some((node) => visited.has(node))) {
    let currentNode: Node | undefined = undefined;
    let currentDistance = Infinity;

    allNodes.forEach((node) => {
      if (!visited.has(node) && distances.get(node)! < currentDistance) {
        currentNode = node;
        currentDistance = distances.get(node)!;
      }
    });

    if (!currentNode) {
      break;
    }

    visited.add(currentNode as Node);
    (currentNode as Node).options?.forEach((localDistance, node) => {
      const distance = currentDistance + localDistance;
      if (distance < distances.get(node)!) {
        distances.set(node, distance);
        node.history = [...(currentNode?.history ?? []), node];
      } else if (distance === distances.get(node)!) {
        node.history = [
          ...(currentNode?.history ?? []),
          ...(node?.history ?? []),
          node,
        ];
      }
    });
  }

  const shortest = endNodes.sort(
    (a, b) => distances.get(a)! - distances.get(b)!,
  )[0];

  return { distances, shortest };
};

const parseInput = memo((rawInput: string) => {
  let startEntity = {} as Entity,
    endEntity = {} as Entity;
  const grid = rawInput.split("\n").map((line, y) =>
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

  const getKey = ({
    x,
    y,
    orientation,
  }: Pick<Node, "x" | "y" | "orientation">) => `${x},${y},${orientation}`;

  const graph = new Map<string, Node>();
  const getOptions = (sourceNode: Node) => {
    const newNodes: Node[] = [];
    sourceNode.options = orientations.reduce<Map<Node, number>>(
      (nodes, orientation) => {
        if (oppositeOrientation[sourceNode.orientation] === orientation)
          return nodes;
        const { x, y } = movement[orientation](sourceNode);
        const entity = grid[y]?.[x];
        if (entity.type === "wall") return nodes;
        const key = getKey({ x, y, orientation });
        const distance =
          (["N", "S"].includes(sourceNode.orientation) &&
            ["E", "W"].includes(orientation)) ||
          (["E", "W"].includes(sourceNode.orientation) &&
            ["N", "S"].includes(orientation))
            ? 1001
            : 1;
        if (!graph.has(key)) {
          graph.set(key, {
            x,
            y,
            orientation,
          });
          newNodes.push(graph.get(key)!);
        }
        nodes.set(graph.get(key)!, distance);
        return nodes;
      },
      new Map(),
    );
    return newNodes;
  };

  const startNode: Node = {
    ...startEntity,
    orientation: "E",
  };
  graph.set(getKey(startNode), startNode);

  let currentPaint: Node[] = [startNode];
  while (currentPaint.length > 0) {
    currentPaint = currentPaint.reduce<Node[]>((nextNodes, node) => {
      return [...nextNodes, ...getOptions(node)];
    }, []);
  }

  const endNodes = orientations.reduce<Node[]>(
    (nodes, orientation) => [
      ...nodes,
      graph.get(getKey({ ...endEntity, orientation }))!,
    ],
    [],
  );

  return { ...dijkstra(graph, startNode, endNodes), grid };
});

const part1 = (rawInput: string) => {
  const { distances, shortest } = parseInput(rawInput);
  return distances.get(shortest);
};

const part2 = (rawInput: string) => {
  const { shortest, grid } = parseInput(rawInput);
  return new Set(shortest.history?.map(({ x, y }) => grid[y][x])).size;
};

const input = `###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 7036,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 45,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
