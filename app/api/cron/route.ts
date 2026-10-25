import { NextRequest, NextResponse } from 'next/server';
import { aggregateFuelData } from '@/lib/aggregate';

export async function GET(request: NextRequest) {
  try {
    // Verify Vercel Cron authentication if CRON_SECRET is configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startedAt = Date.now();
    const data = await aggregateFuelData(true);
    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      message: 'Degalai aggregation cache successfully refreshed via Cron',
      timestamp: data.timestamp,
      totalStations: data.totalStations,
      sourcesOnline: `${data.sourcesOnlineCount}/${data.totalSourcesCount}`,
      durationMs
    });
  } catch (error: any) {
    console.error('[CRON ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
