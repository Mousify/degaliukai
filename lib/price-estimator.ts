import { FuelPriceEntry, FuelType } from './types';

export interface PriceObservation {
  source: string;
  price: number;
  updatedAt: string;
}

/**
 * SOURCE RELIABILITY WEIGHTS (0.0 to 1.0)
 * Direct official company websites have highest authority.
 * Live aggregator webcrawlers have high authority.
 * Secondary aggregators and community archives have moderate authority.
 */
const SOURCE_AUTHORITY: Record<string, number> = {
  'Saurida.lt Oficialus': 1.0,   // Direct official: company website
  'Degalukaina.lt': 0.95,         // Live aggregator (user-reported + official)
  'Degalu-kaina.lt': 0.90,        // Official LEA data scraped from network pages (daily)
  'fuel-prices.eu': 0.85,         // Live API aggregator
  'Kurokainos24.lt': 0.75,        // Semi-official aggregator
  'OpenVan.camp': 0.65,           // Community aggregator
  'DegalųKainos.lt': 0.40,        // Geographic registry — API data is months old
  'Saurida GitHub': 0.25,         // Historical GitHub archive
  'Katalogas': 0.20               // General business directory
};

/**
 * Calculates exponential time-decay factor (0.05 to 1.0)
 * Half-life is set to 48 hours (~2 days).
 * - Price from today (0-6 hours): decay ~ 1.0
 * - Price from 2 days ago: decay ~ 0.50
 * - Price from 7 days ago: decay ~ 0.125
 * - Price > 30 days ago: decay ~ 0.05
 */
export function getTimeDecay(updatedAtIso: string, referenceTimeMs = Date.now()): number {
  const dateMs = new Date(updatedAtIso).getTime();
  if (isNaN(dateMs) || dateMs <= 0) return 0.2;

  const ageHours = Math.max(0, (referenceTimeMs - dateMs) / (1000 * 60 * 60));
  const halfLifeHours = 48; // 2 days

  const decay = Math.pow(0.5, ageHours / halfLifeHours);
  // Floor at 0.05 for older historical context
  return Math.max(0.05, Math.min(1.0, decay));
}

/**
 * Sanity boundaries for Lithuanian fuel market (EUR / liter)
 */
const MARKET_BOUNDS: Record<FuelType, { min: number; max: number }> = {
  gasoline_95: { min: 1.45, max: 2.65 },
  diesel: { min: 1.45, max: 2.75 },
  lpg: { min: 0.50, max: 1.35 },
  gasoline_98: { min: 1.55, max: 2.85 },
  diesel_plus: { min: 1.55, max: 2.95 }
};

/**
 * Reconciles multiple price observations from different sources and timestamps
 * for a specific fuel type at a single gas station.
 *
 * Algorithm Steps:
 * 1. Filter out impossible prices outside market bounds.
 * 2. Calculate composite score = Authority Weight * Time Decay.
 * 3. Detect and discount outliers that deviate more than ±18% from the cluster median.
 * 4. Compute weighted median / weighted mean consensus.
 * 5. Determine confidence score (0 to 100%) based on source count, freshness, and agreement.
 */
