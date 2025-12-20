/**
 * Geo Utilities
 * Functions for geographic calculations and formatting
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles (use 6371 for kilometers)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance - Distance in miles
 * @returns Formatted string (e.g., "2.3 mi", "< 0.1 mi")
 */
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return "< 0.1 mi";
  }
  return `${distance.toFixed(1)} mi`;
}

/**
 * Geocode an address using Mapbox Geocoding API
 * Converts an address string to lat/lng coordinates
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN environment variable
 */
export async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      features: Array<{
        center: [number, number]; // [longitude, latitude]
      }>;
    };

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
