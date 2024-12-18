import run from "aocrunner";
import { Point, Node, dijkstra, getHistory } from "../utils/dijkstra.js";

const parseInput = (rawInput: string) => {
  const parts = rawInput.split("\n\n");

  const [width, height, nanoseconds] =
    parts.length === 2
      ? parts[0].split("x").map((symbol) => parseInt(symbol))
      : [70, 70, 1024];
  const bytes = parts
    .pop()!
    .split("\n")
    .map((line) => {
      const [x, y] = line.split(",").map((symbol) => parseInt(symbol));
      return { x, y };
    });
  return { width, height, bytes, nanoseconds };
};

const movements: ((source: Point) => Point)[] = [
  ({ x, y }) => ({ x, y: y - 1 }),
  ({ x, y }) => ({ x, y: y + 1 }),
  ({ x, y }) => ({ x: x + 1, y }),
  ({ x, y }) => ({ x: x - 1, y }),
];

const getKey = ({ x, y }: Point) => `${x},${y}`;
const createGraph = (width: number, height: number, bytes: Point[]) => {
  const corrupted = new Set(bytes.map(getKey));
  const graph = new Map<string, Node>();
  const getOptions = (sourceNode: Node) => {
    const newNodes: Node[] = [];
    sourceNode.neighbors = movements.reduce<Map<Node, number>>(
      (nodes, movement) => {
        const { x, y } = movement(sourceNode);
        const key = getKey({ x, y });
        if (x < 0 || x > width || y < 0 || y > height || corrupted.has(key))
          return nodes;
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
    x: 0,
    y: 0,
  };
  graph.set(getKey(startNode), startNode);

  let currentPaint: Node[] = [startNode];
  while (currentPaint.length > 0) {
    currentPaint = currentPaint.reduce<Node[]>((nextNodes, node) => {
      return [...nextNodes, ...getOptions(node)];
    }, []);
  }
  const endNode = graph.get(getKey({ x: width, y: height }))!;

  return { graph, startNode, endNode };
};

const part1 = (rawInput: string) => {
  const { width, height, bytes, nanoseconds } = parseInput(rawInput);
  const { graph, startNode, endNode } = createGraph(
    width,
    height,
    bytes.slice(0, nanoseconds),
  );
  const { distances } = dijkstra(graph, startNode, endNode);
  return distances.get(endNode);
};

const part2 = (rawInput: string) => {
  const { width, height, bytes, nanoseconds } = parseInput(rawInput);
  const { graph, startNode, endNode } = createGraph(
    width,
    height,
    bytes.slice(0, nanoseconds),
  );
  dijkstra(graph, startNode, endNode);
  let history = getHistory(endNode);

  const remainingBytes = bytes.slice(nanoseconds).map(getKey);
  for (let index = 0; index < remainingBytes.length; index++) {
    const corruptedByteKey = remainingBytes[index];
    const corruptedNode = graph.get(corruptedByteKey);

    if (!corruptedNode) continue;

    graph.delete(corruptedByteKey);
    movements.forEach((movement) => {
      const adjacentKey = getKey(movement(corruptedNode));
      graph.get(adjacentKey)?.neighbors?.delete(corruptedNode);
    });

    if (history.has(corruptedNode)) {
      const { distances } = dijkstra(graph, startNode, endNode);
      if (distances.get(endNode) === Infinity) {
        return corruptedByteKey;
      }
      history = getHistory(endNode);
    }
  }

  return;
};

const input = `6x6x12

5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 22,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: "6,1",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
