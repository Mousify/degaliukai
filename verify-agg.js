const { aggregateFuelData } = require('./lib/aggregate');

async function main() {
  console.log('Running aggregateFuelData()...');
  const t0 = Date.now();
  const res = await aggregateFuelData(true);
  console.log('Aggregation completed in', Date.now() - t0, 'ms');
  console.log('Total stations:', res.totalStations);
  console.log('Cheapest gasoline 95:', res.cheapest.gasoline_95);
  console.log('Cheapest diesel:', res.cheapest.diesel);
  console.log('Cheapest LPG:', res.cheapest.lpg);
  console.log('National Averages:', res.nationalAverages);
  console.log('Sources:', res.sourceStatuses.map(s => ({ name: s.name, status: s.status, count: s.stationsCount })));

  const sample = res.stations.slice(0, 3).map(s => ({
    name: s.name,
    brand: s.brand,
    address: s.address,
    city: s.city,
    prices: s.prices,
    sources: s.sourcesReported
  }));
  console.log('Sample stations:', JSON.stringify(sample, null, 2));
}

main().catch(console.error);
