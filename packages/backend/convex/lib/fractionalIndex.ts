export function buildRank(index: number): string {
  return `r${String(index).padStart(6, "0")}`;
}

export function buildRanks(count: number): string[] {
  return Array.from({ length: count }, (_, index) => buildRank(index + 1));
}
