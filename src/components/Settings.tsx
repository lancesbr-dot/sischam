import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../App';
import { FileText, Download, ShieldCheck, Database, RefreshCcw, Youtube, UploadCloud, Trash2, Video, Image as ImageIcon, Play, LayoutGrid, Clock } from 'lucide-react';

export default function Settings() {
  const [youtubeInput, setYoutubeInput] = useState('vG2PNdI8axE');
  const [youtubeId, setYoutubeId] = useState('vG2PNdI8axE');
  const [standbyMode, setStandbyMode] = useState<'youtube' | 'local' | 'static'>('youtube');
  const [standbyTime, setStandbyTime] = useState(10);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.youtube_id) {
        setYoutubeId(data.youtube_id);
        setYoutubeInput(data.youtube_id);
      }
      if (data.standby_mode) {
        setStandbyMode(data.standby_mode);
      }
      if (data.standby_time) {
        setStandbyTime(Number(data.standby_time));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchMedia();

    const handleSettingsUpdated = () => {
      fetchSettings();
      fetchMedia();
    };

    socket.on('settings-updated', handleSettingsUpdated);
    return () => {
      socket.off('settings-updated', handleSettingsUpdated);
    };
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMediaList(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const extractYoutubeId = (url: string) => {
    if (!url) return '5QNMCtuNqyI';
    
    // If it's already an 11-char ID
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) return url;

    // Handle standard URLs
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7].length === 11) return match[7];

    // Fallback for some other formats
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v') || url;
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1) || url;
      }
    } catch (e) {
      // Not a valid URL, return as is
    }
    
    return url;
  };

  const handleSaveYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYoutubeId(youtubeInput);
    setYoutubeId(id);
    setStandbyMode('youtube');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          standby_mode: 'youtube',
          youtube_id: id,
        }),
      });
      alert('Vídeo do YouTube configurado com sucesso! ' + (id !== youtubeInput ? `(ID: ${id})` : ''));
    } catch (error) {
      console.error('Error saving YouTube settings:', error);
    }
  };

  const handleToggleMode = async (mode: 'youtube' | 'local' | 'static') => {
    if (mode === 'local' && mediaList.length === 0) {
      alert('Por favor, faça upload de pelo menos uma imagem ou vídeo antes de ativar o modo local.');
      return;
    }
    setStandbyMode(mode);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          standby_mode: mode,
        }),
      });
      if (res.ok) {
        socket.emit('settings-updated');
        if (mode === 'static') {
          alert('Modo Tela Estática de Senhas ativado com sucesso!');
        } else if (mode === 'youtube') {
          alert('Modo YouTube ativado com sucesso!');
        } else if (mode === 'local') {
          alert('Modo Mídia Local ativado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Error toggling standby mode:', error);
    }
  };

  const handleActivateLocalMode = async () => {
    if (mediaList.length === 0) {
      alert('Por favor, faça upload de pelo menos uma imagem ou vídeo antes de ativar o modo local.');
      return;
    }
    setStandbyMode('local');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          standby_mode: 'local',
        }),
      });
      alert('Modo Mídia Local ativado com sucesso!');
    } catch (error) {
      console.error('Error activating local mode:', error);
    }
  };

  const handleSaveStandbyTime = async (seconds: number) => {
    // Prevent negative or zero time values
    const validSecs = Math.max(1, seconds);
    setStandbyTime(validSecs);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          standby_time: validSecs,
        }),
      });
    } catch (error) {
      console.error('Error saving standby time:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchMedia();
        socket.emit('settings-updated');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm('Deseja realmente excluir este arquivo?')) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      await fetchMedia();
      socket.emit('settings-updated');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDownloadPDF = () => {
    window.location.href = '/api/reports/pdf';
  };

  const handleDownloadExcel = () => {
    window.location.href = '/api/reports/excel';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6 mb-12">
        <div className="h-20 w-20 bg-indigo-700 rounded-[2rem] shadow-xl flex items-center justify-center text-white">
          <Database size={40} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-800">Administração</h2>
          <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Controle de Dados e Relatórios Gerenciais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Management Section */}
        <section className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-slate-50 relative overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <LayoutGrid size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800 uppercase tracking-tight">
                <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                  <Play size={24} />
                </span>
                Mídia de Espera (Standby)
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Configure o que aparece na TV quando não há chamadas.</p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              <button 
                onClick={() => handleToggleMode('youtube')}
                className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center cursor-pointer ${standbyMode === 'youtube' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                YouTube
              </button>
              <button 
                onClick={() => handleToggleMode('local')}
                className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center cursor-pointer ${standbyMode === 'local' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Mídia Local
              </button>
              <button 
                onClick={() => handleToggleMode('static')}
                className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center cursor-pointer ${standbyMode === 'static' ? 'bg-indigo-950 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                Tela Estática
              </button>
            </div>
          </div>

          {/* Standby Timeout Configuration */}
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-700">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest leading-none mb-1">Tempo de Inatividade (Standby)</h4>
                <p className="text-xs text-slate-500 font-medium">Após quantos segundos sem chamadas a tela de espera será iniciada.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
                {[5, 10, 30, 60].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSaveStandbyTime(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${standbyTime === preset ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`}
                  >
                    {preset}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <input
                  type="number"
                  min="1"
                  max="3600"
                  value={standbyTime || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 1) {
                      handleSaveStandbyTime(val);
                    } else {
                      setStandbyTime(val);
                    }
                  }}
                  onBlur={() => {
                    if (!standbyTime || standbyTime < 1) {
                      handleSaveStandbyTime(10);
                    }
                  }}
                  className="w-16 text-center text-sm font-black text-indigo-700 outline-none"
                />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider pr-1">seg</span>
              </div>
            </div>
          </div>

          {standbyMode === 'static' && (
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border-4 border-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/20 p-4 rounded-2xl text-indigo-400 border border-indigo-500/30">
                  <LayoutGrid size={32} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-widest mb-1">Tela Estática de Senhas Ativa</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    A TV não reproduzirá conteúdos multimídia (vídeos e imagens). A tela de chamadas e o histórico de senhas permanecerão fixos e perfeitamente carregados durante a inatividade.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
            {/* YouTube Part */}
            <div className={`space-y-6 transition-all duration-500 ${standbyMode !== 'youtube' ? 'opacity-30' : ''}`}>
               <div className={`p-6 rounded-[2rem] border transition-all h-full flex flex-col justify-between ${standbyMode === 'youtube' ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                      <Youtube size={20} />
                      <span className="font-black text-xs uppercase tracking-widest text-slate-800">Canais de Vídeo (YouTube)</span>
                    </div>
                    
                    <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-black shadow-inner border border-slate-200">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`https://www.youtube.com/embed/${youtubeId}?controls=0&modestbranding=1&rel=0`}
                          title="YouTube Preview"
                          frameBorder="0"
                        ></iframe>
                    </div>

                    <form onSubmit={handleSaveYoutube} className="space-y-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={youtubeInput}
                          onChange={(e) => setYoutubeInput(e.target.value)}
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-sm pr-12"
                          placeholder="Cole o Link do YouTube aqui"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                          <Youtube size={20} />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {standbyMode === 'youtube' ? 'Atualizar Vídeo' : 'Ativar Modo YouTube'}
                      </button>
                    </form>
                  </div>
               </div>
            </div>

            {/* Local Media Part */}
            <div className={`space-y-6 transition-all duration-500 ${standbyMode !== 'local' ? 'opacity-30' : ''}`}>
               <div className={`p-6 rounded-[2rem] border transition-all flex flex-col h-full justify-between ${standbyMode === 'local' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-indigo-600">
                        <UploadCloud size={20} />
                        <span className="font-black text-xs uppercase tracking-widest text-slate-800">Arquivos Locais</span>
                      </div>
                      <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="video/*,image/*"
                      />
                      <button 
                        onClick={() => {
                          handleToggleMode('local');
                          fileInputRef.current?.click();
                        }}
                        disabled={uploading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer"
                      >
                        {uploading ? <RefreshCcw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        {uploading ? 'Enviando...' : 'Adicionar'}
                      </button>
                    </div>

                    <div className="max-h-[170px] overflow-y-auto space-y-2 pr-2 custom-scrollbar mb-4">
                      {mediaList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                          <ImageIcon size={32} className="mb-2 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-center">Arraste arquivos ou clique em Adicionar</span>
                        </div>
                      ) : (
                        mediaList.map((media) => (
                          <div key={media.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                               <div className="bg-slate-100 w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-slate-500">
                                  {media.type.startsWith('image') ? (
                                    <img src={media.url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <Video size={20} />
                                  )}
                               </div>
                               <div className="flex flex-col overflow-hidden">
                                 <span className="text-xs font-bold text-slate-700 truncate">{media.name}</span>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                   {(media.size / 1024 / 1024).toFixed(1)} MB • {media.type.split('/')[1].toUpperCase()}
                                 </span>
                               </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteMedia(media.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <button 
                       onClick={handleActivateLocalMode}
                       className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer ${standbyMode === 'local' ? 'bg-indigo-700 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-600'}`}
                     >
                       {standbyMode === 'local' ? 'Modo Local Ativo' : 'Ativar Galeria Local'}
                     </button>
                  </div>
               </div>
            </div>

            {/* Static Screen Part */}
            <div className={`space-y-6 transition-all duration-500 ${standbyMode !== 'static' ? 'opacity-30' : ''}`}>
               <div className={`p-6 rounded-[2rem] border transition-all h-full flex flex-col justify-between ${standbyMode === 'static' ? 'bg-indigo-950/5 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <div className="flex items-center gap-3 text-indigo-950 mb-4">
                      <LayoutGrid size={20} className="text-indigo-800" />
                      <span className="font-black text-xs uppercase tracking-widest text-slate-800">Tela Estática de Senhas</span>
                    </div>

                    <div className="mb-4 p-4 rounded-xl bg-slate-900 text-white font-sans text-xs flex flex-col gap-2 h-44 shadow-inner border border-slate-800 justify-center">
                      <div className="text-center border-b border-white/10 pb-2">
                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Painel de TV</span>
                      </div>
                      <div className="flex justify-between items-center text-center py-2 px-3">
                        <div className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-black text-2xl animate-pulse">001</div>
                        <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">Sala 02</div>
                      </div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-widest text-center pt-2 border-t border-white/10 leading-normal">
                        Histórico e avisos operacionais sempre visíveis
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                      Recomendado para hospitais, clínicas e recepções integradas. Mantém o histórico de chamadas e a senha atual visíveis perpetuamente sem vídeos ou mídias dinâmicas de cobertura.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <button 
                       onClick={() => handleToggleMode('static')}
                       className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer ${standbyMode === 'static' ? 'bg-indigo-950 text-white shadow-indigo-900/40' : 'bg-slate-200 text-slate-600'}`}
                     >
                       {standbyMode === 'static' ? 'Tela Estática Ativa' : 'Ativar Tela Estática'}
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <FileText size={120} />
          </div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800 uppercase tracking-tight">
            <span className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <FileText size={20} />
            </span>
            Exportação de Dados
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
              <div>
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Relatório Completo (PDF)</h4>
                <p className="text-sm text-slate-500 font-medium">Documento formatado para arquivamento oficial.</p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-5 rounded-2xl border border-blue-100 shadow-sm transition-all active:scale-95"
              >
                <Download size={24} />
              </button>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-green-200 transition-colors">
              <div>
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Planilha de Auditoria (Excel)</h4>
                <p className="text-sm text-slate-500 font-medium">Análise de tempo e métricas em ferramentas externas.</p>
              </div>
              <button 
                onClick={handleDownloadExcel}
                className="bg-white hover:bg-green-600 hover:text-white text-green-600 p-5 rounded-2xl border border-green-100 shadow-sm transition-all active:scale-95"
              >
                <Download size={24} />
              </button>
            </div>
          </div>
        </section>

        {/* System Health Section */}
        <section className="bg-indigo-900 p-10 rounded-[3rem] shadow-xl text-white">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2 uppercase tracking-tight">
            <ShieldCheck className="text-green-400" />
            Integridade do Sistema
          </h3>
          <div className="space-y-8">
            <div className="flex items-center justify-between py-4 border-b border-white/10">
              <span className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest">Conexão WebSocket</span>
              <span className="flex items-center gap-2 text-green-400 font-black text-xs uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                Sincronizado
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-white/10">
              <span className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest">Banco Local</span>
              <span className="text-white font-black text-xs uppercase tracking-[0.2em]">SQLite 3 Ativo</span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-white/10">
              <span className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest">Voz Sintetizada</span>
              <span className="text-white font-black text-xs uppercase tracking-[0.2em]">PT-BR Ativo</span>
            </div>
            
            <button className="w-full mt-6 flex items-center justify-center gap-3 py-6 bg-indigo-800/50 hover:bg-red-600/20 hover:text-red-400 text-indigo-300 font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] border-2 border-indigo-700/50 transition-all group">
              <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              Resetar Banco de Dados
            </button>
          </div>
        </section>
      </div>

      <footer className="mt-20 py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
        <p>SISCHAM Professional Edition • © 2026</p>
      </footer>
    </div>
  );
}
