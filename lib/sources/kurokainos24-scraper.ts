import { SourceStatus } from '../types';
import { fetchWithRetry } from '../utils';

export interface Kurokainos24Result {
  cityAverages: Array<{
    city: string;
    stationsCount: number;
    gasoline_95: number;
    diesel: number;
    lpg?: number;
  }>;
  networkAverages: Array<{
    network: string;
    stationsCount: number;
    gasoline_95: number;
    diesel: number;
    lpg?: number;
  }>;
  status: SourceStatus;
}

/**
 * Scrapes city averages and chain network statistics from kurokainos24.lt
 */
export async function scrapeKurokainos24(): Promise<Kurokainos24Result> {
  const startTime = Date.now();
  const url = 'https://kurokainos24.lt';

  const sourceStatus: SourceStatus = {
    id: 'kurokainos24-scraper',
    name: 'Kurokainos24.lt Stebėsena',
    description: 'Lietuvos miestų ir degalinių tinklų kainų indeksas',
    type: 'cross_check',
    status: 'online',
    stationsCount: 0,
    lastChecked: new Date().toISOString()
  };

  try {
    const res = await fetchWithRetry(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      next: { revalidate: 1800 }
    });

    sourceStatus.latencyMs = Date.now() - startTime;

    if (!res.ok) {
      sourceStatus.status = 'degraded';
      sourceStatus.errorMessage = `HTTP ${res.status}`;
      return { cityAverages: [], networkAverages: [], status: sourceStatus };
    }

    const html = await res.text();
    sourceStatus.lastSuccess = new Date().toISOString();

    const cityAverages: Kurokainos24Result['cityAverages'] = [];
    const networkAverages: Kurokainos24Result['networkAverages'] = [];

    // Parse tables
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: string[] = [];
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tableRegex.exec(html)) !== null) {
      tables.push(tMatch[1]);
    }

    // Helper to clean price numbers: "1,930 €/l" -> 1.930
    function parsePriceLt(text: string): number | undefined {
      const m = text.match(/([0-9]+[,\.][0-9]{2,3})/);
      if (!m) return undefined;
      const num = parseFloat(m[1].replace(',', '.'));
      return isNaN(num) ? undefined : num;
    }

    // Table 0: Miestai (Vilnius, Kaunas, Klaipėda...)
    if (tables[0]) {
      const rows = tables[0].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      for (const row of rows) {
        if (row.includes('<th')) continue;
        const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        if (cells.length >= 4 && cells[0] && cells[1] && cells[2] && cells[3]) {
          const cityText = cells[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const p95Text = cells[1].replace(/<[^>]+>/g, ' ');
          const dieselText = cells[2].replace(/<[^>]+>/g, ' ');
          const lpgText = cells[3].replace(/<[^>]+>/g, ' ');

          const cityName = cityText.split(/\s+/)[0] || '';
          const countMatch = cityText.match(/([0-9]+)\s*degalin/i);
          const count = countMatch ? parseInt(countMatch[1], 10) : 0;

          const p95 = parsePriceLt(p95Text);
          const diesel = parsePriceLt(dieselText);
          const lpg = parsePriceLt(lpgText);

          if (cityName && p95 && diesel) {
            cityAverages.push({
              city: cityName,
              stationsCount: count,
              gasoline_95: p95,
              diesel,
              lpg
            });
          }
        }
      }
    }

    // Table 1: Degalinių tinklai (Viada, Baltic Petroleum, Circle K, Neste...)
    if (tables[1]) {
      const rows = tables[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      for (const row of rows) {
        if (row.includes('<th')) continue;
        const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        if (cells.length >= 4 && cells[0] && cells[1] && cells[2] && cells[3]) {
          const netText = cells[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const p95Text = cells[1].replace(/<[^>]+>/g, ' ');
          const dieselText = cells[2].replace(/<[^>]+>/g, ' ');
          const lpgText = cells[3].replace(/<[^>]+>/g, ' ');

          const networkName = netText.replace(/[0-9]+\s*degalin.*/i, '').trim();
          const countMatch = netText.match(/([0-9]+)\s*degalin/i);
          const count = countMatch ? parseInt(countMatch[1], 10) : 0;

          const p95 = parsePriceLt(p95Text);
          const diesel = parsePriceLt(dieselText);
          const lpg = parsePriceLt(lpgText);

          if (networkName && p95 && diesel) {
            networkAverages.push({
              network: networkName,
              stationsCount: count,
              gasoline_95: p95,
              diesel,
              lpg
            });
          }
        }
      }
    }

    sourceStatus.stationsCount = cityAverages.reduce((acc, c) => acc + c.stationsCount, 0);

    return {
      cityAverages,
      networkAverages,
      status: sourceStatus
    };
  } catch (err: any) {
    sourceStatus.status = 'degraded';
    sourceStatus.latencyMs = Date.now() - startTime;
    sourceStatus.errorMessage = err.message || 'Klaida nuskaitant kurokainos24.lt';
    return { cityAverages: [], networkAverages: [], status: sourceStatus };
  }
}
