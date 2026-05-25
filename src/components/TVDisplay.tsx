import React, { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import {
  BellRing,
  Volume2,
  ShieldAlert,
  LayoutGrid,
  Bell
} from 'lucide-react';

export default function TVDisplay() {
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const [standbyMode, setStandbyMode] = useState<
    'youtube' | 'local' | 'static'
  >('youtube');

  const [youtubeId, setYoutubeId] =
    useState('5QNMCtuNqyI');

  const [standbyTime, setStandbyTime] =
    useState<number>(10);

  const standbyTimeRef =
    useRef<number>(10);

  const [mediaList, setMediaList] =
    useState<any[]>([]);

  const [isWaitingMode, setIsWaitingMode] =
    useState(false);

  const [currentMediaIndex, setCurrentMediaIndex] =
    useState(0);

  const voicesRef =
    useRef<SpeechSynthesisVoice[]>([]);

  const timerRef = useRef<any>(null);
  const mediaTimerRef = useRef<any>(null);

  // Salas / médicos
  const [availability, setAvailability] =
    useState<any[]>([]);

  useEffect(() => {
    standbyTimeRef.current = standbyTime;
  }, [standbyTime]);

  // Buscar disponibilidade
  const fetchAvailability = useCallback(
    async () => {
      try {
        const res = await fetch(
          '/api/availability'
        );

        const data = await res.json();

        setAvailability(data || []);
      } catch (error) {
        console.error(
          'Error fetching availability:',
          error
        );
      }
    },
    []
  );

  // Configurações
  const fetchSettings = useCallback(
    async () => {
      try {
        const res = await fetch(
          '/api/settings'
        );

        const data = await res.json();

        if (data.youtube_id) {
          setYoutubeId(data.youtube_id);
        }

        if (data.standby_mode) {
          setStandbyMode(data.standby_mode);
        }

        if (data.standby_time) {
          setStandbyTime(
            Number(data.standby_time)
          );
        }
      } catch (error) {
        console.error(
          'Error fetching settings:',
          error
        );
      }
    },
    []
  );

  // Mídias
  const fetchMedia = useCallback(
    async () => {
      try {
        const res = await fetch('/api/media');

        const data = await res.json();

        setMediaList(data || []);
      } catch (error) {
        console.error(
          'Error fetching media:',
          error
        );
      }
    },
    []
  );

  useEffect(() => {
    fetchSettings();
    fetchMedia();
    fetchAvailability();
  }, [
    fetchSettings,
    fetchMedia,
    fetchAvailability
  ]);

  // Próxima mídia
  const nextMedia = useCallback(() => {
    if (mediaList.length === 0) return;

    setCurrentMediaIndex(
      (prev) =>
        (prev + 1) % mediaList.length
    );
  }, [mediaList.length]);

  useEffect(() => {
    if (
      currentMediaIndex >= mediaList.length &&
      mediaList.length > 0
    ) {
      setCurrentMediaIndex(0);
    }
  }, [mediaList, currentMediaIndex]);

  // Rotação imagens
  useEffect(() => {
    if (
      isWaitingMode &&
      standbyMode === 'local' &&
      mediaList.length > 0
    ) {
      const currentMedia =
        mediaList[currentMediaIndex];

      if (
        currentMedia?.type?.startsWith(
          'image'
        )
      ) {
        mediaTimerRef.current = setTimeout(
          nextMedia,
          10000
        );
      }
    }

    return () => {
      if (mediaTimerRef.current) {
        clearTimeout(
          mediaTimerRef.current
        );
      }
    };
  }, [
    isWaitingMode,
    standbyMode,
    mediaList,
    currentMediaIndex,
    nextMedia
  ]);

  // Timer modo espera
  const startInactivityTimer =
    useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(
        () => {
          setIsWaitingMode(true);
        },
        standbyTimeRef.current * 1000
      );
    }, []);

  // Vozes
  const loadVoices = useCallback(() => {
    voicesRef.current =
      window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (window.speechSynthesis) {
      loadVoices();

      window.speechSynthesis.onvoiceschanged =
        loadVoices;
    }
  }, [loadVoices]);

  // Falar
  const speak = useCallback(
    (number: string, counter: string) => {
      if (!window.speechSynthesis)
        return;

      window.speechSynthesis.cancel();

      const isOnlyDigits =
        /^\d+$/.test(number);

      const intro = isOnlyDigits
        ? `Senha número ${number}`
        : `${number}`;

      const text = `${intro}, dirigir-se à sala ${counter}`;

      const utterance =
        new SpeechSynthesisUtterance(
          text
        );

      utterance.lang = 'pt-BR';
      utterance.rate = 1;
      utterance.pitch = 1;

      const ptVoice =
        voicesRef.current.find(
          (v) =>
            v.lang.includes('PT') ||
            v.lang.includes('pt-BR')
        );

      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onstart = () =>
        setIsSpeaking(true);

      utterance.onend = () =>
        setIsSpeaking(false);

      utterance.onerror = (e) => {
        console.error(
          'Speech error:',
          e
        );

        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(
        utterance
      );
    },
    []
  );

  // SOCKETS
  useEffect(() => {
    const handleNewCall = (
      data: any
    ) => {
      setIsWaitingMode(false);

      setCurrentCall(data);

      setHistory((prev) => {
        const exists = prev.find(
          (h) => h.id === data.id
        );

        if (exists) return prev;

        return [data, ...prev].slice(
          0,
          10
        );
      });

      speak(
        data.number,
        data.counter
      );

      startInactivityTimer();
    };

    const handleRepeatCall = (
      data: any
    ) => {
      setIsWaitingMode(false);

      setCurrentCall(data);

      speak(
        data.number,
        data.counter
      );

      startInactivityTimer();
    };

    const handleSettingsUpdated =
      () => {
        fetchSettings();
        fetchMedia();
      };

    socket.on(
      'new-call',
      handleNewCall
    );

    socket.on(
      'repeat-call',
      handleRepeatCall
    );

    socket.on(
      'settings-updated',
      handleSettingsUpdated
    );

    socket.on(
      'availability-updated',
      () => {
        fetchAvailability();
      }
    );

    socket.on(
      'history-cleared',
      () => {
        setHistory([]);
        setCurrentCall(null);
        setIsWaitingMode(true);

        if (timerRef.current) {
          clearTimeout(
            timerRef.current
          );
        }
      }
    );

    // Histórico inicial
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.length > 0
        ) {
          setCurrentCall(data[0]);

          setHistory(
            data.slice(1, 10)
          );

          startInactivityTimer();
        } else {
          setIsWaitingMode(true);
        }
      })
      .catch(() => {
        setIsWaitingMode(true);
      });

    return () => {
      socket.off(
        'new-call',
        handleNewCall
      );

      socket.off(
        'repeat-call',
        handleRepeatCall
      );

      socket.off(
        'settings-updated',
        handleSettingsUpdated
      );

      socket.off(
        'availability-updated'
      );

      socket.off(
        'history-cleared'
      );
    };
  }, [
    speak,
    startInactivityTimer,
    fetchSettings,
    fetchMedia,
    fetchAvailability
  ]);

  // Ativar áudio
  const handleUnlockAudio = () => {
    setAudioUnlocked(true);

    const unlock =
      new SpeechSynthesisUtterance(
        'Áudio ativado'
      );

    unlock.volume = 0;

    window.speechSynthesis.speak(
      unlock
    );
  };

  // Tela desbloqueio
  if (!audioUnlocked) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white z-[9999]">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="text-center p-12 bg-slate-800 rounded-[3rem] border-4 border-indigo-500 shadow-2xl max-w-lg"
        >
          <div className="mb-6 flex justify-center text-indigo-400">
            <ShieldAlert size={80} />
          </div>

          <h1 className="text-3xl font-black mb-4 uppercase">
            Ativar Áudio do Painel?
          </h1>

          <p className="text-slate-400 mb-8 font-medium">
            O navegador exige uma
            interação para permitir
            chamadas de voz.
          </p>

          <button
            onClick={
              handleUnlockAudio
            }
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 rounded-2xl text-xl shadow-xl transition-all active:scale-95"
          >
            ATIVAR AGORA
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 text-slate-900 overflow-hidden font-sans select-none flex flex-col p-6 gap-6">
      {/* HEADER */}
      <div className="bg-indigo-700 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl text-indigo-700">
            <BellRing
              size={32}
              strokeWidth={3}
            />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase">
              Painel de Senhas
            </h2>

            <p className="text-xs uppercase font-bold opacity-80 tracking-widest">
              Atendimento em Tempo
              Real
            </p>
          </div>
        </div>

        <div className="text-5xl font-black font-mono">
          {new Date().toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          )}
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* TELA PRINCIPAL */}
        <div className="flex-[3] bg-white rounded-[3rem] shadow-2xl flex flex-col border-4 border-indigo-200 overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-indigo-50">
            <AnimatePresence mode="wait">
              {currentCall ? (
                <motion.div
                  key={currentCall.id}
                  initial={{
                    scale: 0.8,
                    opacity: 0
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{
                    scale: 1.2,
                    opacity: 0
                  }}
                  className="text-center w-full"
                >
                  <span className="text-indigo-900/40 text-3xl font-black uppercase tracking-[0.3em] mb-6 block">
                    Nome / Senha
                  </span>

                  <div className="text-[12rem] font-black text-orange-500 leading-none">
                    {
                      currentCall.number
                    }
                  </div>

                  <div className="mt-12">
                    <span className="text-slate-500 text-3xl font-bold uppercase tracking-[0.3em]">
                      Dirija-se à
                    </span>

                    <div className="bg-indigo-950 text-white text-8xl font-black px-20 py-8 rounded-[2rem] mt-6">
                      SALA{' '}
                      {
                        currentCall.counter
                      }
                    </div>
                  </div>

                  {isSpeaking && (
                    <div className="absolute bottom-8 right-8 bg-orange-100 text-orange-600 p-4 rounded-full shadow-lg">
                      <Volume2
                        size={40}
                        className="animate-pulse"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center text-indigo-900/20">
                  <Bell
                    size={200}
                    strokeWidth={1}
                    className="mb-8"
                  />

                  <h2 className="text-4xl font-black uppercase tracking-widest">
                    Painel Operacional
                  </h2>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LATERAL */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* SALAS */}
          <div className="flex-1 bg-white rounded-[3rem] p-6 flex flex-col shadow-xl border-4 border-indigo-50 overflow-hidden">
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4">
              Médicos & Salas
            </h3>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {availability.map(
                (item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      item.status ===
                      'available'
                        ? 'bg-emerald-50 border-emerald-100'
                        : item.status ===
                          'busy'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-amber-50 border-amber-100'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-sm">
                        {item.room}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        {item.doctor}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase ${
                        item.status ===
                        'available'
                          ? 'bg-emerald-500 text-white'
                          : item.status ===
                            'busy'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.status ===
                      'available'
                        ? 'Livre'
                        : item.status ===
                          'busy'
                        ? 'Atendendo'
                        : 'Ausente'}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* HISTÓRICO */}
          <div className="flex-1 bg-slate-50 rounded-[3rem] p-6 flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4">
              Últimas Chamadas
            </h3>

            <div className="flex-1 space-y-3 overflow-y-auto">
              <AnimatePresence initial={false}>
                {history.map(
                  (call) => (
                    <motion.div
                      key={call.id}
                      initial={{
                        x: 50,
                        opacity: 0
                      }}
                      animate={{
                        x: 0,
                        opacity: 1
                      }}
                      className="bg-white p-3 rounded-2xl border shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <span className="text-[8px] font-black text-indigo-900/40 uppercase tracking-widest">
                          Senha
                        </span>

                        <div className="text-2xl font-black text-indigo-900">
                          {
                            call.number
                          }
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Sala
                        </span>

                        <div className="bg-slate-900 text-white px-2 py-1 rounded-lg text-sm font-black">
                          {
                            call.counter
                          }
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}