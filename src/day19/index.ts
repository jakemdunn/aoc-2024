import run from "aocrunner";

const parseInput = (rawInput: string) => {
  const [rawPatterns, rawDesigns] = rawInput.split("\n\n");

  const patterns = rawPatterns.split(", ");
  const designs = rawDesigns.split("\n");

  return { patterns, designs };
};

const part1 = (rawInput: string) => {
  const { patterns, designs } = parseInput(rawInput);
  const regex = new RegExp(`^(${patterns.join("|")})+$`);
  return designs.filter((design) => design.match(regex)).length;
};

const part2 = (rawInput: string) => {
  const { patterns, designs } = parseInput(rawInput);

  return designs.reduce((sum, design) => {
    let matches = 0;
    const lookup = new Map<string, number>([["", 1]]);
    let currentOptions = new Set([...lookup.keys()]);
    while (currentOptions.size) {
      let next: string | undefined = undefined;
      let shortest = Infinity;
      currentOptions.forEach((option) => {
        if (option.length < shortest) {
          next = option;
          shortest = option.length;
        }
      });

      if (next === undefined) break;
      currentOptions.delete(next);

      patterns.forEach((pattern) => {
        const newOption = next + pattern;
        if (!design.startsWith(newOption)) {
          return;
        }
        const parentCount = lookup.get(next as string);
        if (design === newOption) {
          matches += parentCount ?? 1;
          return;
        }
        const existing = lookup.get(newOption);
        lookup.set(newOption, (existing ?? 0) + (parentCount ?? 1));
        currentOptions.add(newOption);
      });
    }
    return sum + matches;
  }, 0);
};

const input = `r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 6,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input,
      //   expected: 16,
      // },
      {
        input: `r, wr, b, g, bwu, rb, gb, br

rrbgbr`,
        expected: 6,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
