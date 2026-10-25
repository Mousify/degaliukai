import { NextRequest, NextResponse } from 'next/server';
import { aggregateFuelData } from '@/lib/aggregate';
import { calculateDistance } from '@/lib/utils';
import { FuelType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';
    const fuelType = (searchParams.get('fuel') as FuelType) || 'gasoline_95';
    const brand = searchParams.get('brand') || '';
    const city = searchParams.get('city') || '';
    const query = (searchParams.get('q') || '').toLowerCase().trim();
    const sort = searchParams.get('sort') || 'price_asc';
    
    // User GPS coordinates for "Near Me"
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const maxDistanceKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null;

    const data = await aggregateFuelData(forceRefresh);

    let stations = data.stations.map((s) => {
      let distanceKm: number | undefined;
      if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
        distanceKm = calculateDistance(userLat, userLng, s.lat, s.lng);
      }
      return {
        ...s,
        distanceKm
      };
    });

    // 1. Filter by Brand
    if (brand && brand !== 'all') {
      stations = stations.filter(
        (s) => s.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // 2. Filter by City
    if (city && city !== 'all') {
      stations = stations.filter(
        (s) => s.city.toLowerCase() === city.toLowerCase()
      );
    }

    // 3. Search Query (name, address, city)
    if (query) {
      stations = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.brand.toLowerCase().includes(query)
      );
    }

    // 4. Distance Radius Filter (if GPS enabled and radius specified)
    if (maxDistanceKm && maxDistanceKm > 0) {
      stations = stations.filter(
        (s) => s.distanceKm !== undefined && s.distanceKm <= maxDistanceKm
      );
    }

    // 5. Sorting
    stations.sort((a, b) => {
      const priceA = a.prices[fuelType]?.price ?? 999;
      const priceB = b.prices[fuelType]?.price ?? 999;

      switch (sort) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'distance':
          return (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999);
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return priceA - priceB;
      }
    });

    return NextResponse.json({
      ...data,
      filteredStationsCount: stations.length,
      stations
    });
  } catch (error: any) {
    console.error('[API /api/prices] Error:', error);
    return NextResponse.json(
      { error: 'Nepavyko nuskaityti degalų duomenų', details: error.message },
      { status: 500 }
    );
  }
}
