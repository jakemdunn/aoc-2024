export interface Point {
  x: number;
  y: number;
}

export interface Node extends Point {
  neighbors?: Map<Node, number>;
  previous?: Node;
}

export const dijkstra = (
  graph: Map<string, Node>,
  startNode: Node,
  endNode?: Node,
) => {
  const distances = new Map<Node, number>();
  const remaining = new Set<Node>(graph.values());

  remaining.forEach((node) => distances.set(node, Infinity));
  distances.set(startNode, 0);

  while (remaining.size) {
    let currentNode: Node | undefined = undefined;
    let currentDistance = Infinity;

    remaining.forEach((node) => {
      if (distances.get(node)! < currentDistance) {
        currentNode = node;
        currentDistance = distances.get(node)!;
      }
    });

    if (!currentNode || currentNode === endNode) {
      break;
    }

    remaining.delete(currentNode);
    (currentNode as Node).neighbors?.forEach((localDistance, node) => {
      const distance = currentDistance + localDistance;
      if (distance < distances.get(node)!) {
        distances.set(node, distance);
        node.previous = currentNode;
      }
    });
  }

  return { distances };
};

export const getHistory = (node: Node) => {
  const history = new Set();
  while (node.previous) {
    history.add(node);
    node = node.previous;
  }
  return history;
};
