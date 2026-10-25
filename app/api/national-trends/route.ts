import { NextResponse } from 'next/server';
import { fetchFuelPricesEuNational } from '@/lib/sources/fuel-prices-eu-national';

export async function GET() {
  try {
    const data = await fetchFuelPricesEuNational();
    return NextResponse.json({
      averages: data.averages,
      trends: data.trends,
      status: data.status,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/national-trends] Error:', error);
    return NextResponse.json(
      { error: 'Klaida gaunant nacionalines tendencijas', details: error.message },
      { status: 500 }
    );
  }
}
