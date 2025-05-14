import { create } from 'zustand';
import { RoutePoint, RouteSegment, Obstacle } from '../types';

interface RouteState {
  points: RoutePoint[];
  segments: RouteSegment[];
  obstacles: Obstacle[];
  addPoint: (point: RoutePoint) => void;
  removePoint: (id: string) => void;
  updatePoint: (id: string, point: Partial<RoutePoint>) => void;
  addSegment: (segment: RouteSegment) => void;
  addObstacle: (obstacle: Obstacle) => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  points: [
    {
      id: 'landing',
      coordinates: [31.20, -85.28],
      type: 'landing',
      description: 'Primary Landing Site',
      illumination: 100
    }
  ],
  segments: [],
  obstacles: [],
  
  addPoint: (point) =>
    set((state) => ({ points: [...state.points, point] })),
    
  removePoint: (id) =>
    set((state) => ({
      points: state.points.filter((p) => p.id !== id),
      segments: state.segments.filter(
        (s) => s.startPoint !== id && s.endPoint !== id
      ),
    })),
    
  updatePoint: (id, point) =>
    set((state) => ({
      points: state.points.map((p) =>
        p.id === id ? { ...p, ...point } : p
      ),
    })),
    
  addSegment: (segment) =>
    set((state) => ({ segments: [...state.segments, segment] })),
    
  addObstacle: (obstacle) =>
    set((state) => ({ obstacles: [...state.obstacles, obstacle] })),
}));