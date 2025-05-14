import React from 'react';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { Navigation } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">Lunar Navigation Route Planner</h1>
        </div>
      </header>

      <div className="flex w-full mt-12">
        <Sidebar />
        <main className="flex-1">
          <Map />
        </main>
      </div>
    </div>
  );
}

export default App;