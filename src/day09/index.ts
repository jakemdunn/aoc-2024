import run from "aocrunner";

const parseInput = (rawInput: string) =>
  rawInput.split("").reduce<(undefined | number)[]>((blocks, digit, index) => {
    const id = index % 2 === 1 ? undefined : index / 2;
    return [...blocks, ...[...new Array(parseInt(digit))].map((_) => id)];
  }, []);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let checksum = 0;
  for (let index = 0; index < input.length; index++) {
    while (input[index] === undefined && index < input.length) {
      input[index] = input.pop();
    }
    checksum += index * (input[index] ?? 0);
  }
  return checksum;
};

const part2 = (rawInput: string) => {
  type Block = { id: number | undefined; size: number };
  const input = rawInput.split("").reduce<Block[]>((blocks, digit, index) => {
    const id = index % 2 === 1 ? undefined : index / 2;
    return [
      ...blocks,
      {
        id,
        size: parseInt(digit),
      },
    ];
  }, []);

  for (let index = input.length - 1; index > 0; index--) {
    const block = input[index];
    if (block.id === undefined) continue;
    for (let emptyIndex = 0; emptyIndex < index; emptyIndex++) {
      if (
        input[emptyIndex].id === undefined &&
        input[emptyIndex].size >= block.size
      ) {
        const available = input[emptyIndex];

        input[emptyIndex] = block;
        input[index] = { id: undefined, size: block.size };

        if (block.size < available.size) {
          input.splice(emptyIndex + 1, 0, {
            id: undefined,
            size: available.size - block.size,
          });
          index++;
        }
        break;
      }
    }
  }
  const result = input.reduce<(number | undefined)[]>((parsed, block) => {
    return [...parsed, ...[...new Array(block.size)].map((_) => block.id)];
  }, []);

  return result.reduce<number>(
    (checksum, id, index) => checksum + index * (id ?? 0),
    0,
  );
};

const input = `2333133121414131402`;

run({
  part1: {
    tests: [
      {
        input,
        expected: 1928,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 2858,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
