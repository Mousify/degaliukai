import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveNews } from '@/lib/sources/news-scraper';

export async function GET(request: NextRequest) {
  try {
    const result = await fetchLiveNews();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Nepavyko gauti naujienų sąrašo', details: error.message },
      { status: 500 }
    );
  }
}
