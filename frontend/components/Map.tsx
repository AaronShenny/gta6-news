"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue with Webpack/Next
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const POIS = [
  { id: 1, name: "Vice City Beach", lat: 25.7906, lng: -80.1300, desc: "Rumored location of the opening scene.", type: "LEAK" },
  { id: 2, name: "Port Gellhorn", lat: 26.1420, lng: -81.7948, desc: "Swamp town seen in the trailer.", type: "CONFIRMED" },
  { id: 3, name: "Kelly County", lat: 25.4000, lng: -80.5000, desc: "Large rural county covering the south map.", type: "RUMOR" }
];

export default function SpeculationMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-zinc-900 animate-pulse rounded-[2rem]"></div>;
  }

  return (
    <div className="w-full h-[70vh] rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl relative z-10">
      <MapContainer 
        center={[25.7617, -80.1918]} // Miami coordinates as base
        zoom={9} 
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        className="z-0"
      >
        {/* Dark mode styled map tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {POIS.map(poi => (
          <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-vice-pink bg-vice-pink/10 px-2 py-1 rounded-full mb-2 inline-block">
                  {poi.type}
                </span>
                <h3 className="font-display font-bold text-lg mb-1 leading-tight text-gray-800">{poi.name}</h3>
                <p className="text-sm text-gray-600 m-0 leading-snug">{poi.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
