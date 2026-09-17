'use client';

import { useEffect, useRef } from 'react';
import styles from './DroneMap.module.css';

// Tipos para os drones e missões
interface DroneMarker {
  id: string;
  lat: number;
  lng: number;
  battery: number;
  status: string;
  model: string;
}

interface DroneMapProps {
  drones?: DroneMarker[];
}

export default function DroneMap({ drones = [] }: DroneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstance.current) return;

    // Importação dinâmica para evitar SSR issues com o Leaflet
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Mapa centrado em São Paulo (Brasil)
      const map = L.map(mapRef.current!, {
        center: [-23.5505, -46.6333],
        zoom: 12,
        zoomControl: false,
      });

      // Tile dark style - Stadia Maps Alidade Smooth Dark (gratuito, sem API key)
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://stamen.com">Stamen Design</a> &copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>',
        maxZoom: 20,
      }).addTo(map);

      // Zoom control customizado no canto inferior direito
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstance.current = map;

      // Adiciona drones mockados para demonstração visual
      const mockDrones: DroneMarker[] = [
        { id: 'drone-1', lat: -23.5505, lng: -46.6333, battery: 87, status: 'executing', model: 'DJI M300' },
        { id: 'drone-2', lat: -23.5618, lng: -46.6560, battery: 62, status: 'executing', model: 'DJI Mini 2' },
        { id: 'drone-3', lat: -23.5400, lng: -46.6200, battery: 95, status: 'available', model: 'DJI M300' },
      ];

      mockDrones.forEach(drone => addDroneMarker(L, map, drone));
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Função para adicionar/atualizar marcador de drone no mapa
  const addDroneMarker = (L: any, map: any, drone: DroneMarker) => {
    const batteryColor = drone.battery > 50 ? '#10b981' : drone.battery > 20 ? '#f59e0b' : '#ef4444';
    const statusColor = drone.status === 'executing' ? '#06b6d4' : '#10b981';

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Pulse ring -->
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: ${statusColor}22;
            border: 1px solid ${statusColor}55;
            animation: droneRing 2s infinite;
          "></div>
          <!-- Drone body -->
          <div style="
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #1a1d24, #2a2d36);
            border: 2px solid ${statusColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            z-index: 1;
            box-shadow: 0 0 12px ${statusColor}66;
          ">🚁</div>
          <!-- Battery badge -->
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            background: ${batteryColor};
            color: white;
            font-size: 9px;
            font-weight: 700;
            padding: 2px 4px;
            border-radius: 6px;
            z-index: 2;
            font-family: monospace;
          ">${drone.battery}%</div>
        </div>
        <style>
          @keyframes droneRing {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }
        </style>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([drone.lat, drone.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <div style="background: #1a1d24; color: #f3f4f6; border-radius: 8px; padding: 12px; min-width: 160px; font-family: 'Inter', sans-serif;">
          <strong style="color: #06b6d4;">${drone.model}</strong><br/>
          <small>ID: ${drone.id}</small><br/>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 8px 0;"/>
          🔋 Bateria: <strong style="color: ${batteryColor}">${drone.battery}%</strong><br/>
          📡 Status: <strong>${drone.status}</strong>
        </div>
      `, {
        className: 'drone-popup'
      });

    markersRef.current.set(drone.id, marker);
  };

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapRef} className={styles.map}></div>
      {/* Legenda */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dotCyan}></span> Em Missão
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotGreen}></span> Disponível
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotRed}></span> Manutenção
        </div>
      </div>
    </div>
  );
}
