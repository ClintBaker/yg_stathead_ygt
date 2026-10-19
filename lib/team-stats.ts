import type { Metric, PlayerRecord } from "./data";

export type TeamStats = Record<Metric, number> & {
  team: string;
  shots: number;
  players: PlayerRecord[];
};

// Input must contain one period only; season and stop records must never mix.
export function aggregateTeams(rows: PlayerRecord[]): TeamStats[] {
  if (new Set(rows.map((r) => r.period)).size > 1)
    throw new Error("Team totals require a single period.");
  const groups = new Map<string, TeamStats>();
  for (const row of rows) {
    const group = groups.get(row.team) ?? {
      team: row.team, shots: 0, total: 0, ott: 0, app: 0, arg: 0, putt: 0, players: [],
    };
    group.players.push(row);
    group.shots += row.shots;
    for (const key of ["total", "ott", "app", "arg", "putt"] as Metric[])
      group[key] += row[key];
    groups.set(row.team, group);
  }
  return [...groups.values()].map((group) => {
    for (const key of ["total", "ott", "app", "arg", "putt"] as Metric[])
      group[key] = Math.round(group[key] * 100) / 100;
    group.players.sort((a, b) => b.total - a.total);
    return group;
  }).sort((a, b) => b.total - a.total || a.team.localeCompare(b.team));
}
