import run from "aocrunner";

interface Point {
  x: number;
  y: number;
}

interface Node extends Point {
  options?: Map<Node, number>;
  history?: Node[];
}

const dijkstra = (graph: Map<string, Node>, startNode: Node, endNode: Node) => {
  const distances = new Map<Node, number>();
  const visited = new Set<Node>();
  const allNodes = [...graph.values()];

  allNodes.forEach((node) => distances.set(node, Infinity));
  distances.set(startNode, 0);
  startNode.history = [startNode];

  while (!visited.has(endNode)) {
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
      }
    });
  }

  return { distances };
};

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
    sourceNode.options = movements.reduce<Map<Node, number>>(
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

  const remainingBytes = bytes.slice(nanoseconds).map(getKey);
  let corruptedByteKey = getKey(bytes[0]);
  while (remainingBytes.length) {
    const { distances } = dijkstra(graph, startNode, endNode);
    if (distances.get(endNode) === Infinity) {
      return corruptedByteKey;
    }

    const blockers = endNode
      .history!.filter((node) => remainingBytes.includes(getKey(node)))
      .map(getKey);

    do {
      corruptedByteKey = remainingBytes.shift()!;

      const corruptedNode = graph.get(corruptedByteKey);
      if (!corruptedNode) continue;

      graph.delete(corruptedByteKey);
      movements.forEach((movement) => {
        const adjacentKey = getKey(movement(corruptedNode));
        graph.get(adjacentKey)?.options?.delete(corruptedNode);
      });
    } while (!blockers.includes(corruptedByteKey) && remainingBytes.length);
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
