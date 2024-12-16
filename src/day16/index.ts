import run from "aocrunner";
import { memo } from "../utils/memo.js";

interface Point {
  x: number;
  y: number;
}

type Orientation = "N" | "S" | "E" | "W";
const orientations = ["N", "S", "E", "W"] as Orientation[];
interface Pose {
  orientation: Orientation;
  distance: number;
  node?: Node;
  previous?: Pose[];
}

type NodeType = "start" | "end" | "path" | "wall";
const nodeTypeSymbols: Record<string, NodeType> = {
  "#": "wall",
  ".": "path",
  S: "start",
  E: "end",
};
interface Node extends Point {
  type: NodeType;
}

const parseInput = (rawInput: string) => {
  let start = {} as Node,
    end = {} as Node;
  const grid = rawInput.split("\n").map((line, y) =>
    line.split("").map<Node>((symbol, x) => {
      const node: Node = {
        type: nodeTypeSymbols[symbol],
        x,
        y,
      };
      if (node.type === "start") start = node;
      if (node.type === "end") end = node;
      return node;
    }),
  );
  return { grid, start, end };
};

const dijkstra = (grid: Node[][], startNode: Node, endNode: Node) => {
  const distances = new Map<Node, Record<Orientation, Pose>>();
  const previousNodes = {};
  const visited = new Map<Node, Record<Orientation, boolean>>();
  const allNodes = grid.flat(1).filter(({ type }) => type !== "wall");

  const movement: Record<Orientation, (source: Point) => Point> = {
    N: ({ x, y }) => ({ x, y: y - 1 }),
    S: ({ x, y }) => ({ x, y: y + 1 }),
    E: ({ x, y }) => ({ x: x + 1, y }),
    W: ({ x, y }) => ({ x: x - 1, y }),
  };
  type Option = { node: Node; pose: Pose };
  const getOptions = (sourceNode: Node, sourcePose: Pose): Option[] => {
    return orientations.reduce<Option[]>((nodes, orientation) => {
      const { x, y } = movement[orientation](sourceNode);
      const node = grid[y]?.[x];
      if (node.type === "wall") return nodes;
      const distance =
        (["N", "S"].includes(sourcePose.orientation) &&
          ["E", "W"].includes(orientation)) ||
        (["E", "W"].includes(sourcePose.orientation) &&
          ["N", "S"].includes(orientation))
          ? 1001
          : 1;
      return [
        ...nodes,
        {
          node,
          pose: {
            distance,
            orientation,
          },
        },
      ];
    }, []);
  };

  allNodes.forEach((node) =>
    distances.set(
      node,
      orientations.reduce((result, orientation) => {
        return {
          ...result,
          [orientation]: { orientation, distance: Infinity },
        };
      }, {}) as Record<Orientation, Pose>,
    ),
  );
  distances.set(startNode, {
    ...distances.get(startNode)!,
    E: { orientation: "E", distance: 0 },
  });

  while (!visited.has(endNode)) {
    let currentNode: Node | undefined = undefined;
    let currentPose: Pose = { orientation: "E", distance: Infinity };

    allNodes.forEach((node) => {
      orientations.forEach((orientation) => {
        if (
          !visited.get(node)?.[orientation] &&
          distances.get(node)![orientation].distance < currentPose.distance
        ) {
          currentNode = node;
          currentPose = distances.get(node)![orientation];
        }
      });
    });

    if (!currentNode) {
      break;
    }

    visited.set(currentNode, {
      ...(visited.get(currentNode) ?? {}),
      [currentPose.orientation]: true,
    } as Record<Orientation, boolean>);

    const options = getOptions(currentNode, currentPose);
    options.forEach((option) => {
      const distance = currentPose.distance + option.pose.distance;
      const existingPose = distances.get(option.node)![option.pose.orientation];
      if (distance < existingPose.distance) {
        distances.set(option.node, {
          ...distances.get(option.node)!,
          [option.pose.orientation]: {
            ...option.pose,
            distance,
            node: currentNode,
            previous: [currentPose],
          },
        });
      } else if (distance === existingPose.distance) {
        distances.set(option.node, {
          ...distances.get(option.node)!,
          [option.pose.orientation]: {
            ...existingPose,
            previous: [...(existingPose.previous ?? []), currentPose],
          },
        });
      }
    });
  }

  return { distances, previousNodes };
};

const part1 = (rawInput: string) => {
  const { grid, start, end } = parseInput(rawInput);
  const { distances } = dijkstra(grid, start, end);
  return Object.values(distances.get(end)!).sort(
    (a, b) => a.distance - b.distance,
  )[0].distance;
};

const part2 = (rawInput: string) => {
  const { grid, start, end } = parseInput(rawInput);
  const { distances } = dijkstra(grid, start, end);
  const shortest = (poses: Record<Orientation, Pose>) => {
    return Object.values(poses).sort((a, b) => a.distance - b.distance)[0];
  };
  const endPose = shortest(distances.get(end)!);
  const poseHistory = new Set<Pose>();
  const nodeHistory = new Set<Node>();
  let currentPoses = [endPose];
  while (currentPoses.length) {
    currentPoses = currentPoses.reduce<Pose[]>((next, pose) => {
      nodeHistory.add(pose.node!);
      poseHistory.add(pose);
      // console.log(pose.previous?.length);
      return pose.previous ? [...next, ...pose.previous] : next;
    }, []);
  }
  // console.log(distances.get(grid[9][3]));
  // console.log(
  //   grid
  //     .map((line) =>
  //       line
  //         .map((node) => {
  //           // if (!nodeHistory.has(node)) {
  //           //   return node.type === "wall" ? "#--#" : "....";
  //           // }
  //           if (!distances.get(node)) {
  //             return node.type === "wall" ? "#---#" : ".....";
  //           }
  //           const pose = shortest(distances.get(node)!);
  //           if (pose.distance === Infinity) {
  //             return ".....";
  //           }
  //           // const pose = distances.get(node);
  //           // if (!pose || !endPose.history?.includes(node)) {
  //           //   return node.type === "wall" ? "#--#" : "....";
  //           // }
  //           return pose.orientation + pose.distance.toString().padStart(4, "0");
  //         })
  //         .join("|"),
  //     )
  //     .join("\n"),
  // );
  // console.log(endPose.history);
  return nodeHistory.size;
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
