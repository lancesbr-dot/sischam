import React, { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, Volume2, ShieldAlert, LayoutGrid, Bell } from 'lucide-react';

export default function TVDisplay() {
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [standbyMode, setStandbyMode] = useState<'youtube' | 'local' | 'static'>('youtube');
  const [youtubeId, setYoutubeId] = useState('5QNMCtuNqyI');
  const [standbyTime, setStandbyTime] = useState<number>(10);
  const standbyTimeRef = useRef<number>(10);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isWaitingMode, setIsWaitingMode] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const timerRef = useRef<any>(null);
  const mediaTimerRef = useRef<any>(null);

<<<<<<< HEAD
  // Real-time Availability State
  const [availability, setAvailability] = useState<any[]>([]);

=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  useEffect(() => {
    standbyTimeRef.current = standbyTime;
  }, [standbyTime]);

<<<<<<< HEAD
  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch('/api/availability');
      const data = await res.json();
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  }, []);

=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.youtube_id) setYoutubeId(data.youtube_id);
      if (data.standby_mode) setStandbyMode(data.standby_mode);
      if (data.standby_time) setStandbyTime(Number(data.standby_time));
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

<<<<<<< HEAD
  const fetchMedia = useCallback(async () => {
=======
  useEffect(() => {
    fetchSettings();
    fetchMedia();
  }, [fetchSettings]);

  const fetchMedia = async () => {
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMediaList(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
<<<<<<< HEAD
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchMedia();
    fetchAvailability();
  }, [fetchSettings, fetchMedia, fetchAvailability]);
=======
  };
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02

  const nextMedia = useCallback(() => {
    if (mediaList.length === 0) return;
    setCurrentMediaIndex(prev => (prev + 1) % mediaList.length);
  }, [mediaList.length]);

  useEffect(() => {
    if (currentMediaIndex >= mediaList.length && mediaList.length > 0) {
      setCurrentMediaIndex(0);
    }
  }, [mediaList, currentMediaIndex]);

  useEffect(() => {
    if (isWaitingMode && standbyMode === 'local' && mediaList.length > 0) {
      const currentMedia = mediaList[currentMediaIndex];
      if (currentMedia.type.startsWith('image')) {
        mediaTimerRef.current = setTimeout(nextMedia, 10000); // 10s per image
      }
    }
    return () => {
      if (mediaTimerRef.current) clearTimeout(mediaTimerRef.current);
    };
  }, [isWaitingMode, standbyMode, mediaList, currentMediaIndex, nextMedia]);

  const startInactivityTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsWaitingMode(true);
    }, standbyTimeRef.current * 1000);
  }, []);

  // Load voices once and handle async loading in some browsers
  const loadVoices = useCallback(() => {
    voicesRef.current = window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  const speak = useCallback((number: string, counter: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const isOnlyDigits = /^\d+$/.test(number);
    const intro = isOnlyDigits ? `Senha número ${number}` : `${number}`;
    const text = `${intro}, dirigir-se à sala ${counter}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1;

    const ptVoice = voicesRef.current.find(v => v.lang.includes('PT') || v.lang.includes('pt-BR'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    // Stable socket handling
    const handleNewCall = (data: any) => {
      setIsWaitingMode(false);
      setCurrentCall(data);
      setHistory(prev => {
        // Find if data already in prev to avoid duplicates if repeat arrives as new-call logic
        const exists = prev.find(h => h.id === data.id);
        if (exists) return prev;
        return [data, ...prev].slice(0, 10);
      });
      speak(data.number, data.counter);
      startInactivityTimer();
    };

    const handleRepeatCall = (data: any) => {
      setIsWaitingMode(false);
      setCurrentCall(data);
      speak(data.number, data.counter);
      startInactivityTimer();
    };

    socket.on('new-call', handleNewCall);
    socket.on('repeat-call', handleRepeatCall);
    
    const handleSettingsUpdated = () => {
      fetchSettings();
      fetchMedia();
    };

    socket.on('settings-updated', handleSettingsUpdated);

<<<<<<< HEAD
    socket.on('availability-updated', () => {
      fetchAvailability();
    });

=======
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
    socket.on('history-cleared', () => {
      setHistory([]);
      setCurrentCall(null);
      setIsWaitingMode(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    });

    // Initial history fetch
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCurrentCall(data[0]);
          setHistory(data.slice(1, 10));
          startInactivityTimer();
        } else {
          setIsWaitingMode(true);
        }
      })
      .catch(() => setIsWaitingMode(true));

    return () => {
      socket.off('new-call', handleNewCall);
      socket.off('repeat-call', handleRepeatCall);
      socket.off('settings-updated', handleSettingsUpdated);
<<<<<<< HEAD
      socket.off('availability-updated');
      socket.off('history-cleared');
    };
  }, [speak, startInactivityTimer, fetchSettings, fetchAvailability]);
=======
      socket.off('history-cleared');
    };
  }, [speak, startInactivityTimer, fetchSettings]);
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02

  const handleUnlockAudio = () => {
    setAudioUnlocked(true);
    // Simple beep or silent utterance to unlock audio context in some browsers
    const unlock = new SpeechSynthesisUtterance('Áudio ativado');
    unlock.volume = 0;
    window.speechSynthesis.speak(unlock);
  };

  if (!audioUnlocked) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white z-[9999]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-slate-800 rounded-[3rem] border-4 border-indigo-500 shadow-2xl max-w-lg"
        >
          <div className="mb-6 flex justify-center text-indigo-400">
            <ShieldAlert size={80} />
          </div>
          <h1 className="text-3xl font-black mb-4 uppercase">Ativar Áudio do Painel?</h1>
          <p className="text-slate-400 mb-8 font-medium">O navegador exige uma interação para permitir chamadas de voz automáticas.</p>
          <button 
            onClick={handleUnlockAudio}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 rounded-2xl text-xl shadow-xl transition-all active:scale-95"
          >
            ATIVAR AGORA
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentCall && !isWaitingMode) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-4 inline-block p-4 bg-blue-600 rounded-full"
          >
            <BellRing size={48} />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-widest text-slate-400">INICIANDO SISTEMA...</h1>
        </div>
      </div>
    );
  }

  const activeCall = currentCall || { number: '---', counter: '--' };

  return (
    <div className="fixed inset-0 bg-slate-100 text-slate-900 overflow-hidden font-sans select-none flex flex-col p-6 gap-6">
      {/* Top Banner */}
      <div className="bg-indigo-700 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl text-indigo-700">
            <BellRing size={32} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-none uppercase">Painel de Senhas</h2>
            <p className="text-xs uppercase font-bold opacity-80 tracking-widest">Atendimento em Tempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Status da Rede</p>
            <p className="font-mono font-bold text-green-400">LOCAL: ATIVO</p>
          </div>
          <div className="text-5xl font-black font-mono tabular-nums opacity-90 border-l-2 border-indigo-500 pl-8">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        {/* Waiting Mode Layer */}
        <AnimatePresence>
          {isWaitingMode && standbyMode !== 'static' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black rounded-[3rem] overflow-hidden"
            >
              {standbyMode === 'youtube' ? (
                <iframe 
                  key={youtubeId}
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0`}
                  title="Waiting Mode Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="bg-black"
                ></iframe>
              ) : mediaList.length > 0 ? (
                <div className="w-full h-full relative">
                  <AnimatePresence mode="wait">
                    {mediaList[currentMediaIndex].type.startsWith('video') ? (
                      <motion.video
                        key={`${mediaList[currentMediaIndex].id}-${currentMediaIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={mediaList[currentMediaIndex].url}
                        autoPlay
                        muted
                        playsInline
                        onEnded={nextMedia}
                        onError={(e) => {
                          console.error('Video error:', e);
                          nextMedia();
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <motion.img
                        key={`${mediaList[currentMediaIndex].id}-${currentMediaIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={mediaList[currentMediaIndex].url}
                        onError={(e) => {
                          console.error('Image error:', e);
                          nextMedia();
                        }}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500 bg-slate-900">
                   <LayoutGrid size={80} className="mb-4 opacity-20" />
                   <p className="text-xs font-black uppercase tracking-[0.4em]">Aguardando Mídia...</p>
                </div>
              )}
              
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none">
                 <div className="bg-indigo-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Última Chamada</p>
                    <h4 className="text-4xl font-black">{activeCall.number} <span className="text-xl text-indigo-300">SALA {activeCall.counter}</span></h4>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Display Area */}
        <div className="flex-[3] bg-white rounded-[3rem] shadow-2xl flex flex-col border-4 border-indigo-200 overflow-hidden relative">
          <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
            <span className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              Transmitindo Agora
            </span>
            <span className="text-slate-400 font-mono text-sm">SISCHAM v1.0</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-indigo-50">
            <AnimatePresence mode="wait">
              {currentCall ? (
                <motion.div
                  key={currentCall.id}
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.2, opacity: 0, y: -50 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-center w-full max-w-4xl"
                >
                  <div className="mb-8 flex flex-col items-center">
                    <span className="text-indigo-900/40 text-3xl font-black uppercase tracking-[0.3em] mb-6 block">Nome / Senha</span>
                    <div className="tv-card-orange text-[12rem] font-black leading-none px-20 py-8 inline-block min-w-[600px] mb-12 whitespace-nowrap overflow-hidden text-ellipsis">
                      {currentCall.number}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-slate-500 text-3xl font-bold uppercase tracking-[0.3em] mb-6">Dirija-se à</span>
                    <div className="bg-indigo-950 text-white text-8xl font-black px-20 py-8 rounded-[2rem] shadow-xl border-t border-indigo-800">
                      SALA {currentCall.counter}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSpeaking && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="absolute bottom-8 right-8 bg-orange-100 text-orange-600 p-4 rounded-full shadow-lg"
                      >
                        <Volume2 size={40} className="animate-pulse" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-indigo-900/20"
                >
                  <Bell size={200} strokeWidth={1} className="mb-8" />
                  <h2 className="text-4xl font-black uppercase tracking-widest">Painel Operacional</h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scrolling Footer */}
          <div className="bg-indigo-900 text-white h-20 flex items-center overflow-hidden border-t-4 border-indigo-950">
            <div className="whitespace-nowrap px-8 font-bold italic opacity-90 text-xl tracking-tight">
              AVISO: Senhas preferenciais têm prioridade legal conforme Lei 10.048. Mantenha seus documentos em mãos para agilizar o atendimento. SISCHAM - Tecnologia a serviço da agilidade. 
              &nbsp;&nbsp; • &nbsp;&nbsp; 
              TENHA UM EXCELENTE ATENDIMENTO!
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Right Sidebar - Doctors & History */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Top Half - Rooms & Doctors availability */}
          <div className="flex-1 bg-white rounded-[3rem] p-6 flex flex-col shadow-xl border-4 border-indigo-50/50 overflow-hidden">
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4 pb-3 border-b-2 border-slate-100 flex items-center justify-between shrink-0">
               Médicos & Salas
               <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </h3>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {availability.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                    item.status === 'available' 
                      ? 'bg-emerald-50/25 border-emerald-100 text-emerald-950' 
                      : item.status === 'busy' 
                      ? 'bg-rose-50/25 border-rose-100 text-rose-950' 
                      : 'bg-amber-50/20 border-amber-100 text-amber-950'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <p className="font-extrabold text-sm tracking-tight text-slate-800">{item.room}</p>
                    <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{item.doctor}</p>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest leading-none ${
                    item.status === 'available' 
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' 
                      : item.status === 'busy' 
                      ? 'bg-red-500 text-white shadow-sm shadow-red-200 animate-pulse' 
                      : 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                  }`}>
                    {item.status === 'available' ? 'Livre' : item.status === 'busy' ? 'Atendendo' : 'Ausente'}
                  </span>
                </div>
              ))}
              {availability.length === 0 && (
                <div className="text-center py-6 text-slate-300 flex flex-col items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest mt-2">Sem cadastro</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Half - History */}
          <div className="flex-1 bg-slate-50 rounded-[3rem] p-6 flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4 pb-3 border-b-2 border-slate-200 flex items-center justify-between shrink-0">
               Últimas Chamadas
               <div className="bg-slate-200 px-2 py-0.5 rounded text-[8px] font-black">PAINEL</div>
            </h3>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {history.map((call) => (
                  <motion.div
                    key={call.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-white p-3 rounded-2xl border shadow-sm flex justify-between items-center group hover:bg-indigo-50/40 transition-colors border-slate-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-indigo-900/40 uppercase tracking-widest">Senha</span>
                      <span className="text-2xl font-black text-indigo-900 leading-tight">{call.number}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sala</span>
                      <div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-sm font-black tracking-tighter mt-0.5">
                        {call.counter}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                  <span className="font-black uppercase tracking-widest text-[9px] opacity-40">Nenhuma chamada</span>
                </div>
              )}
            </div>
=======
        {/* Right Sidebar - History */}
        <div className="flex-1 bg-slate-50 rounded-[3rem] p-8 flex flex-col shadow-xl border border-slate-200">
          <h3 className="text-slate-400 font-black uppercase text-xs tracking-[0.3em] mb-8 pb-4 border-b-2 border-slate-200 flex items-center justify-between">
             Últimas Chamadas
             <div className="bg-slate-200 px-2 py-1 rounded text-[8px]">HISTÓRICO</div>
          </h3>
          
          <div className="flex-1 space-y-6 overflow-hidden">
            <AnimatePresence initial={false}>
              {history.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center group hover:bg-indigo-50 transition-all duration-300 border-slate-100"
                >
                  <div className="flex flex-col">
                    <span className="text-indigo-900/60 font-black text-[10px] uppercase tracking-widest mb-1">Senha</span>
                    <span className="text-5xl font-black tracking-tighter text-indigo-900">{call.number}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentCall(call);
                      speak(call.number, call.counter);
                    }}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl transition-all hover:bg-indigo-600 hover:text-white group-hover:scale-110 active:scale-95"
                    title="Repetir Chamada"
                  >
                    <Volume2 size={24} />
                  </button>

                  <div className="text-right">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Sala</span>
                    <div className="bg-slate-900 text-white px-3 py-1 rounded-xl text-2xl font-black tracking-tighter">{call.counter}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <Bell size={64} className="opacity-20" />
                <span className="font-black uppercase tracking-widest text-sm opacity-40">Aguardando...</span>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-slate-200">
             <div className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase text-center">
               Unidade Centro • Sala Digital
             </div>
>>>>>>> 1f09d5c17630359af06e0cd4d7ca9690ead04c02
          </div>
        </div>
      </div>
    </div>
  );
}
