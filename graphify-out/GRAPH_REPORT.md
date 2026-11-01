# Graph Report - degalai  (2026-11-01)

## Corpus Check
- 50 files · ~33,553 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 259 nodes · 650 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a4a5d6a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- package.json
- aggregateFuelData
- compilerOptions
- next
- fetchWithRetry
- fuel-prices-eu-national.ts
- react
- README.md
- AGENTS.md
- types.ts
- aggregate.ts
- degalu-kaina-lt.ts
- vercel.json
- price-estimator.ts
- degalukaina-scraper.ts
- saurida-official.ts

## God Nodes (most connected - your core abstractions)
1. `SourceStatus` - 33 edges
2. `aggregateFuelData()` - 29 edges
3. `fetchWithRetry()` - 25 edges
4. `FuelType` - 23 edges
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

## Communities (17 total, 2 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.15
Nodes (28): DEFAULT_SOURCE_STATUSES, HomePage(), FuelFilterBar(), FuelFilterBarProps, HeroStats(), HeroStatsProps, LeafletMapProps, DynamicLeafletMap (+20 more)

### Community 1 - "package.json"
Cohesion: 0.06
Nodes (47): eslintConfig, dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, leaflet@^1.9.4, leaflet.markercluster@^1.5.3, lucide-react@^1.58.0, next@16.4.2 (+39 more)

### Community 2 - "aggregateFuelData"
Cohesion: 0.20
Nodes (10): GET(), GET(), GET(), aggregateFuelData(), addRawPriceObservation(), getObsList(), scrapeKurokainos24(), calculateDistance() (+2 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "next"
Cohesion: 0.22
Nodes (8): geistMono, geistSans, metadata, RootLayout(), viewport, ThemeProvider(), next-themes@^0.4.6, next-themes

### Community 5 - "fetchWithRetry"
Cohesion: 0.21
Nodes (13): CustomFeedResult, fetchCustomFeed(), BRAND_COLORS, DegalukainosApiResult, fetchDegalukainosApiStations(), normalizeBrand(), fetchFuelPricesEu(), FuelPricesEuResult (+5 more)

### Community 6 - "fuel-prices-eu-national.ts"
Cohesion: 0.31
Nodes (8): GET(), NationalTrendChartProps, fetchFuelPricesEuNational(), FuelPricesEuNationalResult, generateHistoricalTrends(), getFallbackNationalData(), TrendPoint, recharts

### Community 7 - "react"
Cohesion: 0.17
Nodes (19): Article, ARTICLES_DATA, NaujienosPage(), Coupon, COUPONS_DATA, LOYALTY_COMPARISON, NuolaidosPage(), BrandStats (+11 more)

### Community 8 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 10 - "types.ts"
Cohesion: 0.17
Nodes (14): NavbarProps, SourceStatusModalProps, EvStationsResult, fetchEvChargingStations(), OPERATOR_COLORS, Kurokainos24Result, fetchOpenVanPrices(), OpenVanResult (+6 more)

### Community 11 - "aggregate.ts"
Cohesion: 0.19
Nodes (10): BRAND_COLORS, isSameStation(), normalizeAddress(), normalizeBrand(), fetchOsmOverpassStations(), OsmOverpassResult, OsmOverpassStation, generateSeedStations() (+2 more)

### Community 12 - "degalu-kaina-lt.ts"
Cohesion: 0.36
Nodes (7): BRAND_SLUGS, DegaluKainaLtResult, extractPageDate(), GeoJsonFeature, normalizeBrand(), parseGeoJsonFromPage(), scrapeDegaluKainaLt()

### Community 14 - "price-estimator.ts"
Cohesion: 0.33
Nodes (6): estimateFuelPrice(), getTimeDecay(), MARKET_BOUNDS, PriceObservation, SOURCE_AUTHORITY, FuelPriceEntry

### Community 15 - "degalukaina-scraper.ts"
Cohesion: 0.53
Nodes (5): DegalukainaScraperResult, extractBrand(), extractCity(), parseStationsFromPageHtml(), scrapeDegalukaina()

### Community 16 - "saurida-official.ts"
Cohesion: 0.50
Nodes (4): normalizeCityKey(), SAURIDA_STATION_COORDS, SauridaOfficialResult, scrapeSauridaOfficial()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `react` to `types.ts`, `package.json`, `aggregateFuelData`, `next`, `fuel-prices-eu-national.ts`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14512195121951219 - nodes in this community are weakly interconnected._
- **Why does `SourceStatus` connect `types.ts` to `types.ts`, `fetchWithRetry`, `fuel-prices-eu-national.ts`, `react`, `aggregate.ts`, `degalu-kaina-lt.ts`, `degalukaina-scraper.ts`, `saurida-official.ts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.055272108843537414 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `types.ts`, `package.json`, `next`, `fuel-prices-eu-national.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._