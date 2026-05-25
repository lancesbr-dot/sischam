import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
<<<<<<< HEAD
import { Monitor, Settings as SettingsIcon, LayoutPanelLeft, Bell, Stethoscope } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import TVDisplay from './components/TVDisplay';
import Settings from './components/Settings';
import DoctorPanel from './components/DoctorPanel';
=======
import { Monitor, Settings as SettingsIcon, LayoutPanelLeft, Bell } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import TVDisplay from './components/TVDisplay';
import Settings from './components/Settings';
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
import { io } from 'socket.io-client';

// Initialize socket globally or in a context
export const socket = io();

function AppContent() {
<<<<<<< HEAD
  const isPlainPath = window.location.pathname === '/display' || window.location.pathname === '/doctor';

  if (isPlainPath) {
=======
  const isDisplay = window.location.pathname === '/display';

  if (isDisplay) {
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    return (
      <Routes>
        <Route path="/" element={<ControlPanel />} />
        <Route path="/display" element={<TVDisplay />} />
<<<<<<< HEAD
        <Route path="/doctor" element={<DoctorPanel />} />
=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
        <Route path="/settings" element={<Settings />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <header className="bg-indigo-700 text-white p-4 mx-6 mt-6 rounded-2xl shadow-lg flex items-center justify-between sticky top-6 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl text-indigo-700">
            <Bell className="w-6 h-6 stroke-[3px]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">SISCHAM</h1>
            <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest">Sistema Inteligente de Chamada</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-200 transition-colors">
              <LayoutPanelLeft className="w-4 h-4" />
              Controle
            </Link>
<<<<<<< HEAD
            <Link to="/doctor" target="_blank" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-200 transition-colors">
              <Stethoscope className="w-4 h-4" />
              Painel Médico
            </Link>
            <Link to="/display" target="_blank" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-200 transition-colors">
              <Monitor className="w-4 h-4 text-indigo-200" />
              Painel TV
            </Link>
            <Link to="/settings" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-200 transition-colors">
              <SettingsIcon className="w-4 h-4 text-indigo-300" />
=======
            <Link to="/display" target="_blank" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-200 transition-colors">
              <Monitor className="w-4 h-4" />
              Painel TV
            </Link>
            <Link to="/settings" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-200 transition-colors">
              <SettingsIcon className="w-4 h-4" />
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
              Configurações
            </Link>
          </nav>
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-indigo-400 shadow-inner text-sm font-bold">
            OP
          </div>
        </div>
      </header>

      <main className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<ControlPanel />} />
          <Route path="/display" element={<TVDisplay />} />
<<<<<<< HEAD
          <Route path="/doctor" element={<DoctorPanel />} />
=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
