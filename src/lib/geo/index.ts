/**
 * MISTRI Geospatial Utilities & Geodesic Calculators
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

// Default Coordinates for Initial Service Districts
export const DEFAULT_DISTRICT_COORDINATES: Record<string, Coordinates> = {
  thakurgaon: { latitude: 26.0336, longitude: 88.4617 },
  panchagarh: { latitude: 26.3411, longitude: 88.5542 },
  dinajpur: { latitude: 25.6279, longitude: 88.6332 },
}

/**
 * Calculates Great-Circle distance between two points on Earth using Haversine formula
 * Returns distance in meters
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3 // Earth radius in meters
  const phi1 = (coord1.latitude * Math.PI) / 180
  const phi2 = (coord2.latitude * Math.PI) / 180
  const deltaPhi = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const deltaLambda = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calculates bearing / heading in degrees (0 - 360) from coord1 to coord2
 */
export function calculateBearing(coord1: Coordinates, coord2: Coordinates): number {
  const phi1 = (coord1.latitude * Math.PI) / 180
  const phi2 = (coord2.latitude * Math.PI) / 180
  const deltaLambda = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  const theta = Math.atan2(y, x)
  return ((theta * 180) / Math.PI + 360) % 360
}

/**
 * Estimated travel time in minutes based on average speed (e.g. 25 km/h for bike/van in local towns)
 */
export function estimateTravelTimeMinutes(distanceMeters: number, averageSpeedKmh = 25): number {
  const speedMetersPerMin = (averageSpeedKmh * 1000) / 60
  const minutes = Math.ceil(distanceMeters / speedMetersPerMin)
  return Math.max(1, minutes)
}

/**
 * Generates an external Google Maps turn-by-turn direction URL
 */
export function generateGoogleMapsDirectionUrl(
  origin: Coordinates,
  destination: Coordinates
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
}

