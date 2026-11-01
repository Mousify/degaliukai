# Graph Report - degalai  (2026-11-01)

## Corpus Check
- 54 files · ~109,705 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 269 nodes · 663 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a3cd614b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- package.json
- compilerOptions
- next
- react
- README.md
- AGENTS.md
- aggregate.ts
- SourceStatus
- vercel.json
- types.ts
- discounts-scraper.ts

## God Nodes (most connected - your core abstractions)
1. `SourceStatus` - 29 edges
2. `aggregateFuelData()` - 27 edges
3. `fetchWithRetry()` - 27 edges
4. `FuelType` - 23 edges
5. `Station` - 20 edges
6. `react` - 20 edges
7. `lucide-react` - 19 edges
8. `compilerOptions` - 16 edges
9. `formatRelativeTimeLt()` - 15 edges
10. `next` - 15 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `aggregateFuelData()`  [EXTRACTED]
  app/api/cron/route.ts → lib/aggregate.ts
- `GET()` --calls--> `fetchLiveDiscounts()`  [EXTRACTED]
  app/api/discounts/route.ts → lib/sources/discounts-scraper.ts
- `GET()` --calls--> `fetchFuelPricesEuNational()`  [EXTRACTED]
  app/api/national-trends/route.ts → lib/sources/fuel-prices-eu-national.ts
- `NaujienosPage()` --calls--> `formatRelativeTimeLt()`  [EXTRACTED]
  app/naujienos/page.tsx → lib/utils.ts
- `NuolaidosPage()` --calls--> `formatRelativeTimeLt()`  [EXTRACTED]
  app/nuolaidos/page.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.15
Nodes (28): DEFAULT_SOURCE_STATUSES, HomePage(), FuelFilterBar(), FuelFilterBarProps, HeroStats(), HeroStatsProps, LeafletMapProps, DynamicLeafletMap (+20 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (48): eslintConfig, dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, leaflet@^1.9.4, leaflet.markercluster@^1.5.3, lucide-react@^1.58.0, next@16.4.2 (+40 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "next"
Cohesion: 0.22
Nodes (8): geistMono, geistSans, metadata, RootLayout(), viewport, ThemeProvider(), next-themes@^0.4.6, next-themes

### Community 7 - "react"
Cohesion: 0.17
Nodes (19): Article, FALLBACK_ARTICLES, NaujienosPage(), Coupon, FALLBACK_COUPONS, LOYALTY_COMPARISON, NuolaidosPage(), BrandStats (+11 more)

### Community 8 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 11 - "aggregate.ts"
Cohesion: 0.11
Nodes (23): GET(), GET(), GET(), aggregateFuelData(), addRawPriceObservation(), getObsList(), BRAND_COLORS, isSameStation() (+15 more)

### Community 12 - "SourceStatus"
Cohesion: 0.08
Nodes (35): GET(), SourceStatusModalProps, CustomFeedResult, BRAND_SLUGS, DegaluKainaLtResult, extractPageDate(), GeoJsonFeature, normalizeBrand() (+27 more)

### Community 14 - "types.ts"
Cohesion: 0.14
Nodes (19): GET(), NationalTrendChartProps, NavbarProps, estimateFuelPrice(), getTimeDecay(), MARKET_BOUNDS, PriceObservation, SOURCE_AUTHORITY (+11 more)

### Community 17 - "discounts-scraper.ts"
Cohesion: 0.43
Nodes (5): GET(), DiscountCoupon, DiscountsResult, fetchLiveDiscounts(), formatSlugToTitle()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `react` to `types.ts`, `package.json`, `next`, `aggregate.ts`, `SourceStatus`, `types.ts`, `discounts-scraper.ts`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14512195121951219 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `types.ts`, `package.json`, `next`, `types.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.054693877551020405 - nodes in this community are weakly interconnected._
- **Why does `SourceStatus` connect `SourceStatus` to `types.ts`, `aggregate.ts`, `types.ts`, `react`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `aggregate.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1051693404634581 - nodes in this community are weakly interconnected._