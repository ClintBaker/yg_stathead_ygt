"use client";

import { ArrowUpRight, GitCompareArrows } from "lucide-react";
import { metrics, periods, records, signed, teamColors, type Metric, type Period, type PlayerRecord } from "@/lib/data";
import type { TeamStats } from "@/lib/team-stats";

function CategoryBars({ row, extent }: { row: Pick<PlayerRecord, Metric>; extent: number }) {
  return <div className="focus-bars" aria-label="Category strokes gained">
    {metrics.slice(1).map((m) => <div className="focus-bar-row" key={m.key}>
      <span className="focus-category">{m.label}</span>
      <span className="focus-track" aria-hidden="true"><i className="focus-zero" /><i className={`focus-fill ${row[m.key] < 0 ? "loss" : ""}`} style={{
        left: row[m.key] < 0 ? `${50 - Math.abs(row[m.key]) / extent * 48}%` : "50%",
        width: `${Math.abs(row[m.key]) / extent * 48}%`,
      }} /></span>
      <strong className={row[m.key] < 0 ? "negative-text" : "positive-text"}>{signed(row[m.key])}</strong>
    </div>)}
    <div className="focus-axis"><span>Lost</span><span>0</span><span>Gained</span></div>
  </div>;
}

export function TeamView({ teams, period, includeWildcards, onWildcards, onPlayer }: {
  teams: TeamStats[]; period: Period; includeWildcards: boolean;
  onWildcards: (include: boolean) => void; onPlayer: (name: string) => void;
}) {
  const extent = Math.max(1, ...teams.flatMap((t) => metrics.slice(1).map((m) => Math.abs(t[m.key]))));
  return <section className="focus-panel">
    <div className="panel-heading"><div><h2>Four teams. Every part of the game.</h2><p>{period} · ranked by combined total SG · shared category scale</p></div>
      {period !== "Season" && <label className="checkbox-label"><input type="checkbox" checked={includeWildcards} onChange={(e) => onWildcards(e.target.checked)} />Include wildcards</label>}
    </div>
    <div className="team-grid">
      {teams.map((t, i) => <article className="team-card" key={t.team}>
        <div className="team-card-heading"><span className="eyebrow">{String(i + 1).padStart(2, "0")} / TEAM TOTAL</span><span className="team-dot" style={{ background: teamColors[t.team] }} /></div>
        <h3>{t.team}</h3>
        <div className={`team-total ${t.total < 0 ? "negative-text" : "positive-text"}`}>{signed(t.total)}<span>total SG</span></div>
        <p className="team-meta">{t.players.length} players · {t.shots.toLocaleString()} tracked shots</p>
        <CategoryBars row={t} extent={extent} />
        <div className="team-roster"><span className="eyebrow">PLAYER CONTRIBUTIONS · TOTAL SG</span>
          {t.players.map((r) => <button key={r.player} onClick={() => onPlayer(r.player)} title={`Open ${r.player}'s stats`}>
            <span>{r.player}{r.role === "Wildcard" && <small> WC</small>}</span><strong className={r.total < 0 ? "negative-text" : "positive-text"}>{signed(r.total)}</strong>
          </button>)}
        </div>
      </article>)}
    </div>
    <p className="comparison-note">Team SG sums each included player’s published figures. These are cumulative totals, not per-round averages or official team scores. {period === "Season" ? "Season includes regular players only." : includeWildcards ? "Wildcards are included at this stop." : "Wildcards are excluded."} Player and team search filters do not apply to this view.</p>
  </section>;
}

export function PlayerView({ name, record, period, onSelect, onPeriod, onCompare }: {
  name: string; record?: PlayerRecord; period: Period;
  onSelect: (name: string) => void; onPeriod: (period: Period) => void; onCompare: () => void;
}) {
  const roster = [...new Set(records.map((r) => r.player))].sort();
  const history = periods.map((p) => records.find((r) => r.player === name && r.period === p)).filter((r): r is PlayerRecord => Boolean(r));
  const identity = record ?? history[0];
  const stops = history.filter((r) => r.period !== "Season");
  const extent = record ? Math.max(1, ...metrics.slice(1).map((m) => Math.abs(record[m.key]))) : 1;
  return <section className="focus-panel player-focus">
    <div className="panel-heading"><div><h2>One player. The complete picture.</h2><p>Choose a player, then switch stops above.</p></div>
      <label className="select-wrap"><span className="sr-only">Player profile</span><select aria-label="Player profile" value={name} onChange={(e) => onSelect(e.target.value)}>{roster.map((n) => <option key={n}>{n}</option>)}</select></label>
    </div>
    <div className="player-identity"><span className="eyebrow"><i className="team-dot" style={{ background: teamColors[identity.team] }} />{identity.team}{identity.role === "Wildcard" && " · WILDCARD"}</span><h3>{name}</h3></div>
    {record ? <>
      <div className="player-overview">
        <div className="player-score"><span className="eyebrow">{period.toUpperCase()} · TOTAL SG</span><strong className={record.total < 0 ? "negative-text" : "positive-text"}>{signed(record.total)}</strong><p>{record.shots} tracked shots <span>·</span> YGT rank {record.rank}</p><button className="button" onClick={onCompare}><GitCompareArrows size={15} />Compare with other players</button></div>
        <div className="player-game"><h4>Where strokes were gained and lost</h4><CategoryBars row={record} extent={extent} /></div>
      </div>
    </> : <div className="unavailable"><h4>No published {period} record for {name}.</h4><p>Wildcards have data only for their recorded stop. Select an available stop to see their stats.</p>{stops.map((r) => <button className="button" key={r.period} onClick={() => onPeriod(r.period as Period)}>{r.period}</button>)}</div>}
    <div className="player-history"><div className="panel-heading"><div><h2>Stop by stop</h2><p>Published SG totals · select a row to focus that period</p></div></div>
      <div className="table-scroll"><table className="history-table"><thead><tr><th scope="col">Period</th><th scope="col">Shots</th>{metrics.map((m) => <th key={m.key} scope="col">{m.label}</th>)}</tr></thead><tbody>{history.map((r) => <tr className={period === r.period ? "current" : ""} key={r.period}><th scope="row"><button aria-pressed={period === r.period} onClick={() => onPeriod(r.period as Period)}>{r.period}</button></th><td>{r.shots}</td>{metrics.map((m) => <td key={m.key} className={r[m.key] < 0 ? "negative-text" : "positive-text"}>{signed(r[m.key])}</td>)}</tr>)}</tbody></table></div>
    </div>
    <a className="player-source" href={identity.source} target="_blank" rel="noreferrer">View YGT source profile <ArrowUpRight size={13} /></a>
    <p className="comparison-note">Cumulative strokes gained. Shot counts vary between stops and players. Team and search filters do not apply to this profile.</p>
  </section>;
}
