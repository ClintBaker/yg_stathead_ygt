# Stathead YGT

A Next.js dashboard for exploring Your Golf Tour strokes gained, built for interactive analysis and recording a YouTube walkthrough.

## Run locally

Use Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

```bash
npm test
npm run typecheck
npm run build
npm start
```

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import `ClintBaker/yg_stathead_ygt`.
2. Keep the **Next.js** framework preset and repository root directory.
3. Deploy. No environment variables, database, or API keys are required.

Vercel detects `npm run build`. Connect the Git repository to enable automatic deployments for subsequent commits.

## Explore the dashboard

- Switch between season totals, Pursell Farms, and Rams Hill.
- Filter the leaderboard and category matrix by team, player name, and wildcard participation.
- Select a leaderboard row for the player's category breakdown and stop-by-stop totals.
- Select a matrix column heading to sort by that category.
- Compare up to three players with grouped category bars. Comparison selections use the full field for the selected period independently of team/search filters.
- Export the current filtered data as CSV.
- Use **Share view** to copy a URL preserving the current filters, comparison selections, and view.
- Use **Present** to hide the introduction, summary cards, and footer for recording. Press Escape or **Exit presentation** to return. Browser fullscreen can be used separately.

## Data and interpretation

`data/ygt.json` is a checked-in snapshot collected on **October 19, 2026** from the player profiles linked at https://www.ygtour.com/roster. Each record includes its specific source URL, original YGT total rank, total tracked shots, category shot counts, and the five published SG values.

The 56 records comprise 16 season records, 20 Pursell Farms records, and 20 Rams Hill records, covering 24 distinct players. Wildcards have records only for the stop in which they appeared. Season values are YGT's published season view for the 16 regular players.

**These are cumulative strokes gained, not per-round averages.** Playing time and tracked shot counts vary substantially. No per-round denominator or baseline definition is inferred. Rankings shown in the leaderboard are recalculated within the currently filtered group; the spotlight retains the original YGT total-SG rank for the period. Positive SG denotes a gain relative to YGT's reference baseline, whose definition is not supplied in this snapshot.

The snapshot does not update automatically. To refresh, edit/add the records in `data/ygt.json`, update `asOf` in `lib/data.ts`, and update the data coverage text and tests when adding stops or changing roster size. Use the player-page source links to verify the new figures. Run `npm test` to catch category-total, shot-count, duplicate-record, and season aggregation errors.

This is an independent project and is not affiliated with Your Golf Tour. Data belongs to its respective source.

## Stack

Next.js App Router, TypeScript, React, Recharts for player comparison charts, Lucide icons, and CSS. Leaderboard bars and matrix cells use accessible HTML controls. A Google Fonts stylesheet enhances typography, with Arial as an offline fallback.
