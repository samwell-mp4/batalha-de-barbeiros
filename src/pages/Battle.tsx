import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_BARBERS, MOCK_TOURNAMENTS, TOURNAMENT_TYPES, MOCK_BATTLES } from '@/constants/mockData';
import { Swords, Trophy, Zap, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export default function Arena() {
  const context = useOutletContext<{ isBarberView: boolean }>() || { isBarberView: true };
  const { isBarberView } = context;
  const [activeTab, setActiveTab] = useState(TOURNAMENT_TYPES.X1.id);
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [voted, setVoted] = useState(false);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.getPosts();
      setDbPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      // setLoading(false);
    }
  };

  const battles = dbPosts.length > 0 ? dbPosts.map(p => ({
    id: p.id,
    category: 'BATALHA LIVE',
    imageLeft: p.imageUrl,
    imageRight: 'https://images.unsplash.com/photo-1599351431247-f132f826d98d?q=80&w=1974&auto=format&fit=crop', // Fallback VS image
    barberLeft: { name: p.barber.user.name, avatar: p.barber.user.avatar, xp: 1200 },
    barberRight: { name: 'Desafiante', avatar: 'https://i.pravatar.cc/150?u=opp', xp: 800 }
  })) : MOCK_BATTLES;

  const battle = battles[currentBattleIndex];

  const handleVote = (_side: 'left' | 'right') => {
    setVoted(true);
    setTimeout(() => {
      setVoted(false);
      setCurrentBattleIndex((prev) => (prev + 1) % MOCK_BATTLES.length);
    }, 1200);
  };

  const renderBracket = () => (
    <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-[24px] border border-gray-200 overflow-x-auto no-scrollbar">
       <div className="flex flex-col space-y-4 shrink-0">
          <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-2">
            <img src={MOCK_BARBERS[0].avatar} className="w-6 h-6 rounded-full" />
            <span className="text-[10px] font-black uppercase text-blue-900">Junior</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-2">
            <img src={MOCK_BARBERS[1].avatar} className="w-6 h-6 rounded-full" />
            <span className="text-[10px] font-black uppercase text-blue-900">Gui Barber</span>
          </div>
       </div>
       <div className="h-[2px] w-8 bg-blue-200 shrink-0 mx-2" />
       <div className="flex flex-col space-y-4 shrink-0">
          <div className="bg-blue-600 px-4 py-3 rounded-xl border border-blue-700 shadow-md flex items-center space-x-2">
            <Trophy size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase text-white">Finalista</span>
          </div>
       </div>
       <div className="h-[2px] w-8 bg-blue-200 shrink-0 mx-2" />
       <div className="flex flex-col space-y-4 shrink-0 text-right">
          <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-2 opacity-50">
            <img src={MOCK_BARBERS[2].avatar} className="w-6 h-6 rounded-full" />
            <span className="text-[10px] font-black uppercase text-blue-900">Marcos</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center space-x-2 opacity-50">
            <img src={MOCK_BARBERS[3].avatar} className="w-6 h-6 rounded-full" />
            <span className="text-[10px] font-black uppercase text-blue-900">Felipe</span>
          </div>
       </div>
    </div>
  );

  // VIEW: USUÁRIO (Torcedor / Votação Live)
  if (!isBarberView) {
    if (!battle) return <div className="flex-1 bg-black h-full flex justify-center items-center font-orbitron text-white">Buscando Arenas...</div>;
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#030303] relative">
        <div className="px-4 py-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full">
          <div>
            <p className="text-cyan-400 text-[10px] uppercase font-black tracking-[0.2em] font-orbitron drop-shadow-[0_0_5px_rgba(34,211,238,1)]">Live Arena</p>
            <h1 className="text-white text-2xl font-black uppercase font-orbitron italic">{battle.category}</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center space-x-2 border border-cyan-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
            <span className="text-white font-black text-xs font-orbitron tracking-tighter">VOTAÇÃO</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={battle.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex-1 flex flex-col relative h-full">
            <div className="flex-1 relative overflow-hidden group">
              <img src={battle.imageLeft} className="w-full h-full object-cover grayscale-[30%]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-center">
                <div className="flex items-center mb-4">
                  <img src={battle.barberLeft.avatar} className="w-16 h-16 rounded-full border-2 border-cyan-400 p-1" />
                  <div className="ml-4">
                    <h2 className="text-white font-black text-xl font-orbitron italic">{battle.barberLeft.name.toUpperCase()}</h2>
                    <span className="text-cyan-400 font-black text-[10px] font-orbitron">LVL {Math.floor(battle.barberLeft.xp/200)}</span>
                  </div>
                </div>
                {!voted && <button onClick={() => handleVote('left')} className="bg-cyan-500 w-fit px-8 py-3 rounded-full text-black font-black font-orbitron text-xs uppercase shadow-[0_0_30px_rgba(34,211,238,0.5)]">VOTAR</button>}
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
               <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border-2 border-white/20 flex items-center justify-center shadow-2xl"><span className="text-white font-black italic text-2xl font-orbitron">VS</span></div>
            </div>
            <div className="flex-1 relative overflow-hidden group">
              <img src={battle.imageRight} className="w-full h-full object-cover grayscale-[30%]" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-center items-end text-right">
                <div className="flex items-center flex-row-reverse mb-4">
                  <img src={battle.barberRight.avatar} className="w-16 h-16 rounded-full border-2 border-white p-1" />
                  <div className="mr-4">
                    <h2 className="text-white font-black text-xl font-orbitron italic">{battle.barberRight.name.toUpperCase()}</h2>
                    <span className="text-white/60 font-black text-[10px] font-orbitron">LVL {Math.floor(battle.barberRight.xp/200)}</span>
                  </div>
                </div>
                {!voted && <button onClick={() => handleVote('right')} className="bg-white w-fit px-8 py-3 rounded-full text-black font-black font-orbitron text-xs uppercase shadow-[0_0_30px_rgba(255,255,255,0.3)]">VOTAR</button>}
              </div>
            </div>
            {voted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center z-50">
                <Trophy size={100} className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]" />
                <h2 className="text-white text-3xl font-black mt-8 font-orbitron italic animate-pulse">VOTO COMPUTADO</h2>
                <div className="mt-4 flex items-center space-x-2 text-cyan-400 font-orbitron font-black text-sm"><Zap size={16} fill="currentColor" /><span>+50 XP DE TORCEDOR</span></div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // VIEW: BARBEIRO (Arena Standard)
  return (
    <div className="flex flex-col h-full bg-[#f0f4f8] font-inter text-blue-950 overflow-hidden relative">
      <div className="px-6 pt-8 pb-4 bg-white shadow-sm z-10">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-blue-600 p-2 rounded-xl"><Swords size={20} className="text-white" /></div>
          <h1 className="text-2xl font-black italic tracking-tighter font-orbitron uppercase text-blue-950">Arena Hub</h1>
        </div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
          {Object.values(TOURNAMENT_TYPES).map((type) => (
            <button key={type.id} onClick={() => setActiveTab(type.id)} className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border-2 transition-all shrink-0 ${activeTab === type.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              <span>{type.icon}</span><span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <AnimatePresence mode="wait">
          {activeTab === TOURNAMENT_TYPES.X1.id && (
            <motion.div key="x1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] border border-blue-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
                <h2 className="text-xl font-black uppercase italic text-blue-950 mb-1">Radar de Combate</h2>
                <p className="text-xs text-gray-500 font-medium mb-6">Próximos Serviço em 5km.</p>
                <div className="space-y-3 relative z-10">
                  {MOCK_BARBERS.slice(1, 4).map((barber) => (
                    <div key={barber.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img src={barber.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                        <div><p className="text-sm font-black text-blue-950">{barber.name}</p><div className="flex items-center space-x-1 text-[9px] font-bold text-gray-400"><MapPin size={10} /><span>2.5 km</span></div></div>
                      </div>
                      <button className="bg-blue-600 text-white p-3 rounded-xl shadow-md active:scale-95 transition-all"><Swords size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {(activeTab === TOURNAMENT_TYPES.BAIRRO.id || activeTab === TOURNAMENT_TYPES.REGIONAL.id) && (
            <motion.div key="tournaments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <button className="w-full bg-blue-50 border-2 border-dashed border-blue-200 text-blue-600 py-4 rounded-[24px] font-black text-xs uppercase">+ Criar Campeonato</button>
              {MOCK_TOURNAMENTS.filter(t => t.type.id === activeTab).map(tournament => (
                <div key={tournament.id} className="bg-white p-6 rounded-[32px] border border-blue-50 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div><span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase text-[8px] font-black">Mata-Mata</span><h2 className="text-xl font-black uppercase italic text-blue-950 mt-1">{tournament.name}</h2></div>
                   </div>
                   {renderBracket()}
                   <button className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-md">Inscrever-se</button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
