'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import styles from './page.module.css';

// Importação dinâmica do mapa (sem SSR) para evitar erros do Leaflet
const DroneMap = lazy(() => import('@/components/DroneMap/DroneMap'));

// Dados mockados de missões em andamento
const mockMissions = [
  { id: 'M-001', drone: 'DJI M300 #1', destination: 'Av. Paulista, 1000', eta: '4 min', status: 'executing', battery: 87 },
  { id: 'M-002', drone: 'DJI Mini 2 #2', destination: 'R. Augusta, 500', eta: '7 min', status: 'executing', battery: 62 },
  { id: 'M-003', drone: 'DJI M300 #3', destination: 'Ibirapuera Hub', eta: '—', status: 'available', battery: 95 },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  executing: { label: 'Em Voo', color: '#06b6d4' },
  available: { label: 'Disponível', color: '#10b981' },
  planning: { label: 'Planejando', color: '#8b5cf6' },
  failed: { label: 'Falha', color: '#ef4444' },
};

export default function OperatorDashboard() {
  const [currentTime, setCurrentTime] = useState('');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Relógio em tempo real
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);

    // Aguarda o cliente montar para carregar o mapa
    setMapReady(true);

    return () => clearInterval(interval);
  }, []);

  const activeMissions = mockMissions.filter(m => m.status === 'executing').length;

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar Lateral */}
      <aside className={`${styles.sidebar} glass-panel animate-fade-in`}>
        <div className={styles.logoArea}>
          <h2>Aether<span>OS</span></h2>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot}></span>
            System Online
          </div>
        </div>

        <nav className={styles.navigation}>
          <a href="#" className={styles.navItemActive}>🌍 Mapa Tático</a>
          <a href="#" className={styles.navItem}>🚁 Frota & Hubs</a>
          <a href="#" className={styles.navItem}>📋 Missões</a>
          <a href="#" className={styles.navItem}>🤖 IA & Compliance</a>
        </nav>

        {/* Stats na sidebar */}
        <div className={styles.sidebarStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: '#06b6d4' }}>3</span>
            <span className={styles.statLabel}>Drones Ativos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: '#8b5cf6' }}>{activeMissions}</span>
            <span className={styles.statLabel}>Missões</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: '#10b981' }}>98%</span>
            <span className={styles.statLabel}>Uptime</span>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className={styles.mainArea}>
        {/* Header */}
        <header className={`${styles.header} glass-panel animate-fade-in`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.headerTitle}>
            <h1>Visão Tática Global</h1>
            <p>Monitoramento de frota e despachos de inteligência artificial em tempo real</p>
          </div>
          <div className={styles.headerWidgets}>
            <div className={styles.widget}>
              <span className={styles.widgetLabel}>Horário Local</span>
              <span className={styles.widgetValue}>{currentTime || '--:--:--'}</span>
            </div>
            <div className={styles.widget}>
              <span className={styles.widgetLabel}>Drones em Voo</span>
              <span className={styles.widgetValue} style={{ color: 'var(--accent-cyan)' }}>{activeMissions}</span>
            </div>
          </div>
        </header>

        {/* Grade de Conteúdo */}
        <div className={styles.contentGrid}>
          {/* O Mapa Real com Leaflet */}
          <div className={`${styles.mapContainer} glass-panel animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            {mapReady ? (
              <Suspense fallback={
                <div className={styles.placeholderMap}>
                  <div className={styles.radarSweep}></div>
                  <p>Carregando Motor Geoespacial...</p>
                </div>
              }>
                <DroneMap />
              </Suspense>
            ) : (
              <div className={styles.placeholderMap}>
                <div className={styles.radarSweep}></div>
                <p>Iniciando...</p>
              </div>
            )}
          </div>

          {/* Painel Lateral Direito (Missões Ativas) */}
          <div className={`${styles.sidePanel} glass-panel animate-fade-in`} style={{ animationDelay: '0.3s' }}>
            <h3>Fila de Despacho (IA)</h3>

            <div className={styles.missionList}>
              {mockMissions.map(mission => {
                const sc = statusConfig[mission.status];
                return (
                  <div key={mission.id} className={styles.missionCard}>
                    <div className={styles.missionHeader}>
                      <span className={styles.missionId}>{mission.id}</span>
                      <span className={styles.missionStatus} style={{ color: sc.color, borderColor: `${sc.color}40`, background: `${sc.color}15` }}>
                        {sc.label}
                      </span>
                    </div>
                    <p className={styles.missionDrone}>🚁 {mission.drone}</p>
                    <p className={styles.missionDest}>📍 {mission.destination}</p>
                    <div className={styles.missionFooter}>
                      <span>ETA: <strong>{mission.eta}</strong></span>
                      <span style={{ color: mission.battery > 50 ? '#10b981' : '#f59e0b' }}>
                        🔋 {mission.battery}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
