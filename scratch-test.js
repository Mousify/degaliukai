const { aggregateFuelData } = require('./lib/aggregate');

async function test() {
  try {
    console.log('Testing aggregation...');
    const result = await aggregateFuelData(true);
    console.log('Total stations:', result.totalStations);
    console.log('Sources online:', result.sourcesOnlineCount, '/', result.totalSourcesCount);
    console.log('Cheapest 95:', result.cheapest.gasoline_95);
    console.log('Cheapest Diesel:', result.cheapest.diesel);
    console.log('Cheapest LPG:', result.cheapest.lpg);
    console.log('Sample station:', result.stations[0].name, result.stations[0].prices);
  } catch (err) {
    console.error('Test error:', err);
  }
}

// Since aggregate.ts is TypeScript, let's test via ts-node or Next build.
