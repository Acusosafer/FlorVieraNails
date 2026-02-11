
import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant?: 'customer' | 'admin';
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, setActiveTab, variant = 'customer' }) => {
  const customerTabs: Tab[] = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'agendar', label: 'Agendar', icon: '📅' },
    { id: 'historial', label: 'Historial', icon: '📸' },
    { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
  ];

  const adminTabs: Tab[] = [
    { id: 'panel', label: 'Panel', icon: '📊' },
    { id: 'servicios', label: 'Servicios', icon: '💅' },
    { id: 'calculadora', label: 'Cotización', icon: '🧮' },
    { id: 'turnos', label: 'Turnos', icon: '📅' },
    { id: 'clientas', label: 'Clientas', icon: '👭' },
    { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
  ];

  const tabs = variant === 'admin' ? adminTabs : customerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-rose-100 px-2 py-3 flex justify-between items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${
            activeTab === tab.id ? 'text-rose-500 scale-105 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[8px] uppercase tracking-tighter whitespace-nowrap">{tab.label}</span>
          {activeTab === tab.id && (
            <div className="w-1 h-1 bg-rose-500 rounded-full animate-ping mt-1"></div>
          )}
        </button>
      ))}
    </div>
  );
};
