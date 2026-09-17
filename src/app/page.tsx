'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function OperatorDashboard() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Atualiza o relógio no topo
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      </aside>

      {/* Área Principal */}
      <main className={styles.mainArea}>
        {/* Header */}
        <header className={`${styles.header} glass-panel animate-fade-in`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.headerTitle}>
            <h1>Visão Tática Global</h1>
            <p>Monitoramento de frota e despachos de inteligência artificial</p>
          </div>
          <div className={styles.headerWidgets}>
            <div className={styles.widget}>
              <span className={styles.widgetLabel}>Local Time</span>
              <span className={styles.widgetValue}>{currentTime || '--:--:--'}</span>
            </div>
            <div className={styles.widget}>
              <span className={styles.widgetLabel}>Drones em Voo</span>
              <span className={styles.widgetValue} style={{ color: 'var(--accent-cyan)' }}>0</span>
            </div>
          </div>
        </header>

        {/* Grade de Conteúdo */}
        <div className={styles.contentGrid}>
          {/* O Mapa (ocupando a maior parte) */}
          <div className={`${styles.mapContainer} glass-panel animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.placeholderMap}>
              <div className={styles.radarSweep}></div>
              <p>Iniciando Motor Geespacial...</p>
              <p className={styles.subtext}>Aguardando feed de telemetria</p>
            </div>
          </div>

          {/* Painel Lateral Direito (Missões Recentes) */}
          <div className={`${styles.sidePanel} glass-panel animate-fade-in`} style={{ animationDelay: '0.3s' }}>
            <h3>Fila de Despacho (IA)</h3>
            <div className={styles.emptyState}>
              <div className={styles.spinner}></div>
              <p>Aguardando novos pedidos via webhook...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
