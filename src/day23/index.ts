import run from "aocrunner";

const parseInput = (rawInput: string) =>
  rawInput.split("\n").map((line) => line.split("-"));

const getPairs = (inputs: string[][]) => {
  const pairs = new Map<string, Set<string>>();
  inputs.forEach((pair) => {
    pair.forEach((computer, index) => {
      const other = index === 0 ? pair[1] : pair[0];
      const lookup = pairs.get(computer) ?? new Set();
      lookup.add(other);
      pairs.set(computer, lookup);
    });
  });
  return pairs;
};

const getOptions = (
  sequence: string[],
  pairs: Map<string, Set<string>>,
  validSequences: Set<string>,
  length = 3,
) => {
  const nextPairs = pairs.get(sequence[sequence.length - 1])!;
  if (sequence.length >= length) {
    if (nextPairs.has(sequence[0])) {
      validSequences.add(sequence.sort().join("-"));
    }
    return;
  }
  nextPairs.forEach((pair) => {
    getOptions([...sequence, pair], pairs, validSequences, length);
  });
};

const part1 = (rawInput: string) => {
  const inputs = parseInput(rawInput);
  const pairs = getPairs(inputs);
  const validKeys = [...pairs.keys()].filter((key) => key.startsWith("t"));
  const triplets = new Set<string>();

  validKeys.forEach((key) => {
    getOptions([key], pairs, triplets);
  });
  return triplets.size;
};

const bronKerbosch = (
  r: Set<string>,
  p: Set<string>,
  x: Set<string>,
  pairs: Map<string, Set<string>>,
) => {
  if (p.size === 0 && x.size === 0) {
    return r;
  }

  let max = new Set();
  for (const v of p) {
    const candidate = bronKerbosch(
      r.union(new Set([v])),
      p.intersection(pairs.get(v)!),
      x.intersection(pairs.get(v)!),
      pairs,
    );
    if (candidate.size > max.size) max = candidate;

    p.delete(v);
    x.add(v);
  }
  return max;
};

const part2 = (rawInput: string) => {
  const inputs = parseInput(rawInput);
  const pairs = getPairs(inputs);

  const lanParty = bronKerbosch(
    new Set(),
    new Set(pairs.keys()),
    new Set(),
    pairs,
  );

  return [...lanParty.values()].sort().join(",");
};

const input = `kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 7,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: "co,de,ka,ta",
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
