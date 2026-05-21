import React, { useState, useEffect } from 'react';
import { socket } from '../App';
import { Play, RotateCcw, History as HistoryIcon, UserPlus, Volume2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ControlPanel() {
  const [password, setPassword] = useState('001');
  const [counter, setCounter] = useState('01');
  const [history, setHistory] = useState<any[]>([]);
  const [lastCalled, setLastCalled] = useState<any>(null);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        if (data.length > 0) setLastCalled(data[0]);
      });

    socket.on('new-call', (data) => {
      setHistory(prev => [data, ...prev].slice(0, 10));
      setLastCalled(data);
    });

    socket.on('history-cleared', () => {
      setHistory([]);
      setLastCalled(null);
    });

    return () => {
      socket.off('new-call');
      socket.off('history-cleared');
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white p-10 rounded-[2rem] shadow-xl border-4 border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Operador Ativo
            </span>
          </div>
          
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
            <span className="bg-indigo-700 p-2 rounded-lg text-white">
              <UserPlus size={24} />
            </span>
            Painel do Operador
          </h2>
          
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

        <section className="bg-white p-10 rounded-[2rem] shadow-xl border-4 border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
              <HistoryIcon className="text-slate-400" />
              Últimas Chamadas
            </h2>
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
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
                          onClick={() => handleRepeat(call)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition-all active:scale-95"
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
      </div>
    </div>
  );
}
