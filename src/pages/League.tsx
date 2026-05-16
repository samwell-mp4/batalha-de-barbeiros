import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Swords, Users, MapPin, Globe, ShieldCheck,
  Info, Search, Filter, BarChart3, BrainCircuit,
  LayoutGrid, X, ChevronLeft,
  Check, Star, Plus, Heart, MessageCircle, Share2
} from 'lucide-react';
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
    theme: '',
    startDate: '',
    startTime: ''
  });
  const [selectedChamp, setSelectedChamp] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState<any>(null);
  const [dbChampionships, setDbChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChampionships();
  }, []);

  const fetchChampionships = async () => {
    try {
      const data = await api.getChampionships();
      setDbChampionships(data);
    } catch (error) {
      console.error('Failed to fetch championships', error);
    }
  };

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
            { id: 'rankings', lab: 'Rankings', icon: <BarChart3 size={14} /> },
            { id: 'referee', lab: 'Árbitro', icon: <BrainCircuit size={14} /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400'}`}>
              {tab.icon}
              <span>{tab.lab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 px-6 py-8">
        {activeTab === 'tournaments' && (
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
                  {activeTab === 'my_tournaments' ? 'Torneios Criados por Você' : 'Torneios em Andamento'}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-black text-red-500 uppercase">LIVE</span>
                </div>
              </div>
              <div className="space-y-4">
                {(activeTab as any) === 'my_tournaments' && newlyCreated && (
                  <div onClick={() => { setSelectedChamp(newlyCreated); setView('detail'); }} className="bg-white p-6 rounded-[35px] border-2 border-blue-600 shadow-xl relative overflow-hidden cursor-pointer active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4">
                    <div className="absolute top-0 right-0 h-full w-1.5 bg-blue-600" />
                    <div className="flex justify-between items-start mb-4">
                      <div><span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[7px] font-black uppercase tracking-widest mr-2">{newlyCreated.type}</span><span className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic uppercase">Seu Campeonato</span></div>
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">0% COMPLETO</p>
                    </div>
                    <h4 className="text-blue-950 text-lg font-black font-orbitron italic mb-4">{newlyCreated.name.toUpperCase()}</h4>
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] font-black text-blue-600 uppercase">Aguardando Inscrições</div>
                       <button className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase italic shadow-lg">Gerenciar</button>
                    </div>
                  </div>
                )}
                {(activeTab as string) === 'my_tournaments' && !newlyCreated && (
                  <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-[40px] bg-gray-50/50">
                    <Trophy size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Você ainda não criou nenhum campeonato.</p>
                  </div>
                )}
                {activeTab === 'tournaments' && [...dbChampionships, ...ACTIVE_TOURNAMENTS.filter(at => !dbChampionships.find(db => db.name === at.name))].map(t => (
                  <div key={t.id} onClick={() => { setSelectedChamp(t); setView('detail'); }} className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm relative group overflow-hidden cursor-pointer active:scale-95 transition-all">
                    <div className="absolute top-0 right-0 h-full w-1.5 bg-blue-600" />
                    <div className="flex justify-between items-start mb-4">
                      <div><span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[7px] font-black uppercase tracking-widest mr-2">{t.type || 'Torneio'}</span><span className="text-[7px] font-black text-gray-400 uppercase tracking-widest italic">{t.status==='finished'?'FINALIZADO':t.status==='waiting'?'INSCRIÇÕES':'EM ANDAMENTO'}</span></div>
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{t.progress || 0}% COMPLETO</p>
                    </div>
                    <h4 className="text-blue-950 text-lg font-black font-orbitron italic mb-4">{t.name.toUpperCase()}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">{[1,2,3,4].map(i=>(<img key={i} src={`https://i.pravatar.cc/150?u=${t.id}${i}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" />))}<div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">+{ (t.participants || 16) - 4}</div></div>
                      <button className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase italic shadow-lg">{t.status === 'finished' ? 'Ver Resultado' : 'Assistir Live'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'referee' && (
          <div className="space-y-8">
            <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden text-center">
               <div className="absolute -top-4 -right-4 opacity-10"><BrainCircuit size={140} /></div>
               <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-xl border border-white/10"><ShieldCheck size={16} className="text-cyan-300" /><span className="text-[9px] font-black uppercase tracking-widest">Motor de Arbitragem V2.0</span></div>
               <h2 className="text-3xl font-black font-orbitron italic mb-2 tracking-tighter uppercase leading-tight">Árbitro IA Ativo</h2>
               <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest opacity-80 mb-8">Análise de Simetria e Técnica em Tempo Real</p>
               <div className="bg-black/20 rounded-[30px] p-6 mb-8 border border-white/5">
                  {[{lab:'Simetria & Alinhamento',s:92},{lab:'Qualidade do Acabamento',s:88},{lab:'Iluminação & Ângulo',s:95}].map((c,i)=>(<div key={i} className="mb-4 text-left"><div className="flex justify-between text-[8px] font-black uppercase mb-1.5"><span>{c.lab}</span><span className="text-cyan-300">{c.s}/100</span></div><div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-400" style={{width:c.s+'%'}} /></div></div>))}
               </div>
               <button onClick={() => setView('referee')} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase italic tracking-widest">Entrar na Sala do Árbitro</button>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setView('create')} className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-2xl z-50 flex items-center justify-center"><Plus size={32} /></motion.button>
    </motion.div>
  );

  const handleCreateFinish = async () => {
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
        startDate: form.startDate,
        startTime: form.startTime,
        opponentNick: form.opponentNick
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
        <div className="text-center"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Passo {createStep + 1} de 4</p><h2 className="text-sm font-black text-blue-950 uppercase italic font-orbitron">Novo Campeonato</h2></div>
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
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Digite o Nickname do Oponente</p>
                <input type="text" placeholder="@nickname_do_barbeiro" value={form.opponentNick} onChange={e=>setForm({...form, opponentNick: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] border-2 border-gray-200 text-lg font-black outline-none focus:border-blue-600 transition-all !text-blue-950 placeholder:text-gray-400 shadow-sm" />
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center space-x-3"><Info size={18} className="text-blue-600" /><p className="text-[10px] font-bold text-blue-600 uppercase leading-tight">O oponente receberá uma notificação para aceitar o desafio.</p></div>
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
            <h3 className="text-2xl font-black text-blue-950 uppercase italic font-orbitron">Modo de Arbitragem</h3>
            {[{id:'hybrid',lab:'Híbrido (Pro)',desc:'IA + Público + Jurados',icon:<Users />},{id:'ia',lab:'IA Técnica',desc:'Análise do Sistema',icon:<BrainCircuit />},{id:'public',lab:'Público Total',desc:'Voto da Galera',icon:<LayoutGrid />}].map(m => (
              <button key={m.id} onClick={() => setForm({...form, arbitration: m.id})} className={`w-full p-6 rounded-[30px] border-2 flex items-center justify-between transition-all ${form.arbitration === m.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center space-x-4"><div className={`w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center ${form.arbitration === m.id ? 'text-white bg-blue-600' : '!text-blue-950'}`}>{m.icon}</div><div className="text-left"><p className={`text-sm font-black uppercase ${form.arbitration === m.id ? 'text-blue-600' : '!text-blue-950'}`}>{m.lab}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{m.desc}</p></div></div>
                {form.arbitration === m.id && <Check className="text-blue-600" />}
              </button>
            ))}
          </div>
        )}
        {createStep === 3 && (
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
        <button onClick={() => { if(createStep < 3) setCreateStep(s=>s+1); else handleCreateFinish(); }} className="w-full py-6 bg-blue-600 text-white rounded-[25px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all">
          {createStep === 3 ? 'Publicar Campeonato' : 'Próximo Passo'}
        </button>
      </div>
    </motion.div>
  );

  const renderDetail = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[5500] bg-[#F8FAFC] flex flex-col shadow-2xl">
      <div className="px-6 py-6 flex items-center justify-between bg-white border-b border-gray-100">
        <button onClick={() => setView('home')} className="p-3 bg-gray-50 rounded-2xl text-blue-950"><ChevronLeft size={24} /></button>
        <div className="text-center"><span className="text-[8px] font-black text-red-500 uppercase flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse" /> {selectedChamp?.status === 'waiting' ? 'INSCRIÇÕES ABERTAS' : 'SEMIFINAL LIVE'}</span><h2 className="text-sm font-black text-blue-950 font-orbitron italic uppercase">{selectedChamp?.name}</h2></div>
        <button className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Share2 size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
           <div className="flex items-center justify-between relative z-10">
              <div className="text-center">
                 <div className="w-20 h-20 rounded-full border-4 border-white/20 mb-3 shadow-xl bg-blue-900 flex items-center justify-center text-xl font-black">?</div>
                 <p className="text-[10px] font-black uppercase">Vaga Aberta</p>
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-black mt-2 italic">0 Votos</div>
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl mb-2 font-orbitron font-black italic text-xl">VS</div>
                 <div className={`px-3 py-1 rounded-full text-[8px] font-black text-black uppercase ${selectedChamp?.status === 'waiting' ? 'bg-gray-300' : 'bg-yellow-400'}`}>{selectedChamp?.status === 'waiting' ? 'AGUARDANDO' : 'LIVE NOW'}</div>
              </div>
              <div className="text-center">
                 <div className="w-20 h-20 rounded-full border-4 border-white/20 mb-3 shadow-xl bg-blue-900 flex items-center justify-center text-xl font-black">?</div>
                 <p className="text-[10px] font-black uppercase">Vaga Aberta</p>
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-black mt-2 italic">0 Votos</div>
              </div>
           </div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/5 font-orbitron italic pointer-events-none uppercase">{selectedChamp?.type || 'BATTLE'}</div>
        </div>

        <div className="p-6 space-y-8">
           <div className="bg-blue-950 rounded-[30px] p-6 text-white">
              <div className="flex justify-between items-center mb-4"><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Informações da Arena</p><ShieldCheck size={16} className="text-blue-400" /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Premiação</p><p className="text-sm font-black italic">{selectedChamp?.prize}</p></div>
                 <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Vagas</p><p className="text-sm font-black italic">{selectedChamp?.participants} BARBEIROS</p></div>
                 <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Arbitragem</p><p className="text-sm font-black italic uppercase">{selectedChamp?.arbitration}</p></div>
                 <div><p className="text-[8px] font-black text-blue-400/60 uppercase mb-1">Tema</p><p className="text-sm font-black italic uppercase">{selectedChamp?.theme || 'Livre'}</p></div>
              </div>
           </div>

           <div>
              <div className="flex items-center justify-between mb-4"><p className="text-[10px] font-black text-blue-950 uppercase tracking-widest italic">Chaveamento Oficial</p><p className="text-[8px] font-black text-blue-600 uppercase">Ver Chave Completa</p></div>
              <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-6">
                 {selectedChamp?.status === 'waiting' ? (
                   <div className="text-center py-4"><p className="text-[10px] font-bold text-gray-400 uppercase">Chaveamento será gerado assim que as vagas forem preenchidas.</p></div>
                 ) : (
                   [{p1:'Henrique',p2:'Vitor',s1:12.5,s2:11.8,active:true},{p1:'Gustavo',p2:'Caio',s1:8.2,s2:15.1,active:false}].map((m,i)=>(
                    <div key={i} className={`p-4 rounded-2xl border-2 ${m.active?'border-blue-600 bg-blue-50':'border-gray-50 opacity-60'}`}>
                       <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black text-blue-950 uppercase">{m.p1}</span><span className="text-[12px] font-black text-blue-600">{m.s1}k</span></div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2"><div className="h-full bg-blue-600" style={{width:(m.s1/(m.s1+m.s2)*100)+'%'}} /></div>
                       <div className="flex justify-between items-center"><span className="text-[10px] font-black text-blue-950 uppercase">{m.p2}</span><span className="text-[12px] font-black text-blue-600">{m.s2}k</span></div>
                    </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
      <div className="p-6 bg-white border-t border-gray-100 flex space-x-3">
         <button onClick={() => setView('voting')} className={`flex-[2] py-5 rounded-[20px] font-black uppercase italic tracking-widest shadow-xl transition-all ${selectedChamp?.status === 'waiting' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white'}`} disabled={selectedChamp?.status === 'waiting'}>Votar Agora</button>
         <button onClick={() => setView('referee')} className="flex-1 py-5 bg-gray-900 text-white rounded-[20px] font-black uppercase italic tracking-widest shadow-xl flex items-center justify-center"><BrainCircuit size={20} /></button>
      </div>
    </motion.div>
  );

  const renderReferee = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[7000] bg-black flex flex-col">
       <div className="px-6 py-8 flex items-center justify-between border-b border-white/10">
          <button onClick={() => setView('detail')} className="p-3 bg-white/10 rounded-2xl text-white"><ChevronLeft size={24} /></button>
          <div className="text-center"><p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Sala do Árbitro</p><h2 className="text-sm font-black text-white font-orbitron italic uppercase">Avaliação Técnica</h2></div>
          <div className="w-12" />
       </div>
       <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 h-[300px]">
             <div className="bg-gray-900 rounded-[30px] overflow-hidden relative border-2 border-white/10"><img src="https://picsum.photos/400/600?random=1" className="w-full h-full object-cover opacity-60" /><div className="absolute inset-0 flex items-center justify-center font-black text-white italic">PLAYER L</div></div>
             <div className="bg-gray-900 rounded-[30px] overflow-hidden relative border-2 border-blue-600"><img src="https://picsum.photos/400/600?random=2" className="w-full h-full object-cover" /><div className="absolute top-4 right-4 bg-blue-600 p-2 rounded-lg text-[10px] font-black">AI 89%</div><div className="absolute inset-0 flex items-center justify-center font-black text-white italic">PLAYER R</div></div>
          </div>
          <div className="bg-gray-900 rounded-[40px] p-8 space-y-8 border border-white/5">
             {['Acabamento','Simetria','Transicao','Originalidade'].map(c=>(
                <div key={c} className="space-y-4">
                   <div className="flex justify-between items-center"><p className="text-[10px] font-black text-white uppercase">{c}</p><span className="text-cyan-400 font-black font-orbitron">9.5</span></div>
                   <div className="flex justify-between space-x-1">{[1,2,3,4,5,6,7,8,9,10].map(n=>(<button key={n} className={`flex-1 h-8 rounded-md font-black text-[10px] ${n===9?'bg-cyan-500 text-black':'bg-white/5 text-white/20'}`}>{n}</button>))}</div>
                </div>
             ))}
          </div>
       </div>
       <div className="p-6 bg-black border-t border-white/10">
          <button onClick={() => setView('final')} className="w-full py-6 bg-cyan-500 text-black rounded-[25px] font-black uppercase italic tracking-widest shadow-2xl">Publicar Notas</button>
       </div>
    </motion.div>
  );

  const renderVoting = () => (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[7000] bg-white flex flex-col shadow-2xl">
       <div className="px-6 py-8 flex items-center justify-between border-b border-gray-100">
          <button onClick={() => setView('detail')} className="p-3 bg-gray-50 rounded-2xl text-blue-950"><ChevronLeft size={24} /></button>
          <div className="text-center"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Arena de Votação</p><h2 className="text-sm font-black text-blue-950 font-orbitron italic uppercase">Quem vence essa?</h2></div>
          <div className="w-12" />
       </div>
       <div className="flex-1 flex flex-col p-6 space-y-6">
          <div className="flex-1 grid grid-rows-2 gap-4">
             <div className="rounded-[40px] overflow-hidden relative group border-4 border-transparent hover:border-blue-600 transition-all cursor-pointer">
                <img src="https://picsum.photos/800/600?random=11" className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl"><p className="text-[12px] font-black text-white uppercase italic">Henrique Barber</p></div>
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Check size={80} className="text-white" /></div>
             </div>
             <div className="rounded-[40px] overflow-hidden relative group border-4 border-transparent hover:border-blue-600 transition-all cursor-pointer">
                <img src="https://picsum.photos/800/600?random=12" className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl"><p className="text-[12px] font-black text-white uppercase italic">Vitor do Corte</p></div>
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Check size={80} className="text-white" /></div>
             </div>
          </div>
          <div className="flex items-center justify-center space-x-8 py-4">
             <button className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shadow-lg"><Heart size={32} /></button>
             <button className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-lg"><MessageCircle size={32} /></button>
             <button className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center shadow-lg"><Share2 size={32} /></button>
          </div>
       </div>
    </motion.div>
  );

  const renderFinal = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[8000] bg-blue-950 flex flex-col items-center justify-center text-center p-8 overflow-hidden shadow-2xl">
       <div className="absolute top-0 left-0 w-full h-full"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" /></div>
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }} className="relative z-10 mb-12">
          <div className="w-48 h-48 bg-yellow-400 rounded-[60px] flex items-center justify-center shadow-2xl rotate-12 relative"><Trophy size={100} className="text-blue-950 -rotate-12" /><div className="absolute -top-4 -right-4 bg-white p-4 rounded-3xl shadow-xl text-blue-600 rotate-12"><Star size={32} fill="currentColor" /></div></div>
       </motion.div>
       <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10">
          <p className="text-cyan-400 font-black font-orbitron tracking-[0.4em] uppercase text-[12px] mb-4">Novo Campeão do Tatuapé</p>
          <h2 className="text-5xl font-black text-white font-orbitron italic uppercase tracking-tighter mb-4">Henrique Barber</h2>
          <div className="flex items-center justify-center space-x-3 mb-12"><span className="text-[14px] font-black text-blue-200 uppercase tracking-widest italic">IA Score: 98.5</span><div className="w-2 h-2 rounded-full bg-blue-300" /><span className="text-[14px] font-black text-blue-200 uppercase tracking-widest italic">15k Votos</span></div>
          <button onClick={() => setView('home')} className="px-12 py-6 bg-white text-blue-950 rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all">Sair da Arena</button>
       </motion.div>
       <div className="absolute bottom-0 w-full p-8"><p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] italic italic">Próxima Batalha em 2h 45m</p></div>
    </motion.div>
  );

  return (
    <div className="h-full relative font-inter overflow-hidden no-scrollbar">
      <AnimatePresence mode="wait">
        {view === 'home' && renderHome()}
        {view === 'create' && renderCreate()}
        {view === 'detail' && renderDetail()}
        {view === 'referee' && renderReferee()}
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
                  onClick={() => { setShowSuccess(false); setView('detail'); setSelectedChamp(newlyCreated); }} 
                  className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase italic tracking-widest shadow-xl"
                >
                  Ver Detalhes Agora
                </button>
                <button 
                  onClick={() => { setShowSuccess(false); setView('home'); setCreateStep(0); setForm({ name: '', modality: 'x1', arbitration: 'hybrid', maxParticipants: 16, prize: '', votingTime: 24, judges: [] as string[], liga: 1, opponentNick: '', theme: '', startDate: '', startTime: '' }); }} 
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
