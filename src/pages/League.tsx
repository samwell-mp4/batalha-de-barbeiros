import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Swords, MapPin, Globe, ShieldCheck,
  Info, Search, Filter, BarChart3,
  LayoutGrid, X, ChevronLeft,
  Check, Star, Plus, Heart, MessageCircle, Share2, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type View = 'home' | 'create' | 'detail' | 'referee' | 'voting' | 'final';

export default function League() {
  const [view, setView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<'tournaments' | 'my_tournaments' | 'rankings' | 'referee'>('tournaments');
  const [selectedLeague, setSelectedLeague] = useState<number>(1);
  const [createStep, setCreateStep] = useState(0);
  const [form, setForm] = useState({ 
    name: '', 
    modality: 'x1', 
    arbitration: 'hybrid', 
    maxParticipants: 16, 
    prize: '', 
    votingTime: 24, 
    judges: [] as string[], 
    liga: 1, 
    opponentNick: '',
    opponentId: '',
    theme: '',
    startDate: '',
    startTime: '',
    photo1: ''
  });
  const [selectedChamp, setSelectedChamp] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState<any>(null);
  const [dbChampionships, setDbChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [photo2Input, setPhoto2Input] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModality, setFilterModality] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const syncLocalUser = () => {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (JSON.stringify(parsed) !== JSON.stringify(currentUser)) {
            setCurrentUser(parsed);
          }
        } catch (e) {}
      }
    };
    syncLocalUser();
    window.addEventListener('focus', syncLocalUser);
    return () => window.removeEventListener('focus', syncLocalUser);
  }, [view, activeTab]);

  const [dbBarbers, setDbBarbers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);



  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState(0);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    fetchChampionships();
    fetchBarbers();

    // Deep link detection
    const params = new URLSearchParams(window.location.search);
    const championshipId = params.get('championshipId') || params.get('id');
    const autoVote = params.get('autoVote');
    if (championshipId) {
      fetchChampionshipDetails(championshipId);
      setView('detail');

      if (autoVote && currentUser?.id) {
        setTimeout(() => {
          handleVoteSubmit(autoVote, championshipId);
        }, 800);
        // Clear query param
        window.history.replaceState({}, '', `/league?championshipId=${championshipId}`);
      }
    }
  }, []);

  const fetchBarbers = async () => {
    try {
      const data = await api.getBarbers();
      if (data && Array.isArray(data)) {
        // Exclude the current logged-in barber from the options!
        const filtered = data.filter((b: any) => b.userId !== currentUser?.id && b.id !== currentUser?.barberProfile?.id);
        setDbBarbers(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch barbers', error);
    }
  };

  const fetchChampionships = async () => {
    setLoading(true);
    try {
      const data = await api.getChampionships();
      if (data && Array.isArray(data)) {
        setDbChampionships(data);
      }
    } catch (error) {
      console.error('Failed to fetch championships', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChampionshipDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getChampionshipDetails(id);
      if (res && res.id) {
        setSelectedChamp(res);
      }
    } catch (error) {
      console.error('Failed to fetch championship details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChamp?.id && view === 'detail') {
      fetchChampionshipDetails(selectedChamp.id);
    }
  }, [view]);

  const LEAGUES = [
    { id: 1, name: 'Duelo 1x1', type: 'X1 CLASSIC', players: '2', radius: 'Global (Nickname)', duration: 'Definido pelo usuário', icon: <Swords size={18} />, canCreate: true },
    { id: 2, name: 'Campeonato do Bairro', type: 'BAIRRO', players: '8/16/32', radius: '5km', duration: 'Definido pelo usuário', icon: <MapPin size={18} />, canCreate: true },
    { id: 3, name: 'Campeonato Regional', type: 'REGIONAL', players: '32 - 128', radius: 'Região Auto', duration: '5 dias', icon: <LayoutGrid size={18} />, canCreate: true },
    { id: 4, name: 'Campeonato Estadual', type: 'ESTADUAL', players: '64 - 256', radius: 'Estado', duration: '1x por semana', icon: <Globe size={18} />, canCreate: false },
    { id: 5, name: 'Campeonato Brasileiro', type: 'BRASILEIRO', players: '512 - 1024', radius: 'Nacional', duration: '15 dias', icon: <Trophy size={18} />, canCreate: false },
  ];

  const ACTIVE_TOURNAMENTS = [
    { id: 't1', name: 'Batalha do Tatuapé', status: 'semi', liga: 2, type: 'Freestyle', participants: 16, prize: 'R$ 2.500', arbitration: 'Híbrido', progress: 85 },
    { id: 't2', name: 'King of Fade SP', status: 'waiting', liga: 4, type: 'Degradê', participants: 64, prize: 'Cadeira Pro', arbitration: 'IA + Público', progress: 30 }
  ];

  const MODALITIES = [
    { id: 'x1', name: '1x1 Clássico', desc: 'Esquerda VS Direita', icon: '✂️' },
    { id: 'trans', name: 'Transformação', desc: 'Antes ↓ Depois', icon: '✨' },
    { id: 'free', name: 'Freestyle', desc: 'Tema Livre', icon: '🎨' },
    { id: 'deg', name: 'Degradê', desc: 'Simetria & Fade', icon: '📏' },
    { id: 'nav', name: 'Navalhado', desc: 'Precisão Extrema', icon: '🪒' },
  ];

  const renderHome = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full bg-[#F8FAFC]">
      {loading && <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[999] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>}
      <div className="bg-white border-b border-gray-100 px-6 py-6 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-200"><Trophy size={22} className="text-white" /></div>
            <div>
              <h1 className="text-blue-950 text-xl font-black font-orbitron italic tracking-widest uppercase">Elite Leagues</h1>
              <span className="flex items-center text-[8px] font-black text-green-500 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" /> SISTEMA AUTOMATIZADO</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100"><Search size={18} /></button>
            <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100"><Filter size={18} /></button>
          </div>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'tournaments', lab: 'Torneios', icon: <Swords size={14} /> },
            { id: 'my_tournaments', lab: 'Meus', icon: <Plus size={14} /> },
            { id: 'rankings', lab: 'Rankings', icon: <BarChart3 size={14} /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400'}`}>
              {tab.icon}
              <span>{tab.lab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 px-6 py-8">
        {(activeTab === 'tournaments' || activeTab === 'my_tournaments') && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4 px-2"><p className="text-[10px] font-black text-blue-950/40 uppercase tracking-[0.2em] italic">Selecione sua categoria</p><Info size={14} className="text-gray-300" /></div>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                {LEAGUES.map(league => (
                  <button key={league.id} onClick={() => setSelectedLeague(league.id)} className={`min-w-[120px] p-4 rounded-[30px] border-2 transition-all flex flex-col items-center space-y-3 ${selectedLeague === league.id ? 'border-blue-600 bg-white shadow-xl shadow-blue-100 scale-105' : 'border-gray-100 bg-white/50 text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${selectedLeague === league.id ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{league.icon}</div>
                    <div className="text-center"><p className="text-[10px] font-black uppercase italic">{league.name}</p><p className="text-[7px] font-bold uppercase tracking-tighter opacity-60">{league.type}</p></div>
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const l = LEAGUES.find(l => l.id === selectedLeague)!;
              return (
                <div className="bg-blue-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={120} /></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6"><span className="bg-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">{l.name}</span><span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{l.type}</span></div>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {[{lab:'Participantes',val:l.players+' JOGADORES'},{lab:'Raio de Ação',val:l.radius},{lab:'Duração',val:l.duration},{lab:'Criação',val:selectedLeague<=3?'USUÁRIOS':'PLATAFORMA'}].map((item,i)=>(<div key={i}><p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">{item.lab}</p><p className="text-lg font-black italic">{item.val}</p></div>))}
                    </div>
                    <button 
                      onClick={() => { 
                        if (!l.canCreate) return;
                        setForm({...form, liga: selectedLeague, maxParticipants: selectedLeague === 1 ? 2 : 16}); 
                        setView('create'); 
                      }} 
                      disabled={!l.canCreate}
                      className={`w-full py-4 rounded-[20px] font-black text-xs uppercase italic tracking-widest shadow-xl active:scale-95 transition-transform ${l.canCreate ? 'bg-white text-blue-950' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                    >
                      {!l.canCreate ? 'Sistema Automático' : selectedLeague === 1 ? 'Lançar Desafio 1x1' : 'Criar Novo Campeonato'}
                    </button>
                  </div>
                </div>
              );
            })()}

            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <p className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em] italic">
                  {(activeTab as any) === 'my_tournaments' ? 'Torneios Criados por Você' : 'Torneios em Andamento'}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-black text-red-500 uppercase">LIVE</span>
                </div>
              </div>

              {activeTab === 'tournaments' && (
                <div className="mb-6 space-y-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Filtrar Status</p>
                    <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'ongoing', label: 'Em Andamento' },
                        { id: 'waiting', label: 'Inscrições' },
                        { id: 'finished', label: 'Finalizados' }
                      ].map(f => (
                        <button 
                          key={f.id} 
                          onClick={() => { setFilterStatus(f.id); setCurrentPage(1); }} 
                          className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${filterStatus === f.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Filtrar Categoria</p>
                    <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
                      {[
                        { id: 'all', label: 'Todas' },
                        { id: 'x1', label: '1x1' },
                        { id: 'free', label: 'Freestyle' },
                        { id: 'deg', label: 'Degradê' },
                        { id: 'nav', label: 'Navalhado' }
                      ].map(f => (
                        <button 
                          key={f.id} 
                          onClick={() => { setFilterModality(f.id); setCurrentPage(1); }} 
                          className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${filterModality === f.id ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {(() => {
                  if ((activeTab as any) !== 'my_tournaments') return null;
                  
                  const myChampionships = dbChampionships.filter(c => {
                    const currentBarberId = currentUser?.barberProfile?.id;
                    const currentUserId = currentUser?.id;
                    const isCreator = c.creatorId === currentBarberId || c.creatorId === currentUserId;
                    const isParticipant = Array.isArray(c.participants) && c.participants.some((p: any) => p.id === currentBarberId || p.userId === currentUserId);
                    return isCreator || isParticipant;
                  });

                  if (myChampionships.length === 0) {
                    return (
                      <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-[40px] bg-gray-50/50">
                        <Trophy size={40} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Você ainda não criou ou foi convidado para nenhum campeonato.</p>
                      </div>
                    );
                  }

                  return myChampionships.map(t => {
                    const currentBarberId = currentUser?.barberProfile?.id;
                    const isCreator = t.creatorId === currentBarberId || t.creatorId === currentUser?.id;
                    const match = t.matches?.[0];
                    const isAccepted = match?.photo2 !== null && match?.photo2 !== undefined;

                    // Calculate if expired
                    let isExpired = false;
                    if (t.status === 'FINISHED' && match && match.status === 'FINISHED' && !match.winnerId) {
                      isExpired = true;
                    }

                    return (
                      <div key={t.id} onClick={() => { setSelectedChamp(t); setView('detail'); }} className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm relative group overflow-hidden cursor-pointer active:scale-95 transition-all">
                        <div className={`absolute top-0 right-0 h-full w-1.5 ${isExpired ? 'bg-red-500' : isCreator ? 'bg-blue-600' : 'bg-green-500'}`} />
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[7px] font-black uppercase tracking-widest mr-2">{t.modality || '1x1'}</span>
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic uppercase">
                              {isExpired ? 'EXPIRADO' : t.status === 'FINISHED' ? 'FINALIZADO' : !isAccepted ? 'AGUARDANDO ACEITAR' : t.status === 'ONGOING' ? 'EM ANDAMENTO' : 'AGUARDANDO INÍCIO'}
                            </span>
                          </div>
                          {isCreator && <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">Meu Desafio</p>}
                        </div>
                        <h4 className="text-blue-950 text-lg font-black font-orbitron italic mb-4">{t.name.toUpperCase()}</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-black text-blue-950/60 uppercase">
                            {isExpired ? 'Expirou sem aceitação' : !isAccepted ? 'Aguardando oponente confirmar' : 'Pronto para o Combate'}
                          </div>
                          <button className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase italic shadow-lg">Ver Painel</button>
                        </div>
                      </div>
                    );
                  });
                })()}

                {activeTab === 'tournaments' && (() => {
                  const combined = [...dbChampionships, ...ACTIVE_TOURNAMENTS.filter(at => !dbChampionships.find(db => db.name === at.name))];
                  
                  const filtered = combined.filter(t => {
                    // Status matching
                    if (filterStatus !== 'all') {
                      const statusVal = (t.status || '').toLowerCase();
                      if (filterStatus === 'ongoing' && statusVal !== 'ongoing' && statusVal !== 'live') return false;
                      if (filterStatus === 'waiting' && statusVal !== 'waiting' && statusVal !== 'open') return false;
                      if (filterStatus === 'finished' && statusVal !== 'finished') return false;
                    }
                    // Modality matching
                    if (filterModality !== 'all') {
                      const modVal = (t.modality || t.type || '').toLowerCase();
                      if (filterModality === 'x1' && !modVal.includes('x1') && !modVal.includes('classic')) return false;
                      if (filterModality === 'free' && !modVal.includes('free')) return false;
                      if (filterModality === 'deg' && !modVal.includes('deg') && !modVal.includes('fade')) return false;
                      if (filterModality === 'nav' && !modVal.includes('nav')) return false;
                    }
                    return true;
                  });

                  const totalItems = filtered.length;
                  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                  if (paginated.length === 0) {
                    return (
                      <p className="text-center text-[10px] font-black text-gray-400 uppercase py-10 bg-white rounded-3xl border border-gray-100">
                        Nenhum campeonato ativo nesta categoria
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {paginated.map(t => {
                        const statusVal = (t.status || '').toLowerCase();
                        const isFinished = statusVal === 'finished';
                        const isWaiting = statusVal === 'waiting' || statusVal === 'open';
                        
                        return (
                          <div key={t.id} onClick={() => { setSelectedChamp(t); setView('detail'); }} className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm relative group overflow-hidden cursor-pointer active:scale-95 transition-all">
                            <div className="absolute top-0 right-0 h-full w-1.5 bg-blue-600" />
                            <div className="flex justify-between items-start mb-4">
                              <div><span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[7px] font-black uppercase tracking-widest mr-2">{t.modality || t.type || 'Torneio'}</span><span className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic">{isFinished ? 'FINALIZADO' : isWaiting ? 'INSCRIÇÕES' : 'EM ANDAMENTO'}</span></div>
                              <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{t.progress || (isFinished ? 100 : isWaiting ? 0 : 50)}% COMPLETO</p>
                            </div>
                            <h4 className="text-blue-950 text-lg font-black font-orbitron italic mb-4">{t.name.toUpperCase()}</h4>
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">{[1,2,3,4].map(i=>(<img key={i} src={`https://i.pravatar.cc/150?u=${t.id}${i}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" />))}<div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">+{Math.max(0, (Array.isArray(t.participants) ? t.participants.length : (t.participants || 16)) - 4)}</div></div>
                              <button className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase italic shadow-lg">{isFinished ? 'Ver Resultado' : 'Assistir Live'}</button>
                            </div>
                          </div>
                        );
                      })}

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 px-2">
                          <button 
                            disabled={currentPage === 1} 
                            onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }} 
                            className={`px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-300' : 'bg-white text-blue-950 border-gray-200'}`}
                          >
                            Anterior
                          </button>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Página {currentPage} de {totalPages}
                          </span>
                          <button 
                            disabled={currentPage === totalPages} 
                            onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} 
                            className={`px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-300' : 'bg-white text-blue-950 border-gray-200'}`}
                          >
                            Próximo
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        onClick={() => {
          if (currentUser?.role !== 'BARBER') {
            alert('Somente barbeiros profissionais podem criar ou participar de desafios da liga!');
            return;
          }
          setView('create');
        }} 
        className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl z-50 flex items-center justify-center"
      >
        <Plus size={32} />
      </motion.button>
    </motion.div>
  );

  const handleCreateFinish = async () => {
    if (!form.photo1 && form.liga === 1) {
      alert('É obrigatório enviar uma foto do seu trabalho para lançar o desafio!');
      return;
    }
    setLoading(true);
    try {
      const data = await api.createChampionship({
        name: form.name || 'Nova Arena',
        ligaId: form.liga,
        modality: form.modality,
        theme: form.theme,
        prize: form.prize,
        votingTime: form.votingTime,
        maxParticipants: form.maxParticipants,
        startDate: (form.startDate && form.startTime) ? new Date(`${form.startDate}T${form.startTime}:00`).toISOString() : (form.startDate ? new Date(form.startDate).toISOString() : null),
        startTime: form.startTime,
        creatorId: currentUser?.barberProfile?.id || null,
        opponentId: form.opponentId || null,
        opponentNick: form.opponentNick,
        photo1: form.photo1
      });
      setNewlyCreated(data);
      setShowSuccess(true);
      fetchChampionships();
    } catch (error) {
      console.error('Failed to create championship', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCreate = () => (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[6000] bg-white flex flex-col shadow-2xl">
      <div className="px-6 py-8 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => { if(createStep > 0) setCreateStep(s=>s-1); else setView('home'); }} className="p-3 bg-gray-50 rounded-2xl text-blue-950"><ChevronLeft size={24} /></button>
        <div className="text-center"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Passo {createStep + 1} de 3</p><h2 className="text-sm font-black text-blue-950 uppercase italic font-orbitron">Novo Campeonato</h2></div>
        <button onClick={() => setView('home')} className="p-3 bg-gray-50 rounded-2xl text-gray-400"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {createStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-blue-950 uppercase italic font-orbitron">{form.liga === 1 ? 'Qual o nome do Desafio?' : 'Qual o nome da Arena?'}</h3>
            <input type="text" placeholder={form.liga === 1 ? "Ex: Duelo de Gigantes" : "Ex: Batalha do Bairro"} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] border-2 border-gray-200 text-lg font-black outline-none focus:border-blue-600 transition-all !text-blue-950 placeholder:text-gray-400 shadow-sm" />
            
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mt-4">Tema do Campeonato</p>
            <input type="text" placeholder="Ex: Estilo Retro / Degradê Perfeito" value={form.theme} onChange={e=>setForm({...form,theme:e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] border-2 border-gray-200 text-lg font-black outline-none focus:border-blue-600 transition-all !text-blue-950 placeholder:text-gray-400 shadow-sm" />

            <div className="grid grid-cols-2 gap-4 mt-6">
              {LEAGUES.map(l => (
                <button key={l.id} disabled={!l.canCreate} onClick={() => setForm({...form, liga: l.id, maxParticipants: l.id === 1 ? 2 : 16} as any)} className={`p-6 rounded-[30px] border-2 flex flex-col items-center space-y-3 transition-all ${!l.canCreate ? 'opacity-30 grayscale cursor-not-allowed' : ''} ${form.liga === l.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${form.liga === l.id ? 'bg-blue-600 text-white' : 'bg-gray-100 !text-blue-950'}`}>{l.icon}</div>
                  <span className={`text-[10px] font-black uppercase italic ${form.liga === l.id ? 'text-blue-600' : '!text-blue-950'}`}>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {createStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-blue-950 uppercase italic font-orbitron">{form.liga === 1 ? 'Desafiar quem?' : 'Escolha a Modalidade'}</h3>
            {form.liga === 1 ? (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Buscar Barbeiro no Banco de Dados</p>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou barbearia..." 
                    value={searchTerm} 
                    onChange={e=>setSearchTerm(e.target.value)} 
                    className="w-full p-6 pl-16 bg-gray-50 rounded-[25px] border-2 border-gray-200 text-lg font-black outline-none focus:border-blue-600 transition-all !text-blue-950 placeholder:text-gray-400 shadow-sm" 
                  />
                </div>
                
                {selectedOpponent && (
                  <div className="p-4 bg-green-50 rounded-[25px] border-2 border-green-500 flex items-center justify-between animate-in fade-in zoom-in-95">
                    <div className="flex items-center space-x-3">
                      <img src={selectedOpponent.user?.avatar || `https://i.pravatar.cc/150?u=${selectedOpponent.id}`} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-black text-green-950 uppercase">{selectedOpponent.user?.name}</p>
                        <p className="text-[9px] font-bold text-green-700 uppercase">{selectedOpponent.barberShop}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedOpponent(null); setForm(f => ({ ...f, opponentId: '', opponentNick: '' })); }} className="p-2 bg-green-100 hover:bg-green-200 rounded-full text-green-700"><X size={16} /></button>
                  </div>
                )}

                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 no-scrollbar border-t border-gray-100 pt-3">
                  {(() => {
                    const filteredBarbers = dbBarbers.filter(barber => {
                      const name = barber.user?.name?.toLowerCase() || '';
                      const shop = barber.barberShop?.toLowerCase() || '';
                      const query = searchTerm.toLowerCase();
                      return name.includes(query) || shop.includes(query);
                    });

                    if (filteredBarbers.length === 0) {
                      return <p className="text-center text-[10px] font-black text-gray-400 uppercase py-6">Nenhum barbeiro encontrado</p>;
                    }

                    return filteredBarbers.map(barber => (
                      <button 
                        type="button"
                        key={barber.id}
                        onClick={() => {
                          setSelectedOpponent(barber);
                          setForm(f => ({ ...f, opponentId: barber.id, opponentNick: barber.user?.name || '' }));
                          setSearchTerm('');
                        }}
                        className={`w-full p-4 rounded-2xl border-2 text-left flex items-center space-x-3 transition-all ${selectedOpponent?.id === barber.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-300'}`}
                      >
                        <img src={barber.user?.avatar || `https://i.pravatar.cc/150?u=${barber.id}`} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-blue-950 truncate uppercase">{barber.user?.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 truncate uppercase">{barber.barberShop} • {barber.user?.city || 'Brasil'}</p>
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {MODALITIES.map(m => (
                  <button key={m.id} onClick={() => setForm({...form, modality: m.id})} className={`p-6 rounded-[30px] border-2 flex items-center justify-between transition-all ${form.modality === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center space-x-4"><span className="text-3xl">{m.icon}</span><div className="text-left"><p className={`text-sm font-black uppercase ${form.modality === m.id ? 'text-blue-600' : '!text-blue-950'}`}>{m.name}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{m.desc}</p></div></div>
                    {form.modality === m.id && <Check className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {createStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-blue-950 uppercase italic font-orbitron">Configurações Finais</h3>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[30px] border-2 border-gray-100 shadow-inner">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data e Horário de Início</p>
                <div className="flex space-x-2">
                   <input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="flex-1 bg-transparent text-sm font-black outline-none !text-blue-950 uppercase" />
                   <input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} className="flex-1 bg-transparent text-sm font-black outline-none !text-blue-950 uppercase" />
                </div>
              </div>

              {form.liga === 1 && (
                <div className="bg-white p-6 rounded-[30px] border-2 border-gray-100 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Foto do seu corte/trabalho</p>
                  <div className="flex flex-col space-y-3">
                    {form.photo1 ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video group">
                        <img src={form.photo1} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm({...form, photo1: ''})} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500'].map((mockUrl) => (
                            <button key={mockUrl} type="button" onClick={() => setForm({...form, photo1: mockUrl})} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square group">
                              <img src={mockUrl} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <input 
                          type="text" 
                          placeholder="Ou cole a URL de uma foto..." 
                          value={form.photo1} 
                          onChange={e=>setForm({...form, photo1: e.target.value})} 
                          className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-black outline-none focus:border-blue-600 transition-all !text-blue-950 placeholder:text-gray-400 shadow-sm" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-[30px] border-2 border-gray-100 shadow-inner">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Duração da Votação</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 6, 12, 24, 48].map(h => (
                    <button key={h} onClick={() => setForm({...form, votingTime: h})} className={`py-2 rounded-lg font-black text-[10px] ${form.votingTime===h?'bg-blue-600 text-white shadow-lg':'bg-gray-100 text-gray-400'}`}>{h}h</button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[30px] border-2 border-gray-100 shadow-inner">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Premiação</p>
                <input type="text" placeholder="Ex: R$ 5.000 + Kit Barba" value={form.prize} onChange={e=>setForm({...form,prize:e.target.value})} className="w-full bg-transparent text-lg font-black outline-none !text-blue-950 uppercase placeholder:text-gray-400" />
              </div>
              {form.liga !== 1 && (
                <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vagas no Torneio</p>
                  <div className="flex space-x-3">
                    {[8, 16, 32, 64].map(v => (
                      <button key={v} onClick={() => setForm({...form, maxParticipants: v})} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${form.maxParticipants===v?'bg-blue-600 text-white shadow-lg':'bg-white text-gray-400 border border-gray-200'}`}>{v} VAGAS</button>
                    ))}
                  </div>
                </div>
              )}
              {form.liga === 1 && (
                <div className="bg-blue-600 p-6 rounded-[30px] text-white flex items-center justify-between">
                  <div><p className="text-[8px] font-black uppercase opacity-60">Status do Desafio</p><p className="text-sm font-black uppercase italic">2 Participantes (1x1)</p></div>
                  <Swords size={24} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-6 border-t border-gray-100">
        <button 
          disabled={loading}
          onClick={() => { if(createStep < 2) setCreateStep(s=>s+1); else handleCreateFinish(); }} 
          className="w-full py-6 bg-blue-600 disabled:bg-gray-400 text-white rounded-[25px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>{createStep === 2 ? 'Publicar Campeonato' : 'Próximo Passo'}</span>
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderDetail = () => {
    const p1 = selectedChamp?.participants?.[0];
    const p2 = selectedChamp?.participants?.[1];
    const match = selectedChamp?.matches?.[0];
    const votes1 = match ? (selectedChamp.matches[0].votes?.filter((v: any) => v.choiceId === p1?.id)?.length || match.score1 || 0) : 0;
    const votes2 = match ? (selectedChamp.matches[0].votes?.filter((v: any) => v.choiceId === p2?.id)?.length || match.score2 || 0) : 0;

    const currentBarberId = currentUser?.barberProfile?.id;
    const isCreator = currentUser && (selectedChamp?.creatorId === currentBarberId || selectedChamp?.creatorId === currentUser.id);
    const isOpponent = currentUser && Array.isArray(selectedChamp?.participants) && selectedChamp?.participants.some((p: any) => p.id === currentBarberId && p.id !== selectedChamp.creatorId);

    const hasPhoto2 = match && match.photo2 !== null && match.photo2 !== undefined;
    const isX1 = selectedChamp?.modality === 'x1' || selectedChamp?.ligaId === 1;

    // Check expiration status
    let isExpired = false;
    let scheduledStart: Date | null = null;
    if (selectedChamp?.startDate) {
      const datePart = new Date(selectedChamp.startDate).toISOString().split('T')[0];
      const timePart = selectedChamp.startTime || '00:00';
      scheduledStart = new Date(`${datePart}T${timePart}:00`);
      if (new Date() > scheduledStart && !hasPhoto2 && selectedChamp.status === 'WAITING') {
        isExpired = true;
      }
    }

    // Accept handling
    const handleAccept = async () => {
      if (!photo2Input) {
        alert('Por favor, escolha ou insira uma foto do seu trabalho para aceitar o desafio.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.acceptChallenge(selectedChamp.id, photo2Input);
        if (res.error) {
          alert(res.error);
        } else {
          alert('Desafio aceito com sucesso!');
          setPhoto2Input('');
          await fetchChampionshipDetails(selectedChamp.id);
          fetchChampionships();
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao aceitar desafio.');
      } finally {
        setLoading(false);
      }
    };

    // Start now handling
    const handleStartNow = async () => {
      setLoading(true);
      try {
        const res = await api.startBattleNow(selectedChamp.id);
        if (res.error) {
          alert(res.error);
        } else {
          alert('Batalha iniciada agora! Votações abertas.');
          await fetchChampionshipDetails(selectedChamp.id);
          fetchChampionships();
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao iniciar batalha.');
      } finally {
        setLoading(false);
      }
    };

    // Start scheduled handling
    const handleStartScheduled = async () => {
      setLoading(true);
      try {
        const res = await api.startBattleScheduled(selectedChamp.id);
        if (res.error) {
          alert(res.error);
        } else {
          alert('Confirmado! A batalha iniciará no horário agendado automaticamente.');
          await fetchChampionshipDetails(selectedChamp.id);
          fetchChampionships();
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao agendar batalha.');
      } finally {
        setLoading(false);
      }
    };

    // Time calculations
    let votingTimeLeftLabel = '';
    if (selectedChamp?.status === 'ONGOING' && match?.startedAt) {
      const startedTime = new Date(match.startedAt).getTime();
      const votingDurationMs = (selectedChamp.votingTime || 24) * 60 * 60 * 1000;
      const expireTime = startedTime + votingDurationMs;
      const diffMs = expireTime - new Date().getTime();
      if (diffMs > 0) {
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
        const diffMins = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
        votingTimeLeftLabel = `${diffHours}h ${diffMins}m restantes`;
      } else {
        votingTimeLeftLabel = 'Votação Encerrada';
      }
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[5500] bg-[#F8FAFC] flex flex-col shadow-2xl">
        {loading && <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[999] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>}
        <div className="px-6 py-6 flex items-center justify-between bg-white border-b border-gray-100">
          <button onClick={() => setView('home')} className="p-3 bg-gray-50 rounded-2xl text-blue-950"><ChevronLeft size={24} /></button>
          <div className="text-center">
            <span className="text-[8px] font-black text-red-500 uppercase flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse" /> 
              {isExpired ? 'EXPIRADO' : selectedChamp?.status === 'WAITING' ? 'AGUARDANDO' : selectedChamp?.status === 'ONGOING' ? 'LIVE NOW' : 'FINALIZADO'}
            </span>
            <h2 className="text-sm font-black text-blue-950 font-orbitron italic uppercase">{selectedChamp?.name}</h2>
          </div>
          <button className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Share2 size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
                <div className="text-center w-[120px] flex flex-col items-center">
                   {p1 ? (
                     <img src={p1.user?.avatar || `https://i.pravatar.cc/150?u=${p1.id}`} className="w-20 h-20 rounded-full border-4 border-white/20 mb-3 shadow-xl object-cover" />
                   ) : (
                     <div className="w-20 h-20 rounded-full border-4 border-white/20 mb-3 shadow-xl bg-blue-900 flex items-center justify-center text-xl font-black">?</div>
                   )}
                   <p className="text-[10px] font-black uppercase truncate max-w-full">{p1?.user?.name || 'Vaga Aberta'}</p>
                   <div className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-black mt-2 italic">{votes1} Votos</div>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl mb-2 font-orbitron font-black italic text-xl">VS</div>
                   <div className={`px-3 py-1 rounded-full text-[8px] font-black text-black uppercase ${selectedChamp?.status === 'WAITING' ? 'bg-gray-300' : 'bg-yellow-400'}`}>{selectedChamp?.status === 'WAITING' ? 'AGUARDANDO' : 'LIVE NOW'}</div>
                </div>
                <div className="text-center w-[120px] flex flex-col items-center">
                   {p2 ? (
                     <img src={p2.user?.avatar || `https://i.pravatar.cc/150?u=${p2.id}`} className="w-20 h-20 rounded-full border-4 border-white/20 mb-3 shadow-xl object-cover" />
                   ) : (
                     <div className="w-20 h-20 rounded-full border-4 border-white/20 mb-3 shadow-xl bg-blue-900 flex items-center justify-center text-xl font-black">?</div>
                   )}
                   <p className="text-[10px] font-black uppercase truncate max-w-full">{p2?.user?.name || 'Vaga Aberta'}</p>
                   <div className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-black mt-2 italic">{votes2} Votos</div>
                </div>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/5 font-orbitron italic pointer-events-none uppercase">{selectedChamp?.modality || 'x1'}</div>
          </div>

          <div className="p-6 space-y-8">
             {/* Expired Alert */}
             {isExpired && (
               <div className="bg-red-50 text-red-800 p-6 rounded-[30px] border-2 border-red-200">
                 <p className="text-xs font-black uppercase italic mb-1">Desafio Expirado</p>
                 <p className="text-[10px] font-bold">O oponente não aceitou o desafio a tempo. Esta liga está fechada.</p>
               </div>
             )}

             {/* Accept workflow for Opponent */}
             {isX1 && selectedChamp?.status === 'WAITING' && !hasPhoto2 && !isExpired && (
               <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-6">
                 {isOpponent ? (
                   <div className="space-y-4">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Você foi desafiado! Envie uma foto do seu corte para aceitar</p>
                     
                     {photo2Input ? (
                       <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video">
                         <img src={photo2Input} className="w-full h-full object-cover" />
                         <button type="button" onClick={() => setPhoto2Input('')} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"><X size={16} /></button>
                       </div>
                     ) : (
                       <div className="flex flex-col space-y-2">
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Selecione uma foto modelo:</p>
                         <div className="grid grid-cols-3 gap-2">
                           {['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500'].map((mockUrl) => (
                             <button key={mockUrl} type="button" onClick={() => setPhoto2Input(mockUrl)} className="rounded-xl overflow-hidden border border-gray-200 aspect-square">
                               <img src={mockUrl} className="w-full h-full object-cover" />
                             </button>
                           ))}
                         </div>
                         <input 
                           type="text" 
                           placeholder="Ou cole a URL da sua foto..." 
                           value={photo2Input} 
                           onChange={e => setPhoto2Input(e.target.value)} 
                           className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-black outline-none focus:border-blue-600 transition-all !text-blue-950 placeholder:text-gray-400" 
                         />
                       </div>
                     )}

                     <button onClick={handleAccept} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Confirmar e Aceitar Desafio</button>
                   </div>
                 ) : (
                   <div className="text-center py-4">
                     <p className="text-[10px] font-bold text-gray-400 uppercase">Aguardando o oponente enviar a foto e aceitar o desafio.</p>
                     {scheduledStart && (
                       <p className="text-[8px] font-black text-red-500 uppercase mt-2">Prazo máximo: {scheduledStart.toLocaleString()}</p>
                     )}
                   </div>
                 )}
               </div>
             )}

             {/* Creator Start Options */}
             {isX1 && selectedChamp?.status === 'WAITING' && hasPhoto2 && match?.status === 'PENDING' && !isExpired && (
               <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-6">
                 {isCreator ? (
                   <div className="space-y-4">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Desafio Aceito! Escolha como começar:</p>
                     <div className="grid grid-cols-2 gap-3">
                       <button onClick={handleStartNow} className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-lg">
                         <Swords size={20} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Começar Agora</span>
                       </button>
                       <button onClick={handleStartScheduled} className="p-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-lg">
                         <MapPin size={20} className="text-cyan-400" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Esperar Horário</span>
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-4">
                     <p className="text-[10px] font-bold text-gray-400 uppercase">Desafio confirmado! Aguardando o criador iniciar a batalha.</p>
                   </div>
                 )}
               </div>
             )}

             {/* Photo comparison */}
             {match && (match.photo1 || match.photo2) && (
               <div>
                 <div className="flex items-center justify-between mb-4"><p className="text-[10px] font-black text-blue-950 uppercase tracking-widest italic">Trabalhos do Desafio</p></div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm text-center">
                     <div className="rounded-2xl overflow-hidden aspect-square bg-gray-100 mb-2 border border-gray-100">
                       {match.photo1 ? (
                         <img src={match.photo1} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-300 uppercase">Sem foto</div>
                       )}
                     </div>
                     <span className="text-[8px] font-black text-blue-950 uppercase">{p1?.user?.name}</span>
                   </div>
                   <div className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm text-center">
                     <div className="rounded-2xl overflow-hidden aspect-square bg-gray-100 mb-2 border border-gray-100">
                       {match.photo2 ? (
                         <img src={match.photo2} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-300 uppercase">Aguardando...</div>
                       )}
                     </div>
                     <span className="text-[8px] font-black text-blue-950 uppercase">{p2 ? p2.user?.name : 'Convidado'}</span>
                   </div>
                 </div>
               </div>
             )}

             <div className="bg-blue-950 rounded-[30px] p-6 text-white">
                <div className="flex justify-between items-center mb-4"><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Informações da Arena</p><ShieldCheck size={16} className="text-blue-400" /></div>
                <div className="grid grid-cols-2 gap-4">
                   <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Premiação</p><p className="text-sm font-black italic">{selectedChamp?.prize || 'Respeito'}</p></div>
                   <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Vagas</p><p className="text-sm font-black italic">{selectedChamp?.maxParticipants || 2} BARBEIROS</p></div>
                   <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Duração da Votação</p><p className="text-sm font-black italic uppercase">{selectedChamp?.votingTime || 24} HORAS</p></div>
                   <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Tema</p><p className="text-sm font-black italic uppercase">{selectedChamp?.theme || 'Livre'}</p></div>
                </div>
                {votingTimeLeftLabel && (
                  <div className="mt-4 pt-4 border-t border-blue-900 flex items-center justify-between">
                    <span className="text-[8px] font-black text-blue-400 uppercase">Tempo de Voto</span>
                    <span className="text-xs font-black text-yellow-400 uppercase font-orbitron">{votingTimeLeftLabel}</span>
                  </div>
                )}
             </div>

             <div>
                <div className="flex items-center justify-between mb-4"><p className="text-[10px] font-black text-blue-950 uppercase tracking-widest italic">Chaveamento Oficial</p></div>
                <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-6">
                   {selectedChamp?.status === 'WAITING' || !p1 ? (
                     <div className="text-center py-4"><p className="text-[10px] font-bold text-gray-400 uppercase">Chaveamento será gerado assim que as vagas forem preenchidas.</p></div>
                   ) : (
                     <div className={`p-4 rounded-2xl border-2 border-blue-600 bg-blue-50`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-blue-950 uppercase">{p1?.user?.name}</span>
                          <span className="text-[12px] font-black text-blue-600">{votes1} votos</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-blue-600" style={{width: ((votes1 + votes2) > 0 ? (votes1 / (votes1 + votes2) * 100) : 50)+'%'}} />
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-blue-950 uppercase">{p2 ? p2.user?.name : 'Vaga Aberta'}</span>
                           <span className="text-[12px] font-black text-blue-600">{votes2} votos</span>
                        </div>
                     </div>
                   )}
                 </div>
              </div>
           </div>
        </div>
        <div className="p-6 bg-white border-t border-gray-100">
           <button onClick={() => { setStoryIndex(0); setView('voting'); }} className={`w-full py-5 rounded-[20px] font-black uppercase italic tracking-widest shadow-xl transition-all ${selectedChamp?.status !== 'ONGOING' || !p2 || isExpired || votingTimeLeftLabel === 'Votação Encerrada' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white'}`} disabled={selectedChamp?.status !== 'ONGOING' || !p2 || isExpired || votingTimeLeftLabel === 'Votação Encerrada'}>Votar na Arena (Story)</button>
        </div>
      </motion.div>
    );
  };

  const handleVoteSubmit = async (choiceId: string, champIdOverride?: string) => {
    const targetChampId = champIdOverride || selectedChamp?.id;
    if (!currentUser?.id) {
      alert('Você precisa estar logado para votar! Redirecionando para a página de login.');
      sessionStorage.setItem('redirectAfterAuth', `/league?championshipId=${targetChampId}&autoVote=${choiceId}`);
      navigate('/auth');
      return;
    }
    const match = selectedChamp?.matches?.[0];
    let targetMatchId = match?.id;
    if (!targetMatchId && targetChampId) {
      try {
        const details = await api.getChampionshipDetails(targetChampId);
        targetMatchId = details?.matches?.[0]?.id;
      } catch (e) {
        console.error(e);
      }
    }
    if (!targetMatchId) {
      alert('Nenhuma batalha disponível para votar!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.voteMatch(targetChampId, {
        userId: currentUser.id,
        matchId: targetMatchId,
        choiceId: choiceId
      });
      if (res.error) {
        alert(res.error);
      } else {
        alert('Voto computado com sucesso!');
        await fetchChampionshipDetails(targetChampId);
        setView('detail');
      }
    } catch (e: any) {
      console.error(e);
      alert('Falha ao registrar o voto.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!selectedChamp) return;
    const shareUrl = `${window.location.origin}/league?championshipId=${selectedChamp.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link de votação copiado! Compartilhe com seus amigos.');
  };

  const handleLikeToggle = async () => {
    if (!selectedChamp) return;
    if (!currentUser?.id) {
      alert('Você precisa estar logado para dar like! Redirecionando para o login...');
      sessionStorage.setItem('redirectAfterAuth', `/league?championshipId=${selectedChamp.id}`);
      navigate('/auth');
      return;
    }
    try {
      const res = await api.toggleLike(selectedChamp.id, currentUser.id);
      if (res.success) {
        const updatedLikes = res.likes;
        setSelectedChamp((prev: any) => {
          if (!prev || !prev.matches || prev.matches.length === 0) return prev;
          const match = prev.matches[0];
          return {
            ...prev,
            matches: [{ ...match, likes: updatedLikes }, ...prev.matches.slice(1)]
          };
        });
        setDbChampionships((prevList: any[]) => prevList.map(c => {
          if (c.id !== selectedChamp.id || !c.matches || c.matches.length === 0) return c;
          const match = c.matches[0];
          return {
            ...c,
            matches: [{ ...match, likes: updatedLikes }, ...c.matches.slice(1)]
          };
        }));
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao processar like.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChamp || !newCommentText.trim()) return;
    if (!currentUser?.id) {
      alert('Você precisa estar logado para comentar! Redirecionando para o login...');
      sessionStorage.setItem('redirectAfterAuth', `/league?championshipId=${selectedChamp.id}`);
      navigate('/auth');
      return;
    }
    try {
      const res = await api.addComment(selectedChamp.id, currentUser.id, newCommentText);
      if (res.success) {
        const newComment = res.comment;
        setSelectedChamp((prev: any) => {
          if (!prev || !prev.matches || prev.matches.length === 0) return prev;
          const match = prev.matches[0];
          return {
            ...prev,
            matches: [{ ...match, comments: [...(match.comments || []), newComment] }, ...prev.matches.slice(1)]
          };
        });
        setDbChampionships((prevList: any[]) => prevList.map(c => {
          if (c.id !== selectedChamp.id || !c.matches || c.matches.length === 0) return c;
          const match = c.matches[0];
          return {
            ...c,
            matches: [{ ...match, comments: [...(match.comments || []), newComment] }, ...c.matches.slice(1)]
          };
        }));
        setNewCommentText('');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao enviar comentário.');
    }
  };

  const renderVoting = () => {
    const p1 = selectedChamp?.participants?.[0];
    const p2 = selectedChamp?.participants?.[1];
    const match = selectedChamp?.matches?.[0];
    if (!match) return null;

    const activePlayer = storyIndex === 0 ? p1 : p2;
    const activePhoto = storyIndex === 0 ? match.photo1 : match.photo2;
    
    const hasVoted = currentUser?.id && match.votes?.some((v: any) => v.userId === currentUser.id);
    const voteChoice = currentUser?.id && match.votes?.find((v: any) => v.userId === currentUser.id)?.choiceId;

    const votes1 = match.votes?.filter((v: any) => v.choiceId === p1?.id)?.length || match.score1 || 0;
    const votes2 = match.votes?.filter((v: any) => v.choiceId === p2?.id)?.length || match.score2 || 0;
    const totalVotes = votes1 + votes2;
    
    const pct1 = totalVotes > 0 ? Math.round((votes1 / totalVotes) * 100) : 50;
    const pct2 = totalVotes > 0 ? Math.round((votes2 / totalVotes) * 100) : 50;

    const likesCount = match.likes?.length || 0;
    const commentsCount = match.comments?.length || 0;
    const isLiked = currentUser?.id && match.likes?.includes(currentUser.id);

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 w-full max-w-md mx-auto z-[7000] bg-black flex flex-col overflow-hidden text-white"
      >
        {/* Story Progress Bars */}
        <div className="absolute top-4 inset-x-4 flex space-x-1.5 z-50">
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className={`h-full bg-white transition-all duration-300 ${storyIndex >= 0 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className={`h-full bg-white transition-all duration-300 ${storyIndex >= 1 ? 'w-full' : 'w-0'}`} />
          </div>
        </div>

        {/* Story Header */}
        <div className="absolute top-8 inset-x-0 px-6 flex items-center justify-between z-50">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { setView('detail'); setShowCommentsPanel(false); }} 
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src={activePlayer?.user?.avatar || `https://i.pravatar.cc/100?u=${activePlayer?.id}`} 
                className="w-8 h-8 rounded-full border border-white/20 object-cover" 
              />
              <div className="text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-wider">{activePlayer?.user?.name || 'Carregando...'}</p>
                <p className="text-[7px] font-bold text-white/60 uppercase">Corte de Competição</p>
              </div>
            </div>
          </div>
          <span className="text-[8px] font-black bg-blue-600 px-3 py-1 rounded-full uppercase tracking-wider italic font-orbitron">
            {storyIndex === 0 ? 'Trabalho 1/2' : 'Trabalho 2/2'}
          </span>
        </div>

        {/* Click Areas to navigate between slides */}
        <div className="absolute inset-x-0 top-20 bottom-32 z-10 flex">
          <div 
            onClick={() => setStoryIndex(0)} 
            className="flex-1 cursor-w-resize" 
          />
          <div 
            onClick={() => setStoryIndex(1)} 
            className="flex-1 cursor-e-resize" 
          />
        </div>

        {/* Background Cut Photo */}
        <div className="flex-1 relative bg-gray-950 flex items-center justify-center">
          {activePhoto ? (
            <img 
              src={activePhoto} 
              className="w-full h-full object-cover select-none" 
              alt={`Corte de ${activePlayer?.user?.name}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                <Swords size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider">Aguardando envio da foto deste barbeiro</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Interaction Sidebar */}
        <div className="absolute right-4 bottom-32 z-30 flex flex-col space-y-4 items-center">
          <div className="flex flex-col items-center">
            <button 
              onClick={handleLikeToggle}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${isLiked ? 'bg-pink-600 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <span className="text-[8px] font-black uppercase tracking-wider text-white mt-1 shadow-sm">{likesCount} Likes</span>
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={() => setShowCommentsPanel(true)}
              className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
            >
              <MessageCircle size={20} />
            </button>
            <span className="text-[8px] font-black uppercase tracking-wider text-white mt-1 shadow-sm">{commentsCount} Comentários</span>
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
            >
              <Share2 size={20} />
            </button>
            <span className="text-[8px] font-black uppercase tracking-wider text-white mt-1 shadow-sm">Compartilhar</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-black/85 backdrop-blur-md border-t border-white/10 relative z-30 flex flex-col space-y-3">
          {hasVoted ? (
            <div className="space-y-3">
              <p className="text-[9px] font-black text-green-400 uppercase tracking-widest text-center">
                ✓ Seu Voto foi Computado!
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className={`p-3 rounded-2xl border ${voteChoice === p1?.id ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{p1?.user?.name}</p>
                  <p className="text-sm font-black font-orbitron text-white">{pct1}%</p>
                </div>
                <div className={`p-3 rounded-2xl border ${voteChoice === p2?.id ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{p2?.user?.name}</p>
                  <p className="text-sm font-black font-orbitron text-white">{pct2}%</p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => handleVoteSubmit(activePlayer.id)}
              className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase italic tracking-widest shadow-xl transition-all hover:bg-blue-700 active:scale-95 text-xs"
            >
              VOTAR NO CORTE DE {activePlayer?.user?.name}
            </button>
          )}
        </div>

        {/* Comments Sliding Drawer Panel */}
        <AnimatePresence>
          {showCommentsPanel && (
            <>
              <div 
                className="absolute inset-0 bg-black/50 z-[80]" 
                onClick={() => setShowCommentsPanel(false)}
              />
              <motion.div 
                initial={{ y: '100%' }} 
                animate={{ y: 0 }} 
                exit={{ y: '100%' }} 
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="absolute inset-x-0 bottom-0 h-[60%] bg-zinc-900 rounded-t-[30px] border-t border-white/10 z-[90] flex flex-col text-white"
              >
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comentários ({commentsCount})</span>
                  <button 
                    onClick={() => setShowCommentsPanel(false)} 
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {match.comments && match.comments.length > 0 ? (
                    match.comments.map((cmt: any) => (
                      <div key={cmt.id} className="flex space-x-3 text-left">
                        <img 
                          src={cmt.userAvatar} 
                          className="w-8 h-8 rounded-full object-cover border border-white/10" 
                        />
                        <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[9px] font-black text-blue-400 uppercase">{cmt.userName}</span>
                            <span className="text-[7px] text-gray-500">
                              {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-gray-200 uppercase tracking-wide leading-relaxed">
                            {cmt.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-[9px] font-black uppercase tracking-wider">Sem comentários ainda.</p>
                      <p className="text-[7px] font-bold uppercase tracking-wider text-gray-600 mt-1">Seja o primeiro a mandar a braba!</p>
                    </div>
                  )}
                </div>

                <form 
                  onSubmit={handleCommentSubmit}
                  className="p-4 bg-zinc-950 border-t border-white/5 flex items-center space-x-3"
                >
                  <input 
                    type="text" 
                    placeholder="ESCREVA SEU COMENTÁRIO..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-[10px] font-black uppercase tracking-wider text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <button 
                    type="submit"
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderFinal = () => {
    const p1 = selectedChamp?.participants?.[0];
    const p2 = selectedChamp?.participants?.[1];
    const match = selectedChamp?.matches?.[0];
    const votes1 = match ? (selectedChamp.matches[0].votes?.filter((v: any) => v.choiceId === p1?.id)?.length || match.score1 || 0) : 0;
    const votes2 = match ? (selectedChamp.matches[0].votes?.filter((v: any) => v.choiceId === p2?.id)?.length || match.score2 || 0) : 0;
    
    const winner = votes1 >= votes2 ? p1 : p2;
    const winnerVotes = votes1 >= votes2 ? votes1 : votes2;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[8000] bg-blue-950 flex flex-col items-center justify-center text-center p-8 overflow-hidden shadow-2xl">
         <div className="absolute top-0 left-0 w-full h-full"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" /></div>
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }} className="relative z-10 mb-12">
            <div className="w-48 h-48 bg-yellow-400 rounded-[60px] flex items-center justify-center shadow-2xl rotate-12 relative"><Trophy size={100} className="text-blue-950 -rotate-12" /><div className="absolute -top-4 -right-4 bg-white p-4 rounded-3xl shadow-xl text-blue-600 rotate-12"><Star size={32} fill="currentColor" /></div></div>
         </motion.div>
         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10">
            <p className="text-cyan-400 font-black font-orbitron tracking-[0.4em] uppercase text-[12px] mb-4">Vencedor do Combate</p>
            <h2 className="text-4xl font-black text-white font-orbitron italic uppercase tracking-tighter mb-4">{winner?.user?.name || 'Sem Vencedor'}</h2>
            <div className="flex items-center justify-center space-x-3 mb-12">
              <span className="text-[14px] font-black text-blue-200 uppercase tracking-widest italic">{winnerVotes} Votos</span>
            </div>
            <button onClick={() => setView('home')} className="px-12 py-6 bg-white text-blue-950 rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all">Sair da Arena</button>
         </motion.div>
         <div className="absolute bottom-0 w-full p-8"><p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] italic">Próxima Batalha em breve</p></div>
      </motion.div>
    );
  };

  return (
    <div className="h-full relative font-inter overflow-hidden no-scrollbar">
      <AnimatePresence mode="wait">
        {view === 'home' && renderHome()}
        {view === 'create' && renderCreate()}
        {view === 'detail' && renderDetail()}
        {view === 'voting' && renderVoting()}
        {view === 'final' && renderFinal()}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-blue-950/95 flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[50px] p-10 text-center w-full max-w-sm shadow-2xl">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-lg shadow-green-200">
                <Check size={50} strokeWidth={4} />
              </div>
              <h2 className="text-2xl font-black text-blue-950 font-orbitron italic uppercase mb-2 tracking-tighter">Sucesso Total!</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Sua arena está ativa e pronta para os combates.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => { 
                    setShowSuccess(false); 
                    setView('detail'); 
                    setSelectedChamp(newlyCreated); 
                    setCreateStep(0); 
                    setForm({ name: '', modality: 'x1', arbitration: 'hybrid', maxParticipants: 16, prize: '', votingTime: 24, judges: [] as string[], liga: 1, opponentNick: '', opponentId: '', theme: '', startDate: '', startTime: '', photo1: '' });
                    setSelectedOpponent(null);
                  }} 
                  className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase italic tracking-widest shadow-xl"
                >
                  Ver Detalhes Agora
                </button>
                <button 
                  onClick={() => { 
                    setShowSuccess(false); 
                    setView('home'); 
                    setCreateStep(0); 
                    setForm({ name: '', modality: 'x1', arbitration: 'hybrid', maxParticipants: 16, prize: '', votingTime: 24, judges: [] as string[], liga: 1, opponentNick: '', opponentId: '', theme: '', startDate: '', startTime: '', photo1: '' }); 
                    setSelectedOpponent(null);
                  }} 
                  className="w-full py-4 text-blue-950 font-black uppercase text-[10px] tracking-widest"
                >
                  Voltar para Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
