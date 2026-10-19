import snapshot from "@/data/ygt.json";

export type Metric = "total" | "ott" | "app" | "arg" | "putt";
export type Period = "Season" | "Pursell Farms" | "Rams Hill";
export type PlayerRecord = {
  player: string;
  team: string;
  role: string;
  period: string;
  rank: string;
  shots: number;
  total: number;
  ott: number;
  app: number;
  arg: number;
  putt: number;
  teeShots: number;
  approachShots: number;
  aroundGreenShots: number;
  putts: number;
  source: string;
};
export const records: PlayerRecord[] = snapshot;
export const periods: Period[] = ["Season", "Pursell Farms", "Rams Hill"];
export const metrics: {
  key: Metric;
  label: string;
  short: string;
  color: string;
}[] = [
  { key: "total", label: "Total SG", short: "Total", color: "#32634d" },
  { key: "ott", label: "Off the tee", short: "OTT", color: "#4e907a" },
  { key: "app", label: "Approach", short: "APP", color: "#32634d" },
  { key: "arg", label: "Around the green", short: "ARG", color: "#b96c2d" },
  { key: "putt", label: "Putting", short: "PUTT", color: "#8064bb" },
];
export const teamColors: Record<string, string> = {
  "Team Wesley": "#32634d",
  "Team Brad": "#547f96",
  "Team George": "#8064bb",
  "Team Grant": "#b96c2d",
};
export const signed = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
export const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
export const asOf = "October 19, 2026";

export function makeCsv(rows: PlayerRecord[]) {
  const headers = [
    "Player",
    "Team",
    "Role",
    "Period",
    "Shots",
    "Total SG",
    "Off the tee",
    "Approach",
    "Around the green",
    "Putting",
    "Source",
  ];
  const escape = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`;
  return [
    headers,
    ...rows.map((r) => [
      r.player,
      r.team,
      r.role,
      r.period,
      r.shots,
      r.total,
      r.ott,
      r.app,
      r.arg,
      r.putt,
      r.source,
    ]),
  ]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}
