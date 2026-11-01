import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveDiscounts } from '@/lib/sources/discounts-scraper';

export async function GET(request: NextRequest) {
  try {
    const result = await fetchLiveDiscounts();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    });
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Nepavyko gauti nuolaidų sąrašo', details: error.message },
      { status: 500 }
    );
  }
}
