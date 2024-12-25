export const bronKerbosch = (
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
