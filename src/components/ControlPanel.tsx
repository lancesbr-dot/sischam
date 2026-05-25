import React, { useState, useEffect } from 'react';
import { socket } from '../App';
<<<<<<< HEAD
import { 
  RotateCcw, 
  History as HistoryIcon, 
  UserPlus, 
  Volume2, 
  Trash2, 
  Plus, 
  Check, 
  Edit3, 
  UserCheck, 
  X, 
  AlertCircle, 
  Sparkles, 
  Activity,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
=======
import { Play, RotateCcw, History as HistoryIcon, UserPlus, Volume2, Trash2 } from 'lucide-react';
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
import { motion, AnimatePresence } from 'motion/react';

export default function ControlPanel() {
  const [password, setPassword] = useState('001');
  const [counter, setCounter] = useState('01');
  const [history, setHistory] = useState<any[]>([]);
  const [lastCalled, setLastCalled] = useState<any>(null);

<<<<<<< HEAD
  // Availability state
  const [availability, setAvailability] = useState<any[]>([]);
  const [isEditingRoom, setIsEditingRoom] = useState<any>(null); // { id, room, doctor, status }
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ room: '', doctor: '', status: 'available' });
  const [routingMessage, setRoutingMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fetchAvailability = () => {
    fetch('/api/availability')
      .then(res => res.json())
      .then(data => setAvailability(data || []))
      .catch(err => console.error('Error fetching availability:', err));
  };

  useEffect(() => {
    // Initial fetch
=======
  useEffect(() => {
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        if (data.length > 0) setLastCalled(data[0]);
      });

<<<<<<< HEAD
    fetchAvailability();

    // Sockets sync
=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    socket.on('new-call', (data) => {
      setHistory(prev => [data, ...prev].slice(0, 10));
      setLastCalled(data);
    });

    socket.on('history-cleared', () => {
      setHistory([]);
      setLastCalled(null);
    });

<<<<<<< HEAD
    socket.on('availability-updated', () => {
      fetchAvailability();
    });

    return () => {
      socket.off('new-call');
      socket.off('history-cleared');
      socket.off('availability-updated');
=======
    return () => {
      socket.off('new-call');
      socket.off('history-cleared');
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    };
  }, []);

  const handleClearHistory = async () => {
    if (confirm('Deseja realmente limpar todo o histórico de chamadas? Esta ação não pode ser desfeita.')) {
      try {
        await fetch('/api/history', { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
  };

  const handleCall = () => {
    socket.emit('call-password', {
      number: password,
      counter: counter
    });
    
    // Auto increment password for next call
    const next = (parseInt(password) + 1).toString().padStart(3, '0');
    setPassword(next);
  };

  const handleRepeat = (callData?: any) => {
    const dataToRepeat = callData || lastCalled;
    if (dataToRepeat) {
      socket.emit('repeat-call', dataToRepeat);
    }
  };

  const handleReset = () => {
    setPassword('001');
  };

<<<<<<< HEAD
  // Availability actions
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch('/api/availability/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!isEditingRoom;
      const payload = isEdit ? isEditingRoom : newRoom;
      
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsAddingRoom(false);
        setIsEditingRoom(null);
        setNewRoom({ room: '', doctor: '', status: 'available' });
      }
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirm('Deseja realmente remover esta sala do controle de disponibilidade?')) {
      try {
        await fetch(`/api/availability/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // Smart Auto Routing call to available rooms
  const handleAutoRouteCall = () => {
    // Find first room with 'available' status
    const freeRoom = availability.find(item => item.status === 'available');

    if (!freeRoom) {
      setRoutingMessage({
        text: 'Nenhuma sala/médico com status "LIVRE" no momento. Por favor altere o status de uma das salas para continuar.',
        type: 'error'
      });
      setTimeout(() => setRoutingMessage(null), 7000);
      return;
    }

    // Set counter to matches freeRoom room identifier
    setCounter(freeRoom.room);

    // Call password
    socket.emit('call-password', {
      number: password,
      counter: freeRoom.room
    });

    // Notify of success route
    setRoutingMessage({
      text: `Senha ${password} encaminhada automaticamente para a ${freeRoom.room} (${freeRoom.doctor})! Status atualizado para em atendimento.`,
      type: 'success'
    });
    setTimeout(() => setRoutingMessage(null), 7000);

    // Auto increment password for next call
    const next = (parseInt(password) + 1).toString().padStart(3, '0');
    setPassword(next);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Calling and History */}
=======
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white p-10 rounded-[2rem] shadow-xl border-4 border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Operador Ativo
            </span>
          </div>
          
<<<<<<< HEAD
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
=======
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
            <span className="bg-indigo-700 p-2 rounded-lg text-white">
              <UserPlus size={24} />
            </span>
            Painel do Operador
          </h2>
<<<<<<< HEAD

          {/* Real-time Toast Notifications */}
          <AnimatePresence>
            {routingMessage && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`p-4 mb-6 rounded-2xl border flex items-start gap-3 text-xs font-semibold leading-relaxed ${
                  routingMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : routingMessage.type === 'error' 
                    ? 'bg-rose-50 border-rose-200 text-rose-800' 
                    : 'bg-indigo-50 border-indigo-100 text-indigo-900'
                }`}
              >
                {routingMessage.type === 'success' ? (
                  <Sparkles size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{routingMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nome ou Senha</label>
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ex: 001 ou Pedro"
                className="w-full text-6xl font-black p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all text-center"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sala Atual</label>
              <input 
                type="text" 
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                className="w-full text-6xl font-black p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all text-center"
              />
            </div>
          </div>

<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleCall}
              className="md:col-span-1 bg-orange-500 hover:bg-orange-600 text-white h-24 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-orange-200 transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-2xl font-black tracking-tighter group-hover:scale-105 transition-transform uppercase">Chamar manual</span>
              <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">Senha e Sala digitados</span>
            </button>

            <button 
              onClick={handleAutoRouteCall}
              className="md:col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white h-24 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-200 transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-2xl font-black tracking-tighter flex items-center gap-1.5 group-hover:scale-105 transition-transform uppercase">
                <Sparkles size={18} className="animate-pulse" />
                Destinar Sala
              </span>
              <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest text-emerald-100">Chamar na Sala Livre</span>
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleRepeat()}
                disabled={!lastCalled}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-black rounded-3xl shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:grayscale cursor-pointer"
              >
                <span className="text-lg font-black uppercase tracking-tight">Repetir</span>
                <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">Último</span>
              </button>

              <button 
                onClick={handleReset}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-3xl border border-slate-200 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                title="Resetar sequência"
              >
                <RotateCcw size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">Resetar</span>
              </button>
            </div>
          </div>
        </section>

        {/* Call History */}
=======
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={handleCall}
              className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white h-24 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-orange-200 transition-all active:scale-95 group"
            >
              <span className="text-3xl font-black tracking-tighter group-hover:scale-110 transition-transform">PRÓXIMO</span>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Chamar Nova Senha</span>
            </button>
            
            <button 
              onClick={() => handleRepeat()}
              disabled={!lastCalled}
              className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-black rounded-3xl shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:grayscale"
            >
               <span className="text-xl font-black uppercase tracking-tight">Repetir</span>
               <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Última Chamada</span>
            </button>

            <button 
              onClick={handleReset}
              className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-black rounded-3xl border-2 border-indigo-200 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              title="Resetar sequência"
            >
              <RotateCcw size={18} />
              Resetar
            </button>
          </div>
        </section>

>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
        <section className="bg-white p-10 rounded-[2rem] shadow-xl border-4 border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
              <HistoryIcon className="text-slate-400" />
              Últimas Chamadas
            </h2>
            <button 
              onClick={handleClearHistory}
<<<<<<< HEAD
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
=======
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
            >
              <Trash2 size={14} />
              Limpar Histórico
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nome / Senha</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sala</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horário</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence initial={false}>
                  {history.map((call) => (
                    <motion.tr 
                      key={call.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleRepeat(call)}
                      className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <span className="text-2xl font-black text-indigo-900 group-hover:text-indigo-600 transition-colors">{call.number}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-black text-slate-600 uppercase tracking-tighter">Sala {call.counter}</span>
                      </td>
                      <td className="px-8 py-6 text-slate-400 font-mono text-sm">
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
<<<<<<< HEAD
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepeat(call);
                          }}
                          className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition-all active:scale-95 cursor-pointer"
=======
                          onClick={() => handleRepeat(call)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition-all active:scale-95"
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
                          title="Repetir Chamada"
                        >
                          <Volume2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>
      </div>

<<<<<<< HEAD
      {/* Right Column - Status and Room Availability Tracking */}
      <div className="space-y-6">
        {/* Availability Tracking Module */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-indigo-600 animate-pulse" />
                Salas e Médicos
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest-slow">
                Painel Live
              </span>
            </div>

            {/* List of rooms / doctors with interactive statuses */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar mb-6">
              {availability.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    item.status === 'available' 
                      ? 'bg-emerald-50/20 border-emerald-100' 
                      : item.status === 'busy' 
                      ? 'bg-rose-50/20 border-rose-100' 
                      : 'bg-amber-50/10 border-amber-100'
                  }`}
                >
                  {isEditingRoom && isEditingRoom.id === item.id ? (
                    /* Editor Inline Form */
                    <form onSubmit={handleSaveRoom} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Identificação da Sala</label>
                        <input 
                          type="text"
                          value={isEditingRoom.room}
                          onChange={(e) => setIsEditingRoom({ ...isEditingRoom, room: e.target.value })}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-indigo-500 font-bold text-slate-700"
                          placeholder="Ex: Sala 01"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Médico (Especialidade)</label>
                        <input 
                          type="text"
                          value={isEditingRoom.doctor}
                          onChange={(e) => setIsEditingRoom({ ...isEditingRoom, doctor: e.target.value })}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-indigo-500 font-bold text-slate-700"
                          placeholder="Ex: Dr. Lucas (Clínico)"
                          required
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(item.id)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remover
                        </button>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingRoom(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] uppercase font-black cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-black cursor-pointer"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Display Layout with inline live state toggle */
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-sm tracking-tight">{item.room}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              item.status === 'available' ? 'bg-emerald-500' : item.status === 'busy' ? 'bg-red-500' : 'bg-amber-400'
                            }`} />
                          </div>
                          <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{item.doctor}</p>
                        </div>
                        
                        <button 
                          onClick={() => setIsEditingRoom({ ...item })}
                          className="p-1 px-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          title="Editar Sala ou Médico"
                        >
                          <Edit3 size={11} />
                          Editar
                        </button>
                      </div>

                      {/* Status quick check block */}
                      <div className="grid grid-cols-3 gap-1 mt-3">
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'available')}
                          className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'available' 
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'available' ? 'bg-white' : 'bg-slate-300'}`} />
                          Livre
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, 'busy')}
                          className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'busy' 
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-100' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'busy' ? 'bg-white' : 'bg-slate-300'}`} />
                          Ocupado
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, 'away')}
                          className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'away' 
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-100' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'away' ? 'bg-white' : 'bg-slate-300'}`} />
                          Ausente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {availability.length === 0 && (
                <div className="text-center py-6 border border-dashed rounded-2xl text-slate-400 flex flex-col items-center">
                  <UserCheck size={32} className="opacity-20 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma sala castrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Form expander for adding a new room */}
          <div className="pt-2 border-t border-slate-100">
            {isAddingRoom ? (
              <form onSubmit={handleSaveRoom} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Novo Médico / Sala</h4>
                  <button type="button" onClick={() => setIsAddingRoom(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">Sala</label>
                  <input
                    type="text"
                    value={newRoom.room}
                    onChange={(e) => setNewRoom({ ...newRoom, room: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-bold"
                    placeholder="Ex: Sala 05"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">Médico (ou Atendimento)</label>
                  <input
                    type="text"
                    value={newRoom.doctor}
                    onChange={(e) => setNewRoom({ ...newRoom, doctor: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-indigo-500 font-bold"
                    placeholder="Ex: Dr. Marcelo (Ortopedista)"
                    required
                  />
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingRoom(false)}
                    className="bg-slate-200 shrink-0 text-slate-600 text-[10px] uppercase font-black px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Retroceder
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase font-black px-3.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsAddingRoom(true)}
                className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-400 hover:text-indigo-600 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus size={16} />
                Adicionar Sala / Médico
              </button>
            )}
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
          <h3 className="text-sm font-black mb-3 relative z-10 uppercase tracking-wider">Como funciona a Atribuição?</h3>
          <p className="text-indigo-200 leading-relaxed text-xs relative z-10 opacity-90 font-medium">
            Clique em <b>"DESTINAR SALA"</b> para que o sistema direcione o paciente para o primeiro médico marcado como <b>LIVRE</b> (🟢). O status deste médico mudará para ocupado logo em seguida, garantindo as chamadas de forma rotativa e automática!
          </p>
        </div>
=======
      <div className="space-y-6">
        <div className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
          <h3 className="text-lg font-black mb-3 relative z-10 uppercase tracking-tight">Dica SISCHAM</h3>
          <p className="text-indigo-200 leading-relaxed text-sm relative z-10 opacity-90">
            A Transmissão para o Painel TV está <b>Ativa</b>. Todas as chamadas realizadas aqui serão reproduzidas instantaneamente na tela remota com sinal sonoro e voz.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-200">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] mb-6">Status da Fila</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Fluxo de Atendimento</span>
                <span className="text-indigo-600">{history.length} Chamadas</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-1 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                ></motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Hoje</div>
                  <div className="text-2xl font-black text-slate-800">{history.length}</div>
               </div>
               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                  <div className="text-[10px] font-bold text-orange-400 uppercase mb-1">Média (min)</div>
                  <div className="text-2xl font-black text-orange-600">4.2</div>
               </div>
            </div>
          </div>
        </div>
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
      </div>
    </div>
  );
}
