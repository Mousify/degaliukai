# Graph Report - degalai  (2026-11-01)

## Corpus Check
- 56 files · ~110,042 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 276 nodes · 685 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a3cd614b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- package.json
- prices/route.ts
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
- discounts-scraper.ts
- news-scraper.ts
- ev-stations.ts
- osm-overpass.ts
- degalukainos-api.ts
- kurokainos24-scraper.ts

## God Nodes (most connected - your core abstractions)
1. `SourceStatus` - 33 edges
2. `aggregateFuelData()` - 29 edges
3. `fetchWithRetry()` - 29 edges
4. `FuelType` - 23 edges
5. `Station` - 20 edges
6. `react` - 20 edges
7. `lucide-react` - 19 edges
8. `RawFuelPrice` - 16 edges
9. `compilerOptions` - 16 edges
10. `formatRelativeTimeLt()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `aggregateFuelData()`  [EXTRACTED]
  app/api/cron/route.ts → lib/aggregate.ts
- `GET()` --calls--> `fetchLiveDiscounts()`  [EXTRACTED]
  app/api/discounts/route.ts → lib/sources/discounts-scraper.ts
- `GET()` --calls--> `fetchFuelPricesEuNational()`  [EXTRACTED]
  app/api/national-trends/route.ts → lib/sources/fuel-prices-eu-national.ts
- `GET()` --calls--> `aggregateFuelData()`  [EXTRACTED]
  app/api/prices/route.ts → lib/aggregate.ts
- `GET()` --calls--> `aggregateFuelData()`  [EXTRACTED]
  app/api/stations/[id]/route.ts → lib/aggregate.ts

## Import Cycles
- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.13
Nodes (30): DEFAULT_SOURCE_STATUSES, HomePage(), FuelFilterBar(), FuelFilterBarProps, HeroStats(), HeroStatsProps, LeafletMapProps, DynamicLeafletMap (+22 more)

### Community 1 - "package.json"
Cohesion: 0.06
Nodes (47): eslintConfig, dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, leaflet@^1.9.4, leaflet.markercluster@^1.5.3, lucide-react@^1.58.0, next@16.4.2 (+39 more)

### Community 2 - "prices/route.ts"
Cohesion: 0.60
Nodes (3): GET(), GET(), calculateDistance()

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "next"
Cohesion: 0.22
Nodes (8): geistMono, geistSans, metadata, RootLayout(), viewport, ThemeProvider(), next-themes@^0.4.6, next-themes

### Community 5 - "fetchWithRetry"
Cohesion: 0.29
Nodes (9): CustomFeedResult, fetchCustomFeed(), fetchFuelPricesEu(), FuelPricesEuResult, fetchSauridaGithubPrices(), SAURIDA_METADATA, SauridaResult, RawFuelPrice (+1 more)

### Community 6 - "fuel-prices-eu-national.ts"
Cohesion: 0.67
Nodes (4): GET(), fetchFuelPricesEuNational(), generateHistoricalTrends(), getFallbackNationalData()

### Community 7 - "react"
Cohesion: 0.17
Nodes (19): Article, FALLBACK_ARTICLES, NaujienosPage(), Coupon, FALLBACK_COUPONS, LOYALTY_COMPARISON, NuolaidosPage(), BrandStats (+11 more)

### Community 8 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 10 - "types.ts"
Cohesion: 0.24
Nodes (10): NavbarProps, SourceStatusModalProps, StationDetailModalProps, FuelPricesEuNationalResult, fetchOpenVanPrices(), OpenVanResult, fetchRapidApiFuelPrices(), RapidApiResult (+2 more)

### Community 11 - "aggregate.ts"
Cohesion: 0.18
Nodes (13): GET(), aggregateFuelData(), addRawPriceObservation(), getObsList(), BRAND_COLORS, isSameStation(), normalizeAddress(), normalizeBrand() (+5 more)

### Community 12 - "degalu-kaina-lt.ts"
Cohesion: 0.36
Nodes (7): BRAND_SLUGS, DegaluKainaLtResult, extractPageDate(), GeoJsonFeature, normalizeBrand(), parseGeoJsonFromPage(), scrapeDegaluKainaLt()

### Community 14 - "price-estimator.ts"
Cohesion: 0.24
Nodes (8): estimateFuelPrice(), getTimeDecay(), MARKET_BOUNDS, PriceObservation, SOURCE_AUTHORITY, CommunityPriceReport, FuelPriceEntry, StationAmenity

### Community 15 - "degalukaina-scraper.ts"
Cohesion: 0.53
Nodes (5): DegalukainaScraperResult, extractBrand(), extractCity(), parseStationsFromPageHtml(), scrapeDegalukaina()

### Community 16 - "saurida-official.ts"
Cohesion: 0.50
Nodes (4): normalizeCityKey(), SAURIDA_STATION_COORDS, SauridaOfficialResult, scrapeSauridaOfficial()

### Community 17 - "discounts-scraper.ts"
Cohesion: 0.43
Nodes (5): GET(), DiscountCoupon, DiscountsResult, fetchLiveDiscounts(), formatSlugToTitle()

### Community 18 - "news-scraper.ts"
Cohesion: 0.47
Nodes (4): GET(), Article, fetchLiveNews(), NewsResult

### Community 19 - "ev-stations.ts"
Cohesion: 0.40
Nodes (4): buildSeedStationList(), EvStationsResult, fetchEvChargingStations(), OPERATOR_COLORS

### Community 20 - "osm-overpass.ts"
Cohesion: 0.33
Nodes (4): fetchOsmOverpassStations(), OsmOverpassResult, OsmOverpassStation, OVERPASS_MIRRORS

### Community 21 - "degalukainos-api.ts"
Cohesion: 0.50
Nodes (4): BRAND_COLORS, DegalukainosApiResult, fetchDegalukainosApiStations(), normalizeBrand()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `react` to `types.ts`, `package.json`, `prices/route.ts`, `next`, `fuel-prices-eu-national.ts`, `aggregate.ts`, `discounts-scraper.ts`, `news-scraper.ts`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1321353065539112 - nodes in this community are weakly interconnected._
- **Why does `SourceStatus` connect `types.ts` to `types.ts`, `fetchWithRetry`, `fuel-prices-eu-national.ts`, `react`, `aggregate.ts`, `degalu-kaina-lt.ts`, `price-estimator.ts`, `degalukaina-scraper.ts`, `saurida-official.ts`, `ev-stations.ts`, `osm-overpass.ts`, `degalukainos-api.ts`, `kurokainos24-scraper.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.055272108843537414 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `types.ts`, `package.json`, `next`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._