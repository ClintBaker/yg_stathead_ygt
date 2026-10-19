"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Flag,
  GitCompareArrows,
  Grid2X2,
  Link2,
  Maximize2,
  Minimize2,
  Search,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  asOf,
  initials,
  makeCsv,
  metrics,
  periods,
  records,
  signed,
  teamColors,
  type Metric,
  type Period,
  type PlayerRecord,
} from "@/lib/data";

type View = "leaderboard" | "matrix" | "compare";
const comparisonColors = ["#d5ef94", "#a2c7e9", "#d4adcf"];

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("Season");
  const [metric, setMetric] = useState<Metric>("total");
  const [team, setTeam] = useState("All teams");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("leaderboard");
  const [includeWildcards, setIncludeWildcards] = useState(true);
  const [focused, setFocused] = useState("Sean Walsh");
  const [selected, setSelected] = useState([
    "Sean Walsh",
    "Brad Dalke",
    "Wesley Bryan",
  ]);
  const [presentation, setPresentation] = useState(false);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (periods.includes(p.get("period") as Period))
      setPeriod(p.get("period") as Period);
    if (metrics.some((m) => m.key === p.get("metric")))
      setMetric(p.get("metric") as Metric);
    if (["leaderboard", "matrix", "compare"].includes(p.get("view") ?? ""))
      setView(p.get("view") as View);
    if (["All teams", ...Object.keys(teamColors)].includes(p.get("team") ?? ""))
      setTeam(p.get("team")!);
    if (p.has("players"))
      setSelected(
        p
          .get("players")!
          .split(",")
          .filter((n) => records.some((r) => r.player === n))
          .slice(0, 3),
      );
    if (p.has("q")) setQuery(p.get("q")!);
    if (p.get("wildcards") === "false") setIncludeWildcards(false);
    if (p.get("present") === "true") setPresentation(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams({
      period,
      metric,
      view,
      team,
      players: selected.join(","),
      wildcards: String(includeWildcards),
    });
    if (query) params.set("q", query);
    if (presentation) params.set("present", "true");
    window.history.replaceState(null, "", `?${params}`);
  }, [
    ready,
    period,
    metric,
    view,
    team,
    selected,
    includeWildcards,
    query,
    presentation,
  ]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPresentation(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const field = useMemo(
    () => records.filter((r) => r.period === period),
    [period],
  );
  const filtered = useMemo(
    () =>
      field
        .filter(
          (r) =>
            (team === "All teams" || r.team === team) &&
            (!query || r.player.toLowerCase().includes(query.toLowerCase())) &&
            (includeWildcards || r.role !== "Wildcard"),
        )
        .sort(
          (a, b) => b[metric] - a[metric] || a.player.localeCompare(b.player),
        ),
    [field, team, query, includeWildcards, metric],
  );
  const active = filtered.find((r) => r.player === focused) ?? filtered[0];
  const comparison = selected
    .map((name) => field.find((r) => r.player === name))
    .filter((r): r is PlayerRecord => Boolean(r));
  const metricLabel = metrics.find((m) => m.key === metric)!.label;
  const best = (key: Metric) =>
    [...filtered].sort((a, b) => b[key] - a[key])[0];
  const chartData = metrics
    .slice(1)
    .map((m) => ({
      category: m.label,
      ...Object.fromEntries(comparison.map((r) => [r.player, r[m.key]])),
    }));

  function togglePlayer(name: string) {
    const available = selected.filter((n) => field.some((r) => r.player === n));
    if (available.includes(name))
      setSelected(available.filter((n) => n !== name));
    else if (available.length < 3) setSelected([...available, name]);
    else setNotice("Choose up to three players. Remove one to add another.");
  }

  function downloadCsv() {
    const url = URL.createObjectURL(
      new Blob([makeCsv(filtered)], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ygt-${period.toLowerCase().replaceAll(" ", "-")}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("View link copied.");
    } catch {
      setNotice("Copy the URL from your address bar to share this view.");
    }
  }

  return (
    <main className={presentation ? "app presentation" : "app"}>
      <a href="#explorer" className="skip-link">
        Skip to explorer
      </a>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Stathead YGT home">
          <span className="brand-icon">
            <Flag size={19} />
          </span>
          STATHEAD
          <span className="brand-divider" />{" "}
          <span className="brand-tour">YGT</span>
        </a>
        <span className="topbar-caption">INDEPENDENT GOLF ANALYTICS</span>
        <div className="header-actions">
          <button className="button subtle" onClick={share}>
            <Link2 size={15} />
            <span>Share view</span>
          </button>
          <button
            className="button"
            onClick={() => setPresentation(!presentation)}
          >
            {presentation ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{presentation ? "Exit presentation" : "Present"}</span>
          </button>
        </div>
      </header>

      <div className="page-content">
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              SEASON 01 <span>/</span> STROKES GAINED
            </div>
            <h1>
              Your Golf Tour
              <span className="heading-muted">. By the numbers.</span>
            </h1>
            <p>
              Explore the field. Find the strengths. Compare every part of the
              game.
            </p>
          </div>
          <div className="snapshot">
            <span>DATA SNAPSHOT</span>
            <strong>{asOf}</strong>
            <small>2 stops · 24 players</small>
          </div>
        </section>

        <section className="toolbar" aria-label="Dashboard filters">
          <div className="period-control" role="group" aria-label="Stop">
            {periods.map((p) => (
              <button
                key={p}
                aria-pressed={period === p}
                className={period === p ? "selected" : ""}
                onClick={() => setPeriod(p)}
              >
                {p === "Season" ? "All stops" : p}
              </button>
            ))}
          </div>
          <div className="filter-right">
            <label className="select-wrap">
              <span className="sr-only">Team</span>
              <span
                className="team-dot"
                style={{ background: teamColors[team] ?? "#8f9d92" }}
              />
              <select aria-label="Team" value={team} onChange={(e) => setTeam(e.target.value)}>
                <option>All teams</option>
                {Object.keys(teamColors).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
            <label className="search">
              <Search size={15} />
              <span className="sr-only">Search players</span>
              <input
                placeholder="Find a player…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </label>
          </div>
        </section>

        <section
          className="summary-grid"
          aria-label="Category leaders in filtered field"
        >
          {(["total", "ott", "app", "putt"] as Metric[]).map((key, i) => {
            const leader = best(key);
            return (
              <button
                key={key}
                className={`summary-card ${i === 0 ? "featured" : ""}`}
                onClick={() => {
                  setMetric(key);
                  setView("leaderboard");
                  if (leader) setFocused(leader.player);
                }}
              >
                <span className="card-kicker">
                  {
                    [
                      "TOTAL SG LEADER",
                      "BEST OFF THE TEE",
                      "BEST APPROACH",
                      "BEST PUTTING",
                    ][i]
                  }
                  <ArrowUpRight size={15} />
                </span>
                <div className="card-stat">
                  {leader ? signed(leader[key]) : "—"}
                  <span>SG</span>
                </div>
                <div className="card-bottom">
                  <span>{leader?.player ?? "No matching players"}</span>
                  {leader && (
                    <span
                      className="mini-team"
                      style={{ background: teamColors[leader.team] }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </section>

        <section id="explorer" className="explorer">
          <div className="explorer-top">
            <div className="view-tabs" role="group" aria-label="Chart view">
              {(
                [
                  { id: "leaderboard", name: "Leaderboard", Icon: BarChart3 },
                  { id: "matrix", name: "Category matrix", Icon: Grid2X2 },
                  {
                    id: "compare",
                    name: "Compare players",
                    Icon: GitCompareArrows,
                  },
                ] as const
              ).map(({ id, name, Icon }) => (
                <button
                  key={id}
                  aria-pressed={view === id}
                  className={view === id ? "active" : ""}
                  onClick={() => setView(id)}
                >
                  <Icon size={16} />
                  {name}
                </button>
              ))}
            </div>
            <button
              className="button subtle export-button"
              disabled={!filtered.length}
              onClick={downloadCsv}
            >
              <ArrowDownToLine size={15} />
              Export CSV
            </button>
          </div>

          {view !== "compare" && (
            <div className="chart-controls">
              <div
                className="metric-tabs"
                role="group"
                aria-label="Strokes gained metric"
              >
                {metrics.map((m) => (
                  <button
                    key={m.key}
                    aria-pressed={metric === m.key}
                    className={metric === m.key ? "active" : ""}
                    onClick={() => setMetric(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {period !== "Season" && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeWildcards}
                    onChange={(e) => setIncludeWildcards(e.target.checked)}
                  />
                  Include wildcards
                </label>
              )}
            </div>
          )}

          {view === "leaderboard" && (
            <div className="explorer-grid">
              <section className="ranking-panel">
                <div className="panel-heading">
                  <div>
                    <h2>{metricLabel} leaderboard</h2>
                    <p>
                      {period === "Season" ? "Both stops combined" : period} ·{" "}
                      {filtered.length} players · cumulative SG
                    </p>
                  </div>
                  <div className="chart-key">
                    <span />
                    Positive SG
                  </div>
                </div>
                {filtered.length ? (
                  <>
                    <div className="ranking-head">
                      <span>PLAYER</span>
                      <span>STROKES GAINED</span>
                    <span>SG &amp; SHOTS</span>
                    </div>
                    <Ranking
                      rows={filtered}
                      metric={metric}
                      active={active?.player}
                      onSelect={setFocused}
                    />
                    <div className="ranking-foot">
                      Select a player to explore their game.
                      <span>Higher is better</span>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    reset={() => {
                      setQuery("");
                      setTeam("All teams");
                    }}
                  />
                )}
              </section>
              {active && (
                <PlayerSpotlight
                  record={active}
                  onCompare={() => {
                    setSelected(
                      [
                        active.player,
                        ...selected.filter((n) => n !== active.player),
                      ].slice(0, 3),
                    );
                    setView("compare");
                  }}
                />
              )}
            </div>
          )}

          {view === "matrix" && (
            <section className="matrix-panel">
              <div className="panel-heading">
                <div>
                  <h2>The whole game, at a glance</h2>
                  <p>
                    Sorted by {metricLabel.toLowerCase()} · {filtered.length}{" "}
                    players · {period}
                  </p>
                </div>
                <div className="heat-legend">
                  <span>Lost</span>
                  <i />
                  <span>Gained</span>
                </div>
              </div>
              {filtered.length ? (
                <div className="table-scroll">
                  <table className="matrix">
                    <thead>
                      <tr>
                        <th scope="col">Player</th>
                        <th scope="col">Shots</th>
                        {metrics.map((m) => (
                          <th scope="col" key={m.key}>
                            <button onClick={() => setMetric(m.key)}>
                              {m.label}
                              {metric === m.key && " ↓"}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.player}>
                          <th scope="row">
                            <button
                              className="matrix-player"
                              onClick={() => {
                                setFocused(r.player);
                                setView("leaderboard");
                              }}
                            >
                              <span
                                className="team-dot"
                                style={{ background: teamColors[r.team] }}
                              />
                              {r.player}
                              {r.role === "Wildcard" && <small>WC</small>}
                            </button>
                          </th>
                          <td className="shots-cell">{r.shots}</td>
                          {metrics.map((m) => (
                            <td key={m.key}>
                              <span
                                className="heat-cell"
                                style={{
                                  background:
                                    r[m.key] >= 0
                                      ? `rgba(186, 220, 136, ${Math.min(Math.abs(r[m.key]) / 12, 0.75) + 0.06})`
                                      : `rgba(210, 125, 119, ${Math.min(Math.abs(r[m.key]) / 12, 0.75) + 0.06})`,
                                }}
                                title={`${r.player}: ${signed(r[m.key])} ${m.label}`}
                              >
                                {signed(r[m.key])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  reset={() => {
                    setQuery("");
                    setTeam("All teams");
                  }}
                />
              )}
            </section>
          )}

          {view === "compare" && (
            <section className="comparison-panel">
              <div className="panel-heading">
                <div>
                  <h2>Put their games side by side</h2>
                  <p>Choose up to 3 players · {period} · cumulative SG</p>
                </div>
                <span className="comparison-count">
                  {comparison.length} / 3 selected
                </span>
              </div>
              <div className="player-picker">
                {[...field]
                  .sort((a, b) => a.player.localeCompare(b.player))
                  .map((r) => (
                    <button
                      key={r.player}
                      aria-pressed={selected.includes(r.player)}
                      className={selected.includes(r.player) ? "chosen" : ""}
                      onClick={() => togglePlayer(r.player)}
                    >
                      <span
                        className="team-dot"
                        style={{ background: teamColors[r.team] }}
                      />
                      {r.player}
                      {selected.includes(r.player) && <Check size={13} />}
                    </button>
                  ))}
              </div>
              <p className="comparison-note">
                Comparison selections use the full field at this stop. Team and
                search filters apply to the leaderboard, matrix, and CSV export.
              </p>
              {comparison.length ? (
                <>
                  <div
                    className="compare-chart"
                    aria-label="Grouped bar chart comparing strokes gained categories"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 15, right: 15, left: 0, bottom: 8 }}
                        barGap={6}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="#2d3933"
                          strokeDasharray="3 5"
                        />
                        <XAxis
                          dataKey="category"
                          tick={{ fill: "#a6b1a8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fill: "#a6b1a8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={42}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#19261e",
                            border: "1px solid #42503f",
                            borderRadius: 10,
                            color: "#f1f2e9",
                          }}
                          formatter={(value) => signed(Number(value))}
                          cursor={{ fill: "rgba(255,255,255,.025)" }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: 15, fontSize: 13 }}
                        />
                        <ReferenceLine y={0} stroke="#778477" />
                        {comparison.map((r, i) => (
                          <Bar
                            key={r.player}
                            dataKey={r.player}
                            fill={comparisonColors[i]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={52}
                            isAnimationActive={!presentation}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="comparison-totals">
                    {comparison.map((r, i) => (
                      <div key={r.player}>
                        <span className="compare-name">
                          <i style={{ background: comparisonColors[i] }} />
                          {r.player}
                        </span>
                        <strong>
                          {signed(r.total)} <small>total SG</small>
                        </strong>
                        <span>
                          {r.shots} tracked shots · {r.team}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <GitCompareArrows size={30} />
                  <h3>Choose players to compare</h3>
                  <p>
                    Select names above to explore their strengths side by side.
                  </p>
                </div>
              )}
            </section>
          )}

          <div className="method-note">
            <CircleHelp size={17} />
            <p>
              <strong>Read the numbers in context.</strong> SG values are YGT’s
              published cumulative totals, not per-round averages. Players have
              different tracked shot counts. Season totals cover the 16 regular
              players; each wildcard appears at their stop. Positive means
              strokes gained against YGT’s reference baseline.
            </p>
          </div>
        </section>
        <footer>
          <span>
            STATHEAD <span className="footer-slash">/</span> YOUR GOLF TOUR
          </span>
          <span>
            Independent project. Data:{" "}
            <a
              href="https://www.ygtour.com/roster"
              target="_blank"
              rel="noreferrer"
            >
              YGT player profiles <ArrowUpRight size={12} />
            </a>{" "}
            · {asOf}
          </span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </main>
  );
}

function Ranking({
  rows,
  metric,
  active,
  onSelect,
}: {
  rows: PlayerRecord[];
  metric: Metric;
  active?: string;
  onSelect: (name: string) => void;
}) {
  const extent = Math.max(1, ...rows.map((r) => Math.abs(r[metric])));
  return (
    <div className="ranking-rows">
      {rows.map((r, i) => {
        const value = r[metric];
        return (
          <button
            key={r.player}
            className={`ranking-row ${active === r.player ? "focused" : ""}`}
            onClick={() => onSelect(r.player)}
            aria-pressed={active === r.player}
            title={`${r.player}: ${signed(value)} SG, ${r.shots} tracked shots`}
          >
            <span className="rank-player">
              <span className="rank-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="team-dot"
                style={{ background: teamColors[r.team] }}
              />
              <span className="player-label">
                {r.player}
                {r.role === "Wildcard" && <small>WC</small>}
              </span>
            </span>
            <span className="bar-track">
              <span className="bar-zero" />
              <span
                className={`sg-bar ${value < 0 ? "negative" : ""}`}
                style={{
                  left:
                    value < 0
                      ? `${50 - (Math.abs(value) / extent) * 48}%`
                      : "50%",
                  width: `${(Math.abs(value) / extent) * 48}%`,
                }}
              />
            </span>
            <span className="rank-value">
              <strong className={value < 0 ? "negative-text" : "positive-text"}>
                {signed(value)}
              </strong>
              <small>{r.shots} shots</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlayerSpotlight({
  record: r,
  onCompare,
}: {
  record: PlayerRecord;
  onCompare: () => void;
}) {
  const stops = records.filter(
    (row) => row.player === r.player && row.period !== "Season",
  );
  return (
    <aside className="spotlight">
      <div className="spotlight-top">
        <span className="eyebrow">PLAYER SPOTLIGHT</span>
        <span
          className="avatar"
          style={{ color: teamColors[r.team], borderColor: teamColors[r.team] }}
        >
          {initials(r.player)}
        </span>
        <h2>{r.player}</h2>
        <span className="spotlight-team">
          <span
            className="team-dot"
            style={{ background: teamColors[r.team] }}
          />
          {r.team}
          {r.role === "Wildcard" && " · Wildcard"}
        </span>
        <div className="spotlight-total">
          <strong className={r.total < 0 ? "negative-text" : "positive-text"}>
            {signed(r.total)}
          </strong>
          <span>TOTAL STROKES GAINED</span>
        </div>
        <div className="player-meta">
          <span>{r.shots} tracked shots</span>
          <span>Total SG: {r.rank}</span>
        </div>
      </div>
      <div className="category-list">
        {metrics.slice(1).map((m) => (
          <div key={m.key}>
            <span>
              <i style={{ background: m.color }} />
              {m.label}
            </span>
            <strong className={r[m.key] < 0 ? "negative-text" : ""}>
              {signed(r[m.key])}
            </strong>
          </div>
        ))}
      </div>
      <div className="stop-list">
        <span className="eyebrow">STOP BY STOP · TOTAL SG</span>
        {stops.map((stop) => (
          <div key={stop.period}>
            <span>
              {stop.period}
              <small>{stop.shots} shots</small>
            </span>
            <strong
              className={stop.total < 0 ? "negative-text" : "positive-text"}
            >
              {signed(stop.total)}
            </strong>
          </div>
        ))}
      </div>
      <button className="button compare-cta" onClick={onCompare}>
        <GitCompareArrows size={15} />
        Compare player
        <ArrowUpRight size={14} />
      </button>
      <a
        className="source-link"
        href={r.source}
        target="_blank"
        rel="noreferrer"
      >
        View source profile
        <ArrowUpRight size={12} />
      </a>
    </aside>
  );
}

function EmptyState({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <Search size={30} />
      <h3>No matching players</h3>
      <p>Try another name or reset your team and search filters.</p>
      <button className="button" onClick={reset}>
        Reset filters
      </button>
    </div>
  );
}
