import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_BARBERS } from '@/constants/mockData';
import { 
  Settings, Play, ChevronDown, CheckCircle2, Zap, Flame, Clock, Heart,
  Star, MapPin, Calendar, ChevronRight, X, Shield,
  Navigation, UserPlus, Bookmark, Target, Plus, Camera, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateLevel } from '@/constants/xpSystem';
import { api } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Pega o usuário logado
  const loggedUser = useMemo(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined') return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }, []);

  const isOwnProfile = !id || (loggedUser && loggedUser.id.toString() === id);
  
  // Dados do Barbeiro (do banco/URL ou do usuário logado)
  const [barber] = useState<any>(() => {
    if (isOwnProfile && loggedUser) {
      return {
        id: loggedUser.id,
        name: loggedUser.name || 'Usuário',
        username: (loggedUser.name || 'user').toLowerCase().replace(/\s/g, ''),
        avatar: loggedUser.avatar || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
        xp: loggedUser.xp || 0,
        status: { id: 's1', icon: '⚡', color: '#22c55e' },
        waitTime: 0,
        ...loggedUser.barberProfile
      };
    }
    const found = MOCK_BARBERS.find(b => b.id.toString() === id);
    return found || MOCK_BARBERS[0];
  });

  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [newPostData, setNewPostData] = useState({ imageUrl: '', description: '', category: 'Fade' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOwnProfile) {
      const justRegistered = localStorage.getItem('justRegistered');
      if (justRegistered) {
        setShowWelcomeGuide(true);
        localStorage.removeItem('justRegistered');
      }
    }
  }, [isOwnProfile]);

  // Méritos Dinâmicos (Vazio para novos)
  const merits = barber.merits || [];

  // Highlights Dinâmicos (Vazio para novos)
  const highlights = barber.highlights || [];

  // Feed Dinâmico (Vazio para novos)
  const feedImages = barber.posts || [];

  const toggleLike = (itemId: number) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
    }
    setLikedItems(newLiked);
  };

  const openExternalMap = (type: 'google' | 'waze') => {
    const { latitude, longitude } = barber.coordinates || { latitude: -23.525, longitude: -46.522 };
    const url = type === 'google' 
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    window.open(url, '_blank');
    setShowRouteOptions(false);
  };

  return (
    <div className="flex flex-col bg-[#fcfcfd] min-h-full font-inter text-blue-950 overflow-y-auto no-scrollbar pb-32">
      {/* HEADER SUPERIOR */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-2xl text-blue-950 transition-transform active:scale-90"><ChevronDown size={24} className="rotate-90" /></button>
        <div className="flex flex-col items-center">
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Profissional de Elite</span>
           <div className="flex items-center space-x-1">
              <h1 className="text-sm font-black text-blue-950">{barber.username}</h1>
              <CheckCircle2 size={14} className="text-blue-600 fill-blue-600" />
           </div>
        </div>
        <div className="flex items-center space-x-3">
           {isOwnProfile && (
             <button onClick={() => setShowNewPost(true)} className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg active:scale-90 flex items-center space-x-1 px-3">
               <Plus size={18} />
               <span className="text-[10px] font-black uppercase italic">Postar</span>
             </button>
           )}
           <button onClick={() => setIsFavorited(!isFavorited)} className={`p-2 rounded-2xl transition-all ${isFavorited ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-blue-950'}`}>
              <Heart size={20} className={isFavorited ? 'fill-red-500' : ''} />
           </button>
           <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-50 rounded-2xl text-blue-950 transition-transform active:rotate-90">
              <Settings size={20} />
           </button>
        </div>
      </div>

      {/* IDENTIDADE CENTRAL */}
      <div className="px-6 pt-8 flex flex-col items-center text-center">
         <motion.button 
           whileTap={{ scale: 0.95 }}
           onClick={() => { setSelectedHighlight(highlights[0]); setStoryIndex(0); }}
           className="relative mb-6"
         >
            <div className="w-28 h-28 rounded-[40px] p-1.5 bg-gradient-to-tr from-blue-600 via-cyan-400 to-blue-900 shadow-2xl">
               <img src={barber.avatar} className="w-full h-full rounded-[35px] object-cover border-4 border-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 flex items-center justify-center animate-bounce">
               <Play size={12} className="text-blue-600 fill-blue-600" />
            </div>
         </motion.button>
         
         <h2 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter mb-1">{barber.name}</h2>
         
         {/* STATUS EM TEMPO REAL DISCRETO */}
         <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: barber.status?.color || '#22c55e' }}></div>
            <span className="text-[10px] font-black text-blue-950 uppercase tracking-widest italic">
               {barber.status?.id === 's1' ? 'Disponível Agora' : (barber.waitTime <= 10 ? 'Finalizando Serviço' : 'Em Atendimento')}
            </span>
         </div>

          <div className="flex flex-col items-center space-y-1 mb-8">
            <p className="text-xs text-gray-400 font-bold italic tracking-tight">Mestre do Visagismo Moderno</p>
            <div className="flex items-center space-x-1.5 text-gray-400">
               <Clock size={12} />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Seg - Sáb: 09h às 20h</span>
            </div>
         </div>

         {/* EXIBIR XP APENAS NO PERFIL PESSOAL */}
         {isOwnProfile && (
            <div className="w-full px-6 mb-8">
               <div className="bg-white p-4 rounded-[30px] border border-gray-50 shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                     <div className="text-left">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{calculateLevel(barber.xp || 4500, true).title}</p>
                        <h4 className="text-lg font-black text-blue-950 uppercase italic tracking-tighter">Nível {calculateLevel(barber.xp || 4500, true).level}</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-gray-300 uppercase italic">Próximo: {calculateLevel(barber.xp || 4500, true).nextTitle}</p>
                     </div>
                  </div>
                  
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden mb-3 border border-gray-100/50">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateLevel(barber.xp || 4500, true).progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                     />
                  </div>
                  
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-gray-400">
                        <span className="text-blue-600 font-black">{(barber.xp || 4500).toLocaleString()}</span> / {calculateLevel(barber.xp || 4500, true).nextLevelXp.toLocaleString()} XP
                     </span>
                     <div className="flex items-center space-x-1 text-blue-600 animate-pulse">
                        <Zap size={10} fill="currentColor" />
                        <span className="text-[9px] font-black uppercase italic">Faltam {calculateLevel(barber.xp || 4500, true).remainingXp.toLocaleString()} XP</span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* EXIBIR MISSÕES APENAS NO PERFIL PESSOAL */}
         {isOwnProfile && (
            <div className="w-full px-6 mb-8">
               <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em]">Meus Desafios</h3>
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">3/5 Concluídos</span>
               </div>
               
               <div className="space-y-3">
                  {[
                     { task: 'Vote em 20 Batalhas', progress: 12, total: 20, reward: 100 },
                     { task: 'Finalize 5 Cortes', progress: 3, total: 5, reward: 250 },
                     { task: 'Ganhe 10 Seguidores', progress: 8, total: 10, reward: 100 }
                  ].map((m, i) => (
                     <div key={i} className="bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                        <div className="flex-1 mr-4">
                           <div className="flex justify-between items-center mb-2">
                              <p className="text-[11px] font-black text-blue-950 uppercase italic">{m.task}</p>
                              <span className="text-[9px] font-bold text-gray-400">{m.progress}/{m.total}</span>
                           </div>
                           <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(m.progress / m.total) * 100}%` }} />
                           </div>
                        </div>
                        <div className="flex flex-col items-center min-w-[50px] bg-blue-50/50 p-2 rounded-2xl border border-blue-100/20">
                           <span className="text-[10px] font-black text-blue-600">+{m.reward}</span>
                           <span className="text-[7px] font-black text-blue-400 uppercase">XP</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* STATS DE MÉRITO (3 COLUNAS) */}
         <div className="w-full grid grid-cols-3 gap-2 px-2 mb-8">
            {[{l: 'Atendimentos', v: '1.4k'}, {l: 'Avaliações', v: '850'}, {l: 'Seguidores', v: '3.2k'}].map(s => (
               <div key={s.l} className="bg-white py-3 rounded-2xl border border-gray-50 shadow-sm">
                  <p className="text-base font-black text-blue-950">{s.v}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{s.l}</p>
               </div>
            ))}
         </div>

         {/* BOTÕES SOCIAIS */}
         <div className="flex space-x-3 mb-8 w-full max-w-[280px]">
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isFollowing ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-50'}`}
            >
               {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
            <button className="flex-1 py-3.5 bg-white text-blue-950 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">Mensagem</button>
         </div>
      </div>

      {/* MÉRITOS (3 COLUNAS SLIDER) */}
      <div className="px-6 mb-10">
         <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em]">Conquistas de Carreira</h3>
            <div className="flex space-x-1">
               <div className="w-4 h-1 rounded-full bg-blue-600" />
               <div className="w-1 h-1 rounded-full bg-gray-200" />
            </div>
         </div>
         <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
            {merits.map((merit: any) => (
               <div key={merit.id} className="min-w-[31%] bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl mb-3 ${merit.bg} ${merit.color}`}>{merit.icon}</div>
                  <p className="text-[8px] font-black text-blue-950 uppercase tracking-tighter">{merit.title}</p>
               </div>
            ))}
         </div>
      </div>

      {/* LOCALIZAÇÃO E ROTA */}
      <div className="px-6 mb-10">
         <div className="bg-white p-6 rounded-[35px] border border-gray-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MapPin size={20}/></div>
               <div>
                  <h4 className="text-[10px] font-black text-blue-950 uppercase mb-0.5">{barber.city || 'Sua Cidade'}, {barber.state || 'UF'}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Endereço Privado</p>
               </div>
            </div>
            <button onClick={() => setShowRouteOptions(true)} className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
               <Navigation size={14} className="fill-white"/> <span>Traçar Rota</span>
            </button>
         </div>
      </div>

      {/* DESTAQUES (GEOMÉTRICOS) */}
      <div className="px-6 mb-10 flex space-x-5 overflow-x-auto no-scrollbar">
         {highlights.map((h: any) => (
            <button key={h.id} onClick={() => { setSelectedHighlight(h); setStoryIndex(0); }} className="flex flex-col items-center space-y-2 flex-shrink-0">
               <div className="w-16 h-16 rounded-[24px] p-0.5 border-2 border-blue-50 bg-white shadow-sm overflow-hidden">
                  <img src={h.img} className="w-full h-full rounded-[20px] object-cover hover:scale-110 transition-transform" />
               </div>
               <span className="text-[9px] font-black text-blue-950 uppercase tracking-tighter">{h.label}</span>
            </button>
         ))}
      </div>

      {/* FEED GRID COM LIKE ÚNICO */}
      <div className="px-6 grid grid-cols-3 gap-2">
         {feedImages.map((img: any) => (
            <motion.div 
              key={img.id} 
              whileTap={{ scale: 0.98 }}
              className="aspect-square rounded-[22px] overflow-hidden bg-gray-100 relative group"
            >
               <img src={img.url} className="w-full h-full object-cover" />
               <button 
                 onClick={(e) => { e.stopPropagation(); toggleLike(img.id); }}
                 className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-full text-blue-950 shadow-md transition-all active:scale-150"
               >
                  <Heart size={14} className={likedItems.has(img.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
               </button>
            </motion.div>
         ))}
      </div>

      {/* BOTÃO AGENDAR (MOBILE OPTIMIZED) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-[100] px-2">
         <button className="w-full py-5 bg-blue-600 text-white rounded-[30px] font-black text-xs uppercase italic tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center space-x-3 active:scale-95 transition-all">
            <Calendar size={18} /> <span>Agendar Atendimento</span>
         </button>
      </div>

      {/* STORY VIEWER (MULTI-SLIDE & TOQUE) */}
      <AnimatePresence>
         {selectedHighlight && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black flex flex-col p-4">
               <div className="flex items-center justify-between mt-8 mb-4">
                  <div className="flex items-center space-x-3 text-white">
                     <img src={barber.avatar} className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-lg" />
                     <div>
                      <h4 className="text-2xl font-black text-blue-950 uppercase italic leading-tight">{barber.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 uppercase tracking-widest">
                          RANK {typeof barber.id === 'number' ? (barber.id % 5 + 1) : (barber.id ? (barber.id.length % 5 + 1) : 1)}º
                        </span>
                         <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                           <Star size={10} className="fill-yellow-500 mr-1" />
                           <span className="text-[10px] font-black">{barber.rating || '4.9'}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedHighlight(null)} className="text-white bg-white/10 p-2 rounded-full backdrop-blur-md"><X size={24}/></button>
               </div>
               <div className="flex-1 rounded-[45px] overflow-hidden relative shadow-2xl flex items-center border border-white/5">
                  <img src={selectedHighlight.content[storyIndex]} className="w-full h-full object-cover" />
                  
                  {/* ZONAS DE TOQUE PARA NAVEGAÇÃO */}
                  <div className="absolute inset-0 flex">
                     <div className="flex-[1] h-full cursor-pointer" onClick={() => setStoryIndex(Math.max(0, storyIndex - 1))} title="Anterior" />
                     <div className="flex-[2] h-full cursor-pointer" onClick={() => {
                        if (storyIndex < selectedHighlight.content.length - 1) {
                           setStoryIndex(storyIndex + 1);
                        } else {
                           setSelectedHighlight(null);
                        }
                     }} title="Próximo" />
                  </div>

                  {/* INDICADORES DE PROGRESSO SUPERIOR */}
                  <div className="absolute top-4 left-6 right-6 flex space-x-1.5">
                     {selectedHighlight.content.map((_: any, idx: number) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: idx <= storyIndex ? '100%' : '0%' }}
                             transition={{ duration: 0.3 }}
                             className="h-full bg-white shadow-[0_0_10px_white]"
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* MENU DE ROTAS (WAZE / GOOGLE MAPS) */}
      <AnimatePresence>
         {showRouteOptions && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-blue-950/40 backdrop-blur-md flex items-end justify-center">
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[45px] p-8 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                  <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-8 tracking-tighter">Escolher Navegador</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => openExternalMap('google')} className="flex flex-col items-center p-6 bg-gray-50 rounded-[35px] border border-gray-100 hover:bg-blue-50 transition-colors active:scale-95">
                        <img src="https://www.google.com/images/branding/product/2x/maps_96in128dp.png" className="w-12 h-12 mb-3 shadow-md rounded-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Google Maps</span>
                     </button>
                     <button onClick={() => openExternalMap('waze')} className="flex flex-col items-center p-6 bg-gray-50 rounded-[35px] border border-gray-100 hover:bg-blue-50 transition-colors active:scale-95">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Waze_Logo.png" className="w-12 h-12 mb-3 shadow-md rounded-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Waze</span>
                     </button>
                  </div>
                  <button onClick={() => setShowRouteOptions(false)} className="w-full mt-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">Voltar ao Perfil</button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* MENU DE CONFIGURAÇÕES (ESTILO INSTAGRAM) */}
      <AnimatePresence>
         {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7000] bg-blue-950/60 backdrop-blur-md flex items-end justify-center">
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[45px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto my-6" />
                  
                  <div className="px-8 pb-4 border-b border-gray-50 flex items-center justify-between">
                     <h3 className="text-xl font-black text-blue-950 uppercase italic tracking-tighter">Configurações</h3>
                     <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-12">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Conta</p>
                        <div className="bg-gray-50 rounded-[30px] p-2 space-y-1">
                           {[
                              { label: 'Editar Perfil', icon: <UserPlus size={18} /> },
                              { label: 'Trocar Senha', icon: <Shield size={18} /> },
                              { label: 'Privacidade', icon: <Bookmark size={18} /> },
                              { label: 'Segurança', icon: <Target size={18} /> }
                           ].map((item, idx) => (
                              <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-[22px] hover:bg-blue-50 transition-colors group">
                                 <div className="flex items-center space-x-3">
                                    <div className="text-blue-600">{item.icon}</div>
                                    <span className="text-sm font-bold text-blue-950">{item.label}</span>
                                 </div>
                                 <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Notificações</p>
                        <div className="bg-gray-50 rounded-[30px] p-2 space-y-1">
                           {[
                              { label: 'Push & Alertas', icon: <Zap size={18} /> },
                              { label: 'Sons de Batalha', icon: <Flame size={18} /> }
                           ].map((item, idx) => (
                              <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-[22px] hover:bg-blue-50 transition-colors group">
                                 <div className="flex items-center space-x-3">
                                    <div className="text-blue-600">{item.icon}</div>
                                    <span className="text-sm font-bold text-blue-950">{item.label}</span>
                                 </div>
                                 <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                              </button>
                           ))}
                        </div>
                     </div>

                     <button 
                       onClick={() => {
                         localStorage.removeItem('user');
                         localStorage.removeItem('token');
                         window.location.href = '/auth';
                       }}
                       className="w-full py-5 bg-red-50 text-red-500 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all"
                     >
                       Sair da Conta
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* MODAL NOVA POSTAGEM */}
      <AnimatePresence>
         {showNewPost && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[8000] bg-blue-950/40 backdrop-blur-md flex items-end justify-center">
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[45px] p-8 pb-12 shadow-2xl flex flex-col">
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter">Nova Publicação</h3>
                     <button onClick={() => setShowNewPost(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                  </div>

                  <div className="space-y-6">
                     <div className="aspect-video bg-gray-50 rounded-[30px] border-2 border-dashed border-blue-100 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-blue-50 transition-colors overflow-hidden relative">
                        {newPostData.imageUrl ? (
                          <img src={newPostData.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera size={32} className="mb-2" />
                            <span className="text-[10px] font-black uppercase">Subir Foto ou Vídeo</span>
                          </>
                        )}
                        <input type="text" placeholder="URL da Imagem (Ex: Unsplash)" value={newPostData.imageUrl} onChange={e => setNewPostData({...newPostData, imageUrl: e.target.value})} className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded-xl text-[10px] border-none outline-none font-bold" />
                     </div>

                     <textarea 
                       placeholder="Escreva uma descrição..."
                       value={newPostData.description}
                       onChange={e => setNewPostData({...newPostData, description: e.target.value})}
                       className="w-full bg-gray-50 border-none rounded-[25px] py-4 px-6 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[100px] resize-none"
                     />

                     <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                        {['Fade', 'Navalhado', 'Freestyle', 'Barba', 'Social'].map(cat => (
                           <button key={cat} onClick={() => setNewPostData({...newPostData, category: cat})} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${newPostData.category === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400'}`}>{cat}</button>
                        ))}
                     </div>

                     <button 
                       onClick={async () => {
                         setIsLoading(true);
                         await api.createPost({ ...newPostData, barberId: barber.id });
                         setIsLoading(false);
                         setShowNewPost(false);
                         alert('Postagem realizada com sucesso na Arena!');
                       }}
                       disabled={isLoading || !newPostData.imageUrl}
                       className="w-full py-5 bg-blue-600 text-white rounded-[25px] font-black uppercase italic tracking-widest shadow-xl flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50"
                     >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> <span>Publicar na Arena</span></>}
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* GUIA DE BOAS-VINDAS */}
      <AnimatePresence>
         {showWelcomeGuide && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9000] bg-blue-600/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center text-white">
               <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="space-y-8">
                  <div className="w-24 h-24 bg-white rounded-[35px] flex items-center justify-center mx-auto text-blue-600 shadow-2xl">
                     <Target size={48} strokeWidth={3} />
                  </div>
                  <div>
                     <h2 className="text-4xl font-black font-orbitron italic uppercase tracking-tighter">BEM-VINDO AO TOPO!</h2>
                     <p className="text-[12px] font-bold text-blue-100 uppercase tracking-widest mt-4 leading-relaxed">Você agora é um Atleta de Elite. Comece postando seu melhor trabalho para subir no ranking e ser descoberto!</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-[40px] border border-white/20">
                     <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-white text-blue-600 rounded-2xl"><Plus size={24} /></div>
                        <p className="text-[10px] font-black uppercase italic">Toque no botão "+" ali em cima para fazer seu primeiro post.</p>
                     </div>
                  </div>
                  <button onClick={() => setShowWelcomeGuide(false)} className="w-full py-5 bg-white text-blue-600 rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all">COMEÇAR AGORA</button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