export function estimateFuelPrice(
  fuelType: FuelType,
  observations: PriceObservation[],
  referenceTimeMs = Date.now()
): FuelPriceEntry | null {
  if (!observations || observations.length === 0) return null;

  const bounds = MARKET_BOUNDS[fuelType] || { min: 0.5, max: 3.0 };

  // Step 1: Filter out impossible or garbage prices
  const valid = observations.filter((o) => {
    return typeof o.price === 'number' && !isNaN(o.price) && o.price >= bounds.min && o.price <= bounds.max;
  });

  if (valid.length === 0) return null;

  // Single observation: directly use with calculated confidence
  if (valid.length === 1) {
    const o = valid[0];
    const decay = getTimeDecay(o.updatedAt, referenceTimeMs);
    const authority = SOURCE_AUTHORITY[o.source] || 0.70;
    const confidence = Math.round(Math.min(95, authority * decay * 100));

    return {
      price: Math.round(o.price * 1000) / 1000,
      currency: 'EUR',
      source: o.source,
      updatedAt: o.updatedAt,
      confidenceScore: Math.max(25, confidence),
      calculationMethod: authority >= 0.95 ? 'direct_official' : 'freshest_verified',
      sourceCount: 1,
      alternativePrices: []
    };
  }

  // Step 2: Compute composite weights for each observation
  const weightedObs = valid.map((o) => {
    const authority = SOURCE_AUTHORITY[o.source] || 0.70;
    const decay = getTimeDecay(o.updatedAt, referenceTimeMs);
    const totalWeight = authority * decay;

    return {
      ...o,
      weight: totalWeight
    };
  });

  // Step 3: Outlier rejection via median comparison
  const sortedPrices = [...valid].map((v) => v.price).sort((a, b) => a - b);
  const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

  // Discount observations that deviate > 18% from median (e.g., stale 2024 price)
  for (const item of weightedObs) {
    const deviation = Math.abs(item.price - medianPrice) / medianPrice;
    if (deviation > 0.18) {
      item.weight *= 0.10; // Heavily penalize outlier
    }
  }

  // Step 4: Check if there is an authoritative official source updated within 48h
  // Authoritative fast-path: use a high-authority source directly if it's fresh (decay >= 0.40, ~3.6 days)
  const officialSource = weightedObs.find(
    (o) => (SOURCE_AUTHORITY[o.source] || 0) >= 0.90 && getTimeDecay(o.updatedAt, referenceTimeMs) >= 0.40
  );

  let finalPrice: number;
  let calculationMethod: FuelPriceEntry['calculationMethod'];
  let primarySource: string;
  let primaryDate: string;

  if (officialSource) {
    finalPrice = officialSource.price;
    calculationMethod = 'direct_official';
    primarySource = officialSource.source;
    primaryDate = officialSource.updatedAt;
  } else {
    // Weighted average consensus across reporting sources
    const totalWeight = weightedObs.reduce((sum, o) => sum + o.weight, 0);

    if (totalWeight > 0) {
      const weightedSum = weightedObs.reduce((sum, o) => sum + o.price * o.weight, 0);
      finalPrice = weightedSum / totalWeight;
      calculationMethod = 'consensus_weighted';
    } else {
      finalPrice = medianPrice;
      calculationMethod = 'freshest_verified';
    }

    // Pick the observation with highest weight as primary attribution
    const highestWeightObs = [...weightedObs].sort((a, b) => b.weight - a.weight)[0];
    primarySource = highestWeightObs ? highestWeightObs.source : valid[0].source;
    primaryDate = highestWeightObs ? highestWeightObs.updatedAt : valid[0].updatedAt;
  }

  // Step 5: Confidence estimation
  // More agreeing sources + fresher data = higher confidence
  const priceSpread = Math.max(...valid.map((v) => v.price)) - Math.min(...valid.map((v) => v.price));
  const agreementBonus = priceSpread < 0.05 ? 15 : priceSpread < 0.10 ? 8 : -10;
  const freshestDecay = Math.max(...weightedObs.map((o) => getTimeDecay(o.updatedAt, referenceTimeMs)));

  let confidenceScore = Math.round(
    Math.min(99, Math.max(30, (freshestDecay * 65) + (Math.min(3, valid.length) * 10) + agreementBonus))
  );

  // Build alternatives list for UI transparency
  const alternatives = valid
    .filter((o) => o.source !== primarySource || Math.abs(o.price - finalPrice) > 0.005)
    .map((o) => ({
      source: o.source,
      price: Math.round(o.price * 1000) / 1000,
      updatedAt: o.updatedAt,
      weight: Math.round((weightedObs.find((w) => w.source === o.source)?.weight || 0.5) * 100) / 100
    }));

  return {
    price: Math.round(finalPrice * 1000) / 1000,
    currency: 'EUR',
    source: primarySource,
    updatedAt: primaryDate,
    confidenceScore,
    calculationMethod,
    sourceCount: valid.length,
    alternativePrices: alternatives
  };
}
