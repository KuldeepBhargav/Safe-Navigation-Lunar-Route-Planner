import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import { MapPin, Flag, AlertTriangle, Plus, Save, Download } from 'lucide-react';

export function Sidebar() {
  const { points, obstacles, addPoint } = useRouteStore();
  const [newPoint, setNewPoint] = useState({
    description: '',
    scientificValue: '',
    illumination: 100
  });

  const handleAddPoint = () => {
    if (!newPoint.description) return;
    
    addPoint({
      id: `point-${Date.now()}`,
      coordinates: [31.20, -85.28], // Default to landing site, user can drag on map
      type: 'stop',
      description: newPoint.description,
      scientificValue: newPoint.scientificValue,
      illumination: newPoint.illumination
    });

    setNewPoint({
      description: '',
      scientificValue: '',
      illumination: 100
    });
  };

  const handleExport = () => {
    const data = {
      points,
      obstacles,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lunar-route-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-80 bg-white h-full p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-500" />
        Lunar Navigation Planner
      </h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Stop</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newPoint.description}
              onChange={(e) => setNewPoint(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Scientific site description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scientific Value
            </label>
            <input
              type="text"
              value={newPoint.scientificValue}
              onChange={(e) => setNewPoint(prev => ({ ...prev, scientificValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Scientific significance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Illumination (%)
            </label>
            <input
              type="number"
              value={newPoint.illumination}
              onChange={(e) => setNewPoint(prev => ({ ...prev, illumination: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
            />
          </div>
          <button
            onClick={handleAddPoint}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Stop
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Route Points</h3>
        <div className="space-y-2">
          {points.map((point) => (
            <div
              key={point.id}
              className="p-3 bg-gray-50 rounded-lg flex items-start gap-2"
            >
              {point.type === 'landing' && <MapPin className="w-5 h-5 text-blue-500" />}
              {point.type === 'stop' && <Flag className="w-5 h-5 text-green-500" />}
              <div>
                <p className="font-medium">{point.description}</p>
                {point.scientificValue && (
                  <p className="text-sm text-gray-600">{point.scientificValue}</p>
                )}
                <p className="text-sm text-gray-500">
                  Illumination: {point.illumination}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Obstacles</h3>
        <div className="space-y-2">
          {obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="p-3 bg-gray-50 rounded-lg flex items-start gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium capitalize">{obstacle.type}</p>
                <p className="text-sm text-gray-600">
                  Size: {obstacle.size}m
                </p>
                <p className="text-sm text-gray-500">
                  Risk Level: {obstacle.risk}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Route Data
        </button>
      </div>
    </div>
  );
}