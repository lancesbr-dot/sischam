import React, { useState, useEffect } from 'react';
import { socket } from '../App';

import {
  RotateCcw,
  History as HistoryIcon,
  UserPlus,
  Volume2,
  Trash2,
  Plus,
  Edit3,
  UserCheck,
  X,
  AlertCircle,
  Sparkles,
  Activity
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

export default function ControlPanel() {
  const [password, setPassword] = useState('001');
  const [counter, setCounter] = useState('01');

  const [history, setHistory] = useState<any[]>([]);
  const [lastCalled, setLastCalled] = useState<any>(null);

  // Salas / Médicos
  const [availability, setAvailability] = useState<any[]>([]);
  const [isEditingRoom, setIsEditingRoom] = useState<any>(null);

  const [isAddingRoom, setIsAddingRoom] = useState(false);

  const [newRoom, setNewRoom] = useState({
    room: '',
    doctor: '',
    status: 'available'
  });

  const [routingMessage, setRoutingMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const fetchAvailability = () => {
    fetch('/api/availability')
      .then((res) => res.json())
      .then((data) => setAvailability(data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);

        if (data.length > 0) {
          setLastCalled(data[0]);
        }
      });

    fetchAvailability();

    socket.on('new-call', (data) => {
      setHistory((prev) => [data, ...prev].slice(0, 20));
      setLastCalled(data);
    });

    socket.on('history-cleared', () => {
      setHistory([]);
      setLastCalled(null);
    });

    socket.on('availability-updated', () => {
      fetchAvailability();
    });

    return () => {
      socket.off('new-call');
      socket.off('history-cleared');
      socket.off('availability-updated');
    };
  }, []);

  const handleCall = () => {
    socket.emit('call-password', {
      number: password,
      counter
    });

    const next = (parseInt(password) + 1)
      .toString()
      .padStart(3, '0');

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

  const handleClearHistory = async () => {
    if (confirm('Deseja realmente limpar o histórico?')) {
      try {
        await fetch('/api/history', {
          method: 'DELETE'
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Atualizar status
  const handleUpdateStatus = async (
    id: number,
    status: string
  ) => {
    try {
      await fetch('/api/availability/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          status
        })
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Salvar sala
  const handleSaveRoom = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const payload = isEditingRoom
        ? isEditingRoom
        : newRoom;

      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddingRoom(false);
        setIsEditingRoom(null);

        setNewRoom({
          room: '',
          doctor: '',
          status: 'available'
        });

        fetchAvailability();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Remover sala
  const handleDeleteRoom = async (id: number) => {
    if (confirm('Deseja remover esta sala?')) {
      await fetch(`/api/availability/${id}`, {
        method: 'DELETE'
      });

      fetchAvailability();
    }
  };

  // Chamada automática
  const handleAutoRouteCall = () => {
    const freeRoom = availability.find(
      (item) => item.status === 'available'
    );

    if (!freeRoom) {
      setRoutingMessage({
        text: 'Nenhuma sala livre disponível.',
        type: 'error'
      });

      setTimeout(() => {
        setRoutingMessage(null);
      }, 5000);

      return;
    }

    setCounter(freeRoom.room);

    socket.emit('call-password', {
      number: password,
      counter: freeRoom.room
    });

    setRoutingMessage({
      text: `Senha ${password} enviada para ${freeRoom.room}`,
      type: 'success'
    });

    setTimeout(() => {
      setRoutingMessage(null);
    }, 5000);

    const next = (parseInt(password) + 1)
      .toString()
      .padStart(3, '0');

    setPassword(next);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LADO ESQUERDO */}
      <div className="lg:col-span-2 space-y-6">

        {/* PAINEL */}
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

          {/* ALERTAS */}
          <AnimatePresence>
            {routingMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 mb-6 rounded-2xl border text-sm font-bold ${
                  routingMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {routingMessage.type === 'success' ? (
                    <Sparkles size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}

                  {routingMessage.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

            <div>
              <label className="text-xs font-black uppercase">
                Senha
              </label>

              <input
                type="text"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Ex: 001 ou Pedro"
                className="w-full text-6xl font-black p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all text-center"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase">
                Sala
              </label>

              <input
                type="text"
                value={counter}
                onChange={(e) =>
                  setCounter(e.target.value)
                }
                className="w-full text-6xl font-black p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <button
              onClick={handleCall}
              className="bg-orange-500 hover:bg-orange-600 text-white h-24 rounded-3xl font-black transition-all active:scale-95"
            >
              CHAMAR
            </button>

            <button
              onClick={handleAutoRouteCall}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-24 rounded-3xl font-black transition-all active:scale-95"
            >
              DESTINAR SALA
            </button>

            <div className="flex gap-2">

              <button
                onClick={() => handleRepeat()}
                disabled={!lastCalled}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-3xl font-black disabled:opacity-50"
              >
                REPETIR
              </button>

              <button
                onClick={handleReset}
                className="flex-1 bg-slate-200 rounded-3xl"
              >
                <RotateCcw className="mx-auto" />
              </button>

            </div>
          </div>
        </section>

        {/* HISTÓRICO */}
        <section className="bg-white p-10 rounded-[2rem] shadow-xl">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-xl font-black flex items-center gap-2">
              <HistoryIcon />
              Últimas Chamadas
            </h2>

            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl"
            >
              <Trash2 size={14} />
              Limpar
            </button>
          </div>

          <table className="w-full">

            <thead>
              <tr>
                <th>Senha</th>
                <th>Sala</th>
                <th>Hora</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              <AnimatePresence initial={false}>
                {history.map((call) => (
                  <motion.tr
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hover:bg-indigo-50 transition"
                  >
                    <td>{call.number}</td>

                    <td>{call.counter}</td>

                    <td>
                      {new Date(
                        call.timestamp
                      ).toLocaleTimeString()}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          handleRepeat(call)
                        }
                        className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg transition-all"
                      >
                        <Volume2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

            </tbody>
          </table>
        </section>
      </div>

      {/* LADO DIREITO */}
      <div className="space-y-6">

        {/* MÉDICOS */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl">

          <div className="flex items-center justify-between mb-6">

            <h3 className="font-black flex items-center gap-2">
              <Activity size={18} />
              Salas e Médicos
            </h3>

            <button
              onClick={() =>
                setIsAddingRoom(true)
              }
              className="bg-indigo-600 text-white px-3 py-2 rounded-xl"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-4">

            {availability.map((item) => (
              <div
                key={item.id}
                className="border rounded-2xl p-4"
              >

                {isEditingRoom &&
                isEditingRoom.id === item.id ? (

                  <form
                    onSubmit={handleSaveRoom}
                    className="space-y-3"
                  >

                    <input
                      type="text"
                      value={isEditingRoom.room}
                      onChange={(e) =>
                        setIsEditingRoom({
                          ...isEditingRoom,
                          room: e.target.value
                        })
                      }
                      className="w-full border rounded-xl p-2"
                      placeholder="Sala"
                    />

                    <input
                      type="text"
                      value={isEditingRoom.doctor}
                      onChange={(e) =>
                        setIsEditingRoom({
                          ...isEditingRoom,
                          doctor: e.target.value
                        })
                      }
                      className="w-full border rounded-xl p-2"
                      placeholder="Médico"
                    />

                    <div className="flex justify-between">

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteRoom(item.id)
                        }
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setIsEditingRoom(null)
                          }
                          className="bg-slate-200 px-3 py-2 rounded-xl"
                        >
                          <X size={14} />
                        </button>

                        <button
                          type="submit"
                          className="bg-indigo-600 text-white px-3 py-2 rounded-xl"
                        >
                          Salvar
                        </button>

                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between mb-3">

                      <div>
                        <div className="font-black">
                          {item.room}
                        </div>

                        <div className="text-sm text-slate-500">
                          {item.doctor}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setIsEditingRoom(item)
                        }
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>

                    {/* STATUS LIMPO E SOMENTE O ATIVO COLORIDO */}
                    <div className="grid grid-cols-3 gap-2">

                      {/* LIVRE */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            item.id,
                            'available'
                          )
                        }
                        className={`rounded-xl py-2 text-xs font-black border transition-all duration-300 ${
                          item.status === 'available'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                            : 'bg-white border-slate-300 text-slate-500 hover:border-emerald-400'
                        }`}
                      >
                        LIVRE
                      </button>

                      {/* OCUPADO */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            item.id,
                            'busy'
                          )
                        }
                        className={`rounded-xl py-2 text-xs font-black border transition-all duration-300 ${
                          item.status === 'busy'
                            ? 'bg-red-600 border-red-600 text-white shadow-lg'
                            : 'bg-white border-slate-300 text-slate-500 hover:border-red-400'
                        }`}
                      >
                        OCUPADO
                      </button>

                      {/* AUSENTE */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            item.id,
                            'away'
                          )
                        }
                        className={`rounded-xl py-2 text-xs font-black border transition-all duration-300 ${
                          item.status === 'away'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg'
                            : 'bg-white border-slate-300 text-slate-500 hover:border-amber-400'
                        }`}
                      >
                        AUSENTE
                      </button>

                    </div>
                  </>
                )}
              </div>
            ))}

            {availability.length === 0 && (
              <div className="text-center py-6 border border-dashed rounded-2xl text-slate-400 flex flex-col items-center">
                <UserCheck
                  size={32}
                  className="opacity-20 mb-2"
                />

                <p className="text-[10px] font-black uppercase tracking-widest">
                  Nenhuma sala cadastrada
                </p>
              </div>
            )}

            {/* NOVA SALA */}
            {isAddingRoom ? (
              <form
                onSubmit={handleSaveRoom}
                className="p-4 bg-slate-50 rounded-2xl border space-y-3"
              >

                <input
                  type="text"
                  value={newRoom.room}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      room: e.target.value
                    })
                  }
                  className="w-full border rounded-xl p-2"
                  placeholder="Sala"
                  required
                />

                <input
                  type="text"
                  value={newRoom.doctor}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      doctor: e.target.value
                    })
                  }
                  className="w-full border rounded-xl p-2"
                  placeholder="Médico"
                  required
                />

                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setIsAddingRoom(false)
                    }
                    className="bg-slate-200 px-4 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
                  >
                    Adicionar
                  </button>

                </div>
              </form>
            ) : (
              <button
                onClick={() =>
                  setIsAddingRoom(true)
                }
                className="w-full border-2 border-dashed border-slate-200 py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Adicionar Sala / Médico
              </button>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="bg-indigo-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">

          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>

          <h3 className="text-lg font-black mb-3 relative z-10 uppercase tracking-tight">
            Dica SISCHAM
          </h3>

          <p className="text-indigo-200 leading-relaxed text-sm relative z-10 opacity-90">
            A transmissão para o painel TV está ativa.
            Todas as chamadas realizadas aqui serão
            reproduzidas instantaneamente na tela remota
            com voz e alerta sonoro.
          </p>
        </div>
      </div>
    </div>
  );
}