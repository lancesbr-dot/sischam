import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

import { socket } from '../App';

import {
  motion,
  AnimatePresence
} from 'motion/react';

import {
  BellRing,
  Volume2,
  ShieldAlert,
  LayoutGrid,
  Bell
} from 'lucide-react';

export default function TVDisplay() {
  const [currentCall, setCurrentCall] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [audioUnlocked, setAudioUnlocked] =
    useState(false);

  // STANDBY
  const [standbyMode, setStandbyMode] =
    useState<
      'youtube' | 'local' | 'static'
    >('local');

  const [youtubeId, setYoutubeId] =
    useState('5QNMCtuNqyI');

  const [standbyTime, setStandbyTime] =
    useState<number>(10);

  const standbyTimeRef =
    useRef<number>(10);

  const [mediaList, setMediaList] =
    useState<any[]>([]);

  const [isWaitingMode, setIsWaitingMode] =
    useState(true);

  const [currentMediaIndex, setCurrentMediaIndex] =
    useState(0);

  // VOZ
  const voicesRef =
    useRef<SpeechSynthesisVoice[]>([]);

  // TIMERS
  const timerRef = useRef<any>(null);

  const mediaTimerRef =
    useRef<any>(null);

  // MÉDICOS
  const [availability, setAvailability] =
    useState<any[]>([]);

  // =========================================
  // CONFIG
  // =========================================

  useEffect(() => {
    standbyTimeRef.current =
      standbyTime;
  }, [standbyTime]);

  // =========================================
  // API
  // =========================================

  const fetchAvailability =
    useCallback(async () => {
      try {
        const res = await fetch(
          '/api/availability'
        );

        const data =
          await res.json();

        setAvailability(data || []);
      } catch (error) {
        console.error(error);
      }
    }, []);

  const fetchSettings =
    useCallback(async () => {
      try {
        const res = await fetch(
          '/api/settings'
        );

        const data =
          await res.json();

        if (data.youtube_id) {
          setYoutubeId(
            data.youtube_id
          );
        }

        if (data.standby_mode) {
          setStandbyMode(
            data.standby_mode
          );
        }

        if (data.standby_time) {
          setStandbyTime(
            Number(
              data.standby_time
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    }, []);

  const fetchMedia =
    useCallback(async () => {
      try {
        const res = await fetch(
          '/api/media'
        );

        const data =
          await res.json();

        setMediaList(data || []);
      } catch (error) {
        console.error(error);
      }
    }, []);

  useEffect(() => {
    fetchSettings();
    fetchMedia();
    fetchAvailability();
  }, [
    fetchSettings,
    fetchMedia,
    fetchAvailability
  ]);

  // =========================================
  // MÍDIA
  // =========================================

  const nextMedia =
    useCallback(() => {
      if (mediaList.length === 0)
        return;

      setCurrentMediaIndex(
        (prev) =>
          (prev + 1) %
          mediaList.length
      );
    }, [mediaList.length]);

  useEffect(() => {
    if (
      currentMediaIndex >=
        mediaList.length &&
      mediaList.length > 0
    ) {
      setCurrentMediaIndex(0);
    }
  }, [
    mediaList,
    currentMediaIndex
  ]);

  useEffect(() => {
    if (
      isWaitingMode &&
      standbyMode === 'local' &&
      mediaList.length > 0
    ) {
      const currentMedia =
        mediaList[
          currentMediaIndex
        ];

      if (
        currentMedia?.type?.startsWith(
          'image'
        )
      ) {
        mediaTimerRef.current =
          setTimeout(
            nextMedia,
            10000
          );
      }
    }

    return () => {
      if (
        mediaTimerRef.current
      ) {
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

  // =========================================
  // TIMER
  // =========================================

  const startInactivityTimer =
    useCallback(() => {
      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }

      timerRef.current =
        setTimeout(() => {
          setIsWaitingMode(true);
        }, standbyTimeRef.current * 1000);
    }, []);

  // =========================================
  // VOZES
  // =========================================

  const loadVoices =
    useCallback(() => {
      voicesRef.current =
        window.speechSynthesis.getVoices();
    }, []);

  useEffect(() => {
    if (
      window.speechSynthesis
    ) {
      loadVoices();

      window.speechSynthesis.onvoiceschanged =
        loadVoices;
    }
  }, [loadVoices]);

  // =========================================
  // SPEAK
  // =========================================

  const speak = useCallback(
    (
      number: string,
      counter: string
    ) => {
      if (
        !window.speechSynthesis
      )
        return;

      window.speechSynthesis.cancel();

      const isOnlyDigits =
        /^\d+$/.test(number);

      const intro =
        isOnlyDigits
          ? `Senha número ${number}`
          : `${number}`;

      const text = `${intro}, dirigir-se à sala ${counter}`;

      const utterance =
        new SpeechSynthesisUtterance(
          text
        );

      utterance.lang =
        'pt-BR';

      utterance.rate = 1;

      utterance.pitch = 1;

      const ptVoice =
        voicesRef.current.find(
          (v) =>
            v.lang.includes(
              'pt'
            )
        );

      if (ptVoice) {
        utterance.voice =
          ptVoice;
      }

      utterance.onstart =
        () =>
          setIsSpeaking(
            true
          );

      utterance.onend =
        () =>
          setIsSpeaking(
            false
          );

      utterance.onerror =
        () =>
          setIsSpeaking(
            false
          );

      window.speechSynthesis.speak(
        utterance
      );
    },
    []
  );

  // =========================================
  // SOCKETS
  // =========================================

  useEffect(() => {
    const handleNewCall = (
      data: any
    ) => {
      setIsWaitingMode(false);

      setCurrentCall(data);

      setHistory((prev) => {
        const exists =
          prev.find(
            (h) =>
              h.id === data.id
          );

        if (exists)
          return prev;

        return [
          data,
          ...prev
        ].slice(0, 10);
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

    socket.on(
      'new-call',
      handleNewCall
    );

    socket.on(
      'repeat-call',
      handleRepeatCall
    );

    socket.on(
      'availability-updated',
      fetchAvailability
    );

    socket.on(
      'settings-updated',
      () => {
        fetchSettings();
        fetchMedia();
      }
    );

    socket.on(
      'history-cleared',
      () => {
        setHistory([]);
        setCurrentCall(
          null
        );

        setIsWaitingMode(
          true
        );
      }
    );

    fetch('/api/history')
      .then((res) =>
        res.json()
      )
      .then((data) => {
        if (
          data &&
          data.length > 0
        ) {
          setCurrentCall(
            data[0]
          );

          setHistory(
            data.slice(
              1,
              10
            )
          );
        }

        setTimeout(() => {
          setIsWaitingMode(
            true
          );
        }, 2000);
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
        'availability-updated',
        fetchAvailability
      );
    };
  }, [
    speak,
    fetchSettings,
    fetchMedia,
    fetchAvailability,
    startInactivityTimer
  ]);

  // =========================================
  // AUDIO
  // =========================================

  const handleUnlockAudio =
    () => {
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

  // =========================================
  // LOCK SCREEN
  // =========================================

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
          className="text-center p-12 bg-slate-800 rounded-[3rem]"
        >
          <div className="mb-6 flex justify-center text-indigo-400">
            <ShieldAlert size={80} />
          </div>

          <h1 className="text-3xl font-black mb-4 uppercase">
            Ativar Áudio?
          </h1>

          <button
            onClick={
              handleUnlockAudio
            }
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 px-10 rounded-2xl"
          >
            ATIVAR
          </button>
        </motion.div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="fixed inset-0 bg-slate-100 text-slate-900 overflow-hidden flex flex-col p-6 gap-6">
      {/* HEADER */}
      <div className="bg-indigo-700 text-white p-6 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BellRing size={32} />

          <div>
            <h2 className="text-2xl font-black uppercase">
              Painel de Senhas
            </h2>

            <p className="text-xs uppercase">
              Atendimento em Tempo
              Real
            </p>
          </div>
        </div>

        <div className="text-5xl font-black font-mono">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 flex gap-6 overflow-hidden relative">
        {/* STANDBY */}
        <AnimatePresence>
          {isWaitingMode && (
            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
              }}
              className="absolute inset-0 z-50 bg-black rounded-[3rem] overflow-hidden"
            >
              {/* YOUTUBE */}
              {standbyMode ===
              'youtube' ? (
                <iframe
                  key={
                    youtubeId
                  }
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&loop=1&playlist=${youtubeId}&controls=0`}
                  title="Standby"
                  frameBorder="0"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : null}

              {/* LOCAL */}
              {standbyMode ===
                'local' &&
              mediaList.length >
                0 ? (
                <div className="w-full h-full">
                  {mediaList[
                    currentMediaIndex
                  ]?.type?.startsWith(
                    'video'
                  ) ? (
                    <video
                      key={
                        mediaList[
                          currentMediaIndex
                        ].id
                      }
                      src={
                        mediaList[
                          currentMediaIndex
                        ].url
                      }
                      autoPlay
                      muted
                      playsInline
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      key={
                        mediaList[
                          currentMediaIndex
                        ].id
                      }
                      src={
                        mediaList[
                          currentMediaIndex
                        ].url
                      }
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : null}

              {/* SEM MÍDIA */}
              {standbyMode ===
                'local' &&
              mediaList.length ===
                0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white">
                  <LayoutGrid
                    size={80}
                    className="opacity-20 mb-4"
                  />

                  <p className="text-sm font-black uppercase">
                    Nenhuma mídia cadastrada
                  </p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRINCIPAL */}
        <div className="flex-[3] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <AnimatePresence mode="wait">
              {currentCall ? (
                <motion.div
                  key={
                    currentCall.id
                  }
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
                  className="text-center"
                >
                  <span className="text-3xl font-black uppercase">
                    Senha
                  </span>

                  <div className="text-[12rem] font-black text-orange-500">
                    {
                      currentCall.number
                    }
                  </div>

                  <div className="bg-indigo-950 text-white text-7xl font-black px-20 py-8 rounded-[2rem] mt-8">
                    SALA{' '}
                    {
                      currentCall.counter
                    }
                  </div>

                  {isSpeaking && (
                    <div className="absolute bottom-8 right-8 bg-orange-100 text-orange-600 p-4 rounded-full">
                      <Volume2
                        size={40}
                        className="animate-pulse"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center text-slate-300">
                  <Bell
                    size={200}
                  />

                  <h2 className="text-4xl font-black uppercase">
                    Painel Operacional
                  </h2>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LATERAL */}
        <div className="flex-1 flex flex-col gap-6">
          {/* MÉDICOS */}
          <div className="flex-1 bg-white rounded-[3rem] p-6 overflow-y-auto">
            <h3 className="font-black uppercase mb-4">
              Médicos & Salas
            </h3>

            <div className="space-y-3">
              {availability.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className="p-3 rounded-2xl border flex justify-between"
                  >
                    <div>
                      <p className="font-bold">
                        {
                          item.room
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        {
                          item.doctor
                        }
                      </p>
                    </div>

                    <span className="text-xs font-black">
                      {
                        item.status
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* HISTÓRICO */}
          <div className="flex-1 bg-white rounded-[3rem] p-6 overflow-y-auto">
            <h3 className="font-black uppercase mb-4">
              Últimas Chamadas
            </h3>

            <div className="space-y-3">
              {history.map(
                (call) => (
                  <div
                    key={
                      call.id
                    }
                    className="p-3 rounded-2xl border flex justify-between"
                  >
                    <div>
                      <p className="text-xs uppercase">
                        Senha
                      </p>

                      <p className="text-2xl font-black">
                        {
                          call.number
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase">
                        Sala
                      </p>

                      <p className="text-lg font-black">
                        {
                          call.counter
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}