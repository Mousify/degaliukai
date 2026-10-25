# Graph Report - degalai  (2026-10-25)

## Corpus Check
- 50 files · ~33,020 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 258 nodes · 645 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9192e7a5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- package.json
- aggregate.ts
- compilerOptions
- next
- types.ts
- fuel-prices-eu-national.ts
- react
- README.md
- AGENTS.md
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `SourceStatus` - 32 edges
2. `aggregateFuelData()` - 29 edges
3. `FuelType` - 23 edges
4. `fetchWithRetry()` - 23 edges
5. `Station` - 20 edges
6. `react` - 20 edges
7. `lucide-react` - 19 edges
8. `RawFuelPrice` - 16 edges
9. `compilerOptions` - 16 edges
10. `HomePage()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `aggregateFuelData()`  [EXTRACTED]
  app/api/cron/route.ts → lib/aggregate.ts
- `GET()` --calls--> `fetchFuelPricesEuNational()`  [EXTRACTED]
  app/api/national-trends/route.ts → lib/sources/fuel-prices-eu-national.ts
- `HomePage()` --calls--> `Footer()`  [EXTRACTED]
  app/page.tsx → components/Footer.tsx
- `HomePage()` --calls--> `Navbar()`  [EXTRACTED]
  app/page.tsx → components/Navbar.tsx
- `HomePage()` --calls--> `calculateDistance()`  [EXTRACTED]
  app/page.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.12
Nodes (37): HomePage(), FuelFilterBar(), FuelFilterBarProps, HeroStats(), HeroStatsProps, LeafletMapProps, DynamicLeafletMap, MapWrapper() (+29 more)

### Community 1 - "package.json"
Cohesion: 0.06
Nodes (47): eslintConfig, dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, leaflet@^1.9.4, leaflet.markercluster@^1.5.3, lucide-react@^1.58.0, next@16.4.2 (+39 more)

### Community 2 - "aggregate.ts"
Cohesion: 0.10
Nodes (27): GET(), GET(), GET(), aggregateFuelData(), addRawPriceObservation(), getObsList(), BRAND_COLORS, isSameStation() (+19 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "next"
Cohesion: 0.22
Nodes (8): geistMono, geistSans, metadata, RootLayout(), viewport, ThemeProvider(), next-themes@^0.4.6, next-themes

### Community 5 - "types.ts"
Cohesion: 0.10
Nodes (33): SourceStatusModalProps, CustomFeedResult, fetchCustomFeed(), BRAND_SLUGS, DegaluKainaLtResult, extractPageDate(), GeoJsonFeature, normalizeBrand() (+25 more)

### Community 6 - "fuel-prices-eu-national.ts"
Cohesion: 0.27
Nodes (10): GET(), NationalTrendChartProps, NavbarProps, fetchFuelPricesEuNational(), FuelPricesEuNationalResult, generateHistoricalTrends(), getFallbackNationalData(), OpenVanResult (+2 more)

### Community 7 - "react"
Cohesion: 0.16
Nodes (16): Article, ARTICLES_DATA, NaujienosPage(), Coupon, COUPONS_DATA, LOYALTY_COMPARISON, NuolaidosPage(), BrandStats (+8 more)

### Community 8 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `react` to `types.ts`, `package.json`, `aggregate.ts`, `next`, `fuel-prices-eu-national.ts`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11784511784511785 - nodes in this community are weakly interconnected._
- **Why does `react` connect `types.ts` to `package.json`, `next`, `react`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.055272108843537414 - nodes in this community are weakly interconnected._
- **Why does `SourceStatus` connect `types.ts` to `types.ts`, `aggregate.ts`, `fuel-prices-eu-national.ts`, `react`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `aggregate.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._