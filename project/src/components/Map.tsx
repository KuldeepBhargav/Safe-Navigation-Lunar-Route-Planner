import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouteStore } from '../store/routeStore';
import { MapPin, Flag, CircleDot } from 'lucide-react';

// Note: In a real application, this would be in an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2V5IiwibWFwYm94Ijp0cnVlfQ.example';

// Lunar south pole coordinates (85.28° S, 31.20° E)
const LANDING_SITE = [31.20, -85.28];

// Chandrayaan imagery URLs (these would be actual URLs in production)
const LUNAR_IMAGERY = {
  optical: 'https://lunar.gsfc.nasa.gov/tiles/south-pole/optical/{z}/{x}/{y}.png',
  topographic: 'https://lunar.gsfc.nasa.gov/tiles/south-pole/dem/{z}/{x}/{y}.png',
  illumination: 'https://lunar.gsfc.nasa.gov/tiles/south-pole/illumination/{z}/{x}/{y}.png'
};

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { points, segments, obstacles } = useRouteStore();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: []
      },
      center: LANDING_SITE,
      zoom: 16,
      pitch: 45,
      antialias: true,
      projection: { name: 'mercator' } // We'll handle polar projection distortion in the data
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add optical imagery layer
      map.current.addSource('lunar-optical', {
        type: 'raster',
        tiles: [LUNAR_IMAGERY.optical],
        tileSize: 256,
        attribution: 'Imagery: ISRO/Chandrayaan-2,3'
      });

      map.current.addLayer({
        id: 'lunar-optical',
        type: 'raster',
        source: 'lunar-optical',
        paint: {
          'raster-opacity': 1
        }
      });

      // Add topographic data layer
      map.current.addSource('lunar-topographic', {
        type: 'raster',
        tiles: [LUNAR_IMAGERY.topographic],
        tileSize: 256
      });

      map.current.addLayer({
        id: 'lunar-topographic',
        type: 'raster',
        source: 'lunar-topographic',
        paint: {
          'raster-opacity': 0.5
        }
      });

      // Add illumination data layer
      map.current.addSource('lunar-illumination', {
        type: 'raster',
        tiles: [LUNAR_IMAGERY.illumination],
        tileSize: 256
      });

      map.current.addLayer({
        id: 'lunar-illumination',
        type: 'raster',
        source: 'lunar-illumination',
        paint: {
          'raster-opacity': 0.3
        }
      });

      // Add landing site marker
      new mapboxgl.Marker({
        color: '#FF0000',
        scale: 1.2
      })
        .setLngLat(LANDING_SITE)
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Landing Site</h3><p>85.28° S, 31.20° E</p>'))
        .addTo(map.current);

      // Add layer controls
      const layers = [
        { id: 'lunar-optical', name: 'Optical Imagery' },
        { id: 'lunar-topographic', name: 'Topographic Data' },
        { id: 'lunar-illumination', name: 'Illumination Map' }
      ];

      const layerControl = document.createElement('div');
      layerControl.className = 'absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg';
      
      layers.forEach(layer => {
        const container = document.createElement('div');
        container.className = 'flex items-center gap-2 mb-2';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = layer.id;
        checkbox.checked = true;
        checkbox.className = 'form-checkbox h-4 w-4 text-blue-500';
        
        checkbox.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          const visibility = target.checked ? 'visible' : 'none';
          if (map.current) {
            map.current.setLayoutProperty(layer.id, 'visibility', visibility);
          }
        });
        
        const label = document.createElement('label');
        label.htmlFor = layer.id;
        label.textContent = layer.name;
        label.className = 'text-sm text-gray-700';
        
        container.appendChild(checkbox);
        container.appendChild(label);
        layerControl.appendChild(container);
      });
      
      mapContainer.current?.appendChild(layerControl);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Update markers and route lines when points or segments change
    points.forEach(point => {
      if (point.type !== 'landing') {
        new mapboxgl.Marker({ 
          color: point.type === 'stop' ? '#10B981' : '#3B82F6',
          scale: 0.8
        })
          .setLngLat(point.coordinates)
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<h3>${point.description}</h3>
               ${point.scientificValue ? `<p>${point.scientificValue}</p>` : ''}
               <p>Illumination: ${point.illumination}%</p>`
            )
          )
          .addTo(map.current);
      }
    });

    // Draw route lines
    if (segments.length > 0) {
      const routeCoordinates = segments.map(segment => {
        const start = points.find(p => p.id === segment.startPoint);
        const end = points.find(p => p.id === segment.endPoint);
        return [start?.coordinates, end?.coordinates].filter(Boolean);
      }).flat();

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 3,
          'line-dasharray': [2, 1]
        }
      });
    }
  }, [points, segments]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Route Statistics</h3>
        <div className="space-y-2">
          <p>Total Distance: {calculateTotalDistance(segments)}m</p>
          <p>Scientific Stops: {points.filter(p => p.type === 'stop').length}</p>
          <p>Obstacles Avoided: {obstacles.length}</p>
        </div>
      </div>
    </div>
  );
}

function calculateTotalDistance(segments: any[]): number {
  return segments.reduce((acc, segment) => acc + segment.distance, 0);
}