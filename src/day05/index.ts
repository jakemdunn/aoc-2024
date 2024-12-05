import run from "aocrunner";

interface RuleLookup {
  regexes: RegExp[];
  siblings: Record<string, number>;
}

const parseInput = (rawInput: string) => {
  const [rawRules, rawInstructions] = rawInput.split("\n\n");
  const rules = rawRules.split("\n").map((line) => line.split("|"));
  const instructions = rawInstructions.split("\n");
  const addLookup = (
    lookup: Record<string, RuleLookup>,
    part: string,
    sibling: string,
    siblingOrder: number,
    regex: RegExp,
  ) => {
    lookup[part] = {
      regexes: [...(lookup[part]?.regexes ?? []), regex],
      siblings: {
        ...lookup[part]?.siblings,
        [sibling]: siblingOrder,
      },
    };
  };
  const ruleLookup = rules.reduce<Record<string, RuleLookup>>(
    (lookup, rule) => {
      const regex = new RegExp(String.raw`${rule[1]}.*${rule[0]}`);
      addLookup(lookup, rule[0], rule[1], -1, regex);
      addLookup(lookup, rule[1], rule[0], 1, regex);
      return lookup;
    },
    {},
  );

  return {
    rules,
    ruleLookup,
    instructions,
  };
};

const part1 = (rawInput: string) => {
  const { ruleLookup, instructions } = parseInput(rawInput);

  return instructions.reduce((sum, instruction) => {
    const parts = instruction.split(",");
    const invalid = parts.some((part) =>
      ruleLookup[part]?.regexes.some(
        (regex) => instruction.match(regex) !== null,
      ),
    );
    return sum + (invalid ? 0 : parseInt(parts[Math.floor(parts.length / 2)]));
  }, 0);
};

const part2 = (rawInput: string) => {
  const { ruleLookup, instructions } = parseInput(rawInput);

  return instructions.reduce((sum, instruction) => {
    const parts = instruction.split(",");
    const invalid = parts.some((part) =>
      ruleLookup[part]?.regexes.some(
        (regex) => instruction.match(regex) !== null,
      ),
    );
    if (!invalid) {
      return sum;
    }
    const corrected = parts.sort(
      (a, b) =>
        (ruleLookup[a]?.siblings[b] ?? 0) - (ruleLookup[b]?.siblings[a] ?? 0),
    );
    return sum + parseInt(corrected[Math.floor(corrected.length / 2)]);
  }, 0);
};

const input = `47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 143,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 123,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
