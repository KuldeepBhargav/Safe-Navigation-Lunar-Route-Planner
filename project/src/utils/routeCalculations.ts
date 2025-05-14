import * as turf from '@turf/turf';
import { RoutePoint, RouteSegment, Obstacle } from '../types';

export function calculateSafeRoute(
  startPoint: RoutePoint,
  endPoint: RoutePoint,
  obstacles: Obstacle[]
): RouteSegment[] {
  // Convert points to GeoJSON
  const start = turf.point([startPoint.coordinates[0], startPoint.coordinates[1]]);
  const end = turf.point([endPoint.coordinates[0], endPoint.coordinates[1]]);
  
  // Create obstacle polygons
  const obstacleFeatures = obstacles.map(obstacle => {
    const center = obstacle.coordinates;
    const radius = obstacle.size / 2;
    return turf.circle(center, radius, { units: 'meters' });
  });
  
  // Calculate initial direct path
  const directPath = turf.lineString([
    start.geometry.coordinates,
    end.geometry.coordinates
  ]);
  
  // Check for intersections with obstacles
  const intersects = obstacleFeatures.some(obstacle => 
    turf.booleanIntersects(directPath, obstacle)
  );
  
  if (!intersects) {
    // If no obstacles, return direct path
    return [{
      id: `segment-${startPoint.id}-${endPoint.id}`,
      startPoint: startPoint.id,
      endPoint: endPoint.id,
      distance: turf.length(directPath, { units: 'meters' }),
      obstacles: [],
      illumination: calculateAverageIllumination([startPoint, endPoint])
    }];
  }
  
  // If there are obstacles, implement A* pathfinding
  // This is a simplified version - in a real application, 
  // you'd want a more sophisticated pathfinding algorithm
  return findAlternativePath(startPoint, endPoint, obstacles);
}

function calculateAverageIllumination(points: RoutePoint[]): number {
  const sum = points.reduce((acc, point) => acc + (point.illumination || 0), 0);
  return sum / points.length;
}

function findAlternativePath(
  start: RoutePoint,
  end: RoutePoint,
  obstacles: Obstacle[]
): RouteSegment[] {
  // Implement A* pathfinding algorithm here
  // This is a placeholder that returns a simple path
  return [{
    id: `segment-${start.id}-${end.id}`,
    startPoint: start.id,
    endPoint: end.id,
    distance: 100, // placeholder
    obstacles: [],
    illumination: calculateAverageIllumination([start, end])
  }];
}