import React, { useState, useEffect, useCallback } from 'react';
import { socket } from '../App';
import { 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut, 
  BellRing,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomDoctor {
  id: number;
  room: string;
  doctor: string;
  status: 'available' | 'busy' | 'away';
  updated_at: string;
}

export default function DoctorPanel() {
  const [rooms, setRooms] = useState<RoomDoctor[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(() => {
    const saved = localStorage.getItem('sis_doctor_room_id');
    return saved ? parseInt(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  // Real-time alert when a patient is called for this doctor's room
  const [activeCallAlert, setActiveCallAlert] = useState<{ number: string; counter: string } | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/availability');
      const data = await res.json();
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms for doctor', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    // Sockets sync
    const handleAvailabilityUpdated = () => {
      fetchRooms();
    };

    const handleNewCall = (data: { number: string; counter: string }) => {
      if (!selectedRoomId) return;
      
      const myRoom = rooms.find(r => r.id === selectedRoomId);
      if (!myRoom) return;

      // Check if the call counter matches my room identifier
      const counterClean = data.counter?.toLowerCase()?.trim() || '';
      const roomClean = myRoom.room?.toLowerCase()?.trim() || '';
      
      const idMatch = counterClean === roomClean || 
                      counterClean === `sala ${roomClean}` || 
                      roomClean === `sala ${counterClean}` ||
                      roomClean.includes(counterClean);

      if (idMatch) {
        // Trigger visual alarm!
        setActiveCallAlert(data);
        
        // Play notification sound if browser allowed
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
          gain.gain.setValueAtTime(0, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.6);
        } catch (e) {
          console.log('Audio contextual note blocked or failed to play: ', e);
        }
      }
    };

    socket.on('availability-updated', handleAvailabilityUpdated);
    socket.on('new-call', handleNewCall);

    return () => {
      socket.off('availability-updated', handleAvailabilityUpdated);
      socket.off('new-call', handleNewCall);
    };
  }, [selectedRoomId, rooms, fetchRooms]);

  const handleSelectRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    localStorage.setItem('sis_doctor_room_id', roomId.toString());
    
    // Unlock Audio Context on first interactive action
    if (!audioUnlocked) {
      setAudioUnlocked(true);
    }
  };

  const handleLogout = () => {
    setSelectedRoomId(null);
    localStorage.removeItem('sis_doctor_room_id');
    setActiveCallAlert(null);
  };

  const handleUpdateStatus = async (status: 'available' | 'busy' | 'away') => {
    if (!selectedRoomId) return;
    
    // Optimistic local state updates
    setRooms(prev => prev.map(r => r.id === selectedRoomId ? { ...r, status } : r));

    try {
      await fetch('/api/availability/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRoomId, status })
      });
      // also notify through socket
      socket.emit('settings-updated');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getMyRoomInfo = () => {
    return rooms.find(r => r.id === selectedRoomId);
  };

  const currentRoom = getMyRoomInfo();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <header className="border-b border-white/10 p-5 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-900/30">
            <Stethoscope size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase leading-none text-white flex items-center gap-2">
              SISCHAM <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-mono uppercase tracking-widest leading-none">MÉDICO</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Controle de Status e Atendimento</p>
          </div>
        </div>

        {currentRoom && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all border border-slate-700/50 cursor-pointer"
          >
            <LogOut size={14} />
            Mudar Sala
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center relative z-10 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {!selectedRoomId || !currentRoom ? (
            /* ================= SELECT ROOM / ROLE VIEW ================= */
            <motion.div
              key="select-role"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full bg-slate-950/60 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <Stethoscope size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">Olá, Doutor!</h2>
                <p className="text-slate-400 text-xs mt-2 font-medium">Selecione o seu consultório ou sala para iniciar os atendimentos</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-indigo-400">
                  <RefreshCw className="animate-spin" size={28} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Carregando salas...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className="w-full text-left p-5 bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-center justify-between group transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-indigo-950/10"
                    >
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-1">
                          {room.room}
                        </span>
                        <span className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                          {room.doctor}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${
                          room.status === 'available' ? 'bg-emerald-500 animate-pulse' : room.status === 'busy' ? 'bg-red-500' : 'bg-amber-400'
                        }`} />
                        <ArrowRight size={16} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  ))}

                  {rooms.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-slate-500">
                      <p className="text-xs font-semibold">Nenhuma sala cadastrada no sistema.</p>
                      <p className="text-[10px] uppercase font-bold mt-1 text-slate-600">Peça ao operador para cadastrar no Painel de Controle</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            /* ================= ACTIVE DOCTOR STEWARD VIEW ================= */
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full space-y-6"
            >
              {/* Doctor Header Badge */}
              <div className="bg-slate-950/60 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
                    {currentRoom.room}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{currentRoom.doctor}</h3>
                </div>
                <div className="flex items-center justify-center p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <ShieldCheck size={24} />
                </div>
              </div>

              {/* Dynamic Real-time Patient Call popups */}
              <AnimatePresence>
                {activeCallAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-emerald-500 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-emerald-400"
                  >
                    {/* Ring animation helper waves */}
                    <div className="absolute right-0 bottom-0 pointer-events-none transform translate-y-1/4 translate-x-1/4 opacity-10">
                      <BellRing size={200} className="animate-bounce" />
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 p-3 rounded-2xl">
                        <BellRing size={24} className="text-white animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100 flex items-center gap-1.5">
                          <Sparkles size={11} /> Paciente Chamado Agora!
                        </span>
                        <h4 className="text-3xl font-black tracking-tight leading-tight mt-1">
                          Senha {activeCallAlert.number}
                        </h4>
                        <p className="text-emerald-100 text-[11px] font-semibold mt-2">
                          Seu status foi reconfigurado automaticamente para 'ATENDENDO'.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveCallAlert(null)}
                        className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider relative z-10 cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Giant Card Indicator */}
              <div className="relative overflow-hidden">
                <div className={`p-8 rounded-[2.5rem] border-2 text-center transition-all duration-500 relative z-10 ${
                  currentRoom.status === 'available'
                    ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]'
                    : currentRoom.status === 'busy'
                    ? 'bg-rose-950/20 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-pulse'
                    : 'bg-amber-950/10 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.1)]'
                }`}>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">
                    Seu Status Atual
                  </span>
                  
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${
                      currentRoom.status === 'available' 
                        ? 'bg-emerald-500' 
                        : currentRoom.status === 'busy' 
                        ? 'bg-red-500' 
                        : 'bg-amber-400'
                    }`} />
                    <h2 className={`text-4xl font-black tracking-wider uppercase leading-none ${
                      currentRoom.status === 'available'
                        ? 'text-emerald-400'
                        : currentRoom.status === 'busy'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}>
                      {currentRoom.status === 'available' ? 'Livre' : currentRoom.status === 'busy' ? 'Atendendo' : 'Ausente'}
                    </h2>
                  </div>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm mx-auto mt-3">
                    {currentRoom.status === 'available'
                      ? 'Visível para o atendente como livre. Novas triagens podem ser encaminhadas para cá.'
                      : currentRoom.status === 'busy'
                      ? 'Atendimento em andamento. Salas ocupadas não são listadas por padrão para chamadas rotativas.'
                      : 'Ausente do consultório para pausa ou intervalo. Seu nome constará como ocupado/ausente.'}
                  </p>
                </div>
              </div>

              {/* Status Select Grid Button Board */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 block">
                  Definir Disponibilidade
                </span>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleUpdateStatus('available')}
                    className={`p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 text-left cursor-pointer border ${
                      currentRoom.status === 'available'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-950/20 scale-[1.02]'
                        : 'bg-slate-950/60 text-slate-300 border-white/5 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${currentRoom.status === 'available' ? 'bg-white/20' : 'bg-slate-800'}`}>
                      <CheckCircle2 size={24} className={currentRoom.status === 'available' ? 'text-white' : 'text-emerald-500'} />
                    </div>
                    <div>
                      <span className="text-sm font-black uppercase tracking-wide block leading-none mb-1">
                        Disponível / Livre
                      </span>
                      <span className="text-[10px] opacity-80 font-medium">Estou pronto para acolher pacientes triados</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('busy')}
                    className={`p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 text-left cursor-pointer border ${
                      currentRoom.status === 'busy'
                        ? 'bg-rose-600 text-white border-red-500 shadow-xl shadow-red-950/20 scale-[1.02]'
                        : 'bg-slate-950/60 text-slate-300 border-white/5 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${currentRoom.status === 'busy' ? 'bg-white/20' : 'bg-slate-800'}`}>
                      <XCircle size={24} className={currentRoom.status === 'busy' ? 'text-white' : 'text-red-500'} />
                    </div>
                    <div>
                      <span className="text-sm font-black uppercase tracking-wide block leading-none mb-1">
                        Atendendo / Ocupado
                      </span>
                      <span className="text-[10px] opacity-80 font-medium">Atendimento ativo ou em andamento na sala</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('away')}
                    className={`p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 text-left cursor-pointer border ${
                      currentRoom.status === 'away'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-xl shadow-amber-950/20 scale-[1.02]'
                        : 'bg-slate-950/60 text-slate-300 border-white/5 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${currentRoom.status === 'away' ? 'bg-white/20' : 'bg-slate-800'}`}>
                      <Clock size={24} className={currentRoom.status === 'away' ? 'text-white' : 'text-amber-500'} />
                    </div>
                    <div>
                      <span className="text-sm font-black uppercase tracking-wide block leading-none mb-1">
                        Pausa / Ausente
                      </span>
                      <span className="text-[10px] opacity-80 font-medium">Pausa temporária de atendimentos ou intervalo</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer System Credits */}
      <footer className="p-4 border-t border-white/5 bg-slate-950/20 text-center relative z-20 shrink-0">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none block">
          SISCHAM SMART ROOM MONITOR • SECURE CHANNEL
        </span>
      </footer>

    </div>
  );
}
