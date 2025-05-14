export interface RoutePoint {
  id: string;
  coordinates: [number, number];
  type: 'landing' | 'stop' | 'endpoint';
  description: string;
  scientificValue?: string;
  illumination?: number; // 0-100%
}

export interface RouteSegment {
  id: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  obstacles: Obstacle[];
  illumination: number;
}

export interface Obstacle {
  id: string;
  type: 'boulder' | 'crater' | 'steep-slope';
  coordinates: [number, number];
  size: number;
  risk: 'low' | 'medium' | 'high';
}