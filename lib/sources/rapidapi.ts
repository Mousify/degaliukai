import { SourceStatus } from '../types';

export interface RapidApiResult {
  data?: any;
  status: SourceStatus;
}

export async function fetchRapidApiFuelPrices(): Promise<RapidApiResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || 'fuel-prices-europe.p.rapidapi.com';

  const sourceStatus: SourceStatus = {
    id: 'rapidapi-valev-labs',
    name: 'RapidAPI (Valev Labs)',
    description: 'Europos kuro kainų API (reikalingas API raktas)',
    type: 'cross_check',
    status: apiKey ? 'online' : 'disabled',
    stationsCount: 0,
    lastChecked: new Date().toISOString()
  };

  if (!apiKey) {
    sourceStatus.status = 'disabled';
    sourceStatus.errorMessage = 'RAPIDAPI_KEY kintamasis nenurodytas (pasirenkamas šaltinis)';
    return { status: sourceStatus };
  }

  const startTime = Date.now();
  try {
    const res = await fetch(`https://${apiHost}/lithuania`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      },
      next: { revalidate: 3600 }
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { status: sourceStatus };
    }

    const data = await res.json();
    sourceStatus.lastSuccess = new Date().toISOString();

    return {
      data,
      status: sourceStatus
    };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Nepavyko susisiekti su RapidAPI';
    return { status: sourceStatus };
  }
}
