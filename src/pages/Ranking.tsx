import { MOCK_BARBERS } from '@/constants/mockData';
import { Trophy, ChevronRight, Zap, Target, TrendingUp, TrendingDown, Swords, Flame, Filter, Search, Globe, Award, MapPin, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Ranking() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [regionFilter, setRegionFilter] = useState('bairro'); // bairro, cidade, estado, global
  
  const sortedBarbers = [...MOCK_BARBERS].sort((a, b) => b.xp - a.xp);

  const tournaments = [
    { id: 't1', name: 'Campeonato 1x1', type: 'X1', prize: 'R$ 1.000', players: 16, color: 'from-gray-700 to-black' },
    { id: 't2', name: 'Campeonato do Bairro', type: 'BAIRRO', prize: 'Troféu Ouro', players: 32, color: 'from-blue-900 to-black' },
    { id: 't3', name: 'Campeonato Regional', type: 'REGIONAL', prize: 'R$ 5.000', players: 64, color: 'from-purple-900 to-black' },
    { id: 't4', name: 'Campeonato Estadual', type: 'ESTADUAL', prize: 'R$ 15.000', players: 128, color: 'from-red-900 to-black' },
    { id: 't5', name: 'Campeonato Brasileiro', type: 'NACIONAL', prize: 'R$ 50.000', players: 256, color: 'from-yellow-700 to-black' },
  ];

  const tickerItems = [
    { text: "$GUST (GUSTAVO)", change: "R$ 150.20 (+12.4%)", type: "up" },
    { text: "$HENR (HENRIQUE)", change: "R$ 98.50 (-4.2%)", type: "down" },
    { text: "$VITO (VITOR)", change: "R$ 112.10 (+8.7%)", type: "up" },
    { text: "$CAIO (CAIO)", change: "R$ 75.40 (-1.5%)", type: "down" },
    { text: "$LUIS (LUIS)", change: "R$ 52.00 (+3.1%)", type: "up" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] font-inter overflow-hidden">
      {/* LIVE BATTLE TICKER (CLEAN STYLE) */}
      <div className="bg-blue-600 py-2 overflow-hidden whitespace-nowrap relative z-20 shadow-lg shadow-blue-200/50">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex space-x-12 items-center"
        >
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black font-orbitron text-white tracking-widest">{item.text}</span>
              <span className={`text-[8px] font-black font-orbitron ${item.type === 'up' ? 'text-cyan-200' : 'text-red-200'}`}>{item.change}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header HUD */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-200">
                 <Trophy size={24} className="text-white" />
              </div>
              <h1 className="text-blue-950 text-2xl font-black font-orbitron italic tracking-widest uppercase">Elite League</h1>
            </div>
            <p className="text-blue-600/40 text-[10px] font-black font-orbitron mt-2 tracking-[0.3em]">BOLSA DE VALORES DE BARBEIROS</p>
          </div>
          <div className="flex space-x-2">
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-950/20 hover:text-blue-600 transition-colors border border-gray-100 shadow-sm"><Search size={18} /></button>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-950/20 hover:text-blue-600 transition-colors border border-gray-100 shadow-sm"><Filter size={18} /></button>
          </div>
        </div>

        {/* SUPER FILTROS DE LOCALIZAÇÃO E TORNEIO */}
        <div className="px-6 space-y-4 mb-8">
           {/* Filtro de Região */}
           <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
              {[
                 { id: 'bairro', label: 'Meu Bairro', icon: <MapPin size={12} /> },
                 { id: 'cidade', label: 'São Paulo', icon: <Globe size={12} /> },
                 { id: 'estado', label: 'SP', icon: <Target size={12} /> },
                 { id: 'global', label: 'Brasil', icon: <Trophy size={12} /> }
              ].map(r => (
                 <button 
                    key={r.id}
                    onClick={() => setRegionFilter(r.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${regionFilter === r.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200'}`}
                 >
                    {r.icon} <span>{r.label}</span>
                 </button>
              ))}
           </div>

           {/* Filtro de Tempo e Torneio */}
           <div className="flex space-x-2">
              <div className="flex-1 bg-white p-1 rounded-2xl flex border border-gray-100 shadow-sm">
                 {['weekly', 'all'].map((f) => (
                   <button 
                     key={f}
                     onClick={() => setTimeFilter(f as any)}
                     className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${timeFilter === f ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}
                   >
                     {f === 'weekly' ? 'Semanal' : 'Global'}
                   </button>
                 ))}
              </div>
              <div className="flex-[1.5] bg-white p-1 rounded-2xl flex border border-gray-100 shadow-sm">
                 <button className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest text-blue-600 flex items-center justify-center space-x-2">
                    <Swords size={12} /> <span>Todos Torneios</span> <ChevronDown size={12} />
                 </button>
              </div>
           </div>
        </div>

        {/* TOURNAMENT HUB (LIGHT CARDS) */}
        <div className="mb-12">
          <div className="px-6 flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em] italic">Inscrições Abertas</h3>
             <span className="text-[8px] font-black text-blue-600 uppercase">Ver Calendário</span>
          </div>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar px-6">
            {tournaments.map(t => (
              <div key={t.id} className="min-w-[280px] bg-white p-6 rounded-[35px] border border-gray-100 relative overflow-hidden group shadow-xl shadow-gray-200/50">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Award size={80} className="text-blue-900" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">{t.type}</span>
                    <span className="flex items-center space-x-1 text-[8px] font-black text-green-500 uppercase tracking-widest"><Flame size={10} fill="currentColor" /> <span>OPEN</span></span>
                  </div>
                  <h4 className="text-blue-950 text-xl font-black font-orbitron italic mb-2 tracking-tighter">{t.name.toUpperCase()}</h4>
                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Premiação</p>
                      <p className="text-blue-600 font-black font-orbitron text-lg">{t.prize}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase italic shadow-lg shadow-blue-200 active:scale-95 transition-all">Garantir Vaga</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pódio Crystal */}
        <div className="flex justify-center items-end mt-4 mb-16 space-x-2 px-4">
          {sortedBarbers[1] && (
            <motion.div onClick={() => navigate(`/profile/${sortedBarbers[1].id}`)} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl" />
                <img src={sortedBarbers[1].avatar} className="w-16 h-16 rounded-full border-2 border-white object-cover relative z-10 shadow-xl" />
                <div className="absolute -bottom-2 -right-1 bg-white w-6 h-6 rounded-md flex items-center justify-center border border-gray-100 shadow-md z-20 font-orbitron font-black text-[10px] text-gray-400 italic">2</div>
              </div>
              <h3 className="text-blue-950 font-black mt-4 text-[10px] font-orbitron truncate w-20 text-center uppercase tracking-tighter">{sortedBarbers[1].name.split(' ')[0]}</h3>
              <p className="text-blue-600 font-black text-[9px] font-orbitron tracking-widest">R$ {(sortedBarbers[1].xp * 0.15 + 10).toFixed(2)} (+5.2%)</p>
            </motion.div>
          )}

          {sortedBarbers[0] && (
            <motion.div onClick={() => navigate(`/profile/${sortedBarbers[0].id}`)} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.4, type: "spring" }} className="flex flex-col items-center mb-8 mx-4 cursor-pointer active:scale-95 transition-transform">
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl" />
                <img src={sortedBarbers[0].avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-2xl object-cover relative z-10" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white z-20 font-orbitron font-black text-lg text-white italic shadow-xl">1</div>
              </div>
              <h3 className="text-blue-950 font-black mt-8 text-sm font-orbitron italic tracking-widest uppercase">{sortedBarbers[0].name.toUpperCase()}</h3>
              <div className="flex items-center space-x-1 mt-1">
                <Zap size={12} className="text-blue-600 fill-blue-600" />
                <p className="text-blue-600 font-black font-orbitron text-sm">R$ {(sortedBarbers[0].xp * 0.15 + 10).toFixed(2)} (+12.4%)</p>
              </div>
            </motion.div>
          )}

          {sortedBarbers[2] && (
            <motion.div onClick={() => navigate(`/profile/${sortedBarbers[2].id}`)} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-50 rounded-full blur-xl" />
                <img src={sortedBarbers[2].avatar} className="w-16 h-16 rounded-full border-2 border-white object-cover relative z-10 shadow-xl" />
                <div className="absolute -bottom-2 -left-1 bg-white w-6 h-6 rounded-md flex items-center justify-center border border-gray-100 shadow-md z-20 font-orbitron font-black text-[10px] text-orange-400 italic">3</div>
              </div>
              <h3 className="text-blue-950 font-black mt-4 text-[10px] font-orbitron truncate w-20 text-center uppercase tracking-tighter">{sortedBarbers[2].name.split(' ')[0]}</h3>
              <p className="text-orange-500 font-black text-[9px] font-orbitron tracking-widest">R$ {(sortedBarbers[2].xp * 0.15 + 10).toFixed(2)} (-2.1%)</p>
            </motion.div>
          )}
        </div>

        {/* LISTAGEM CLEAN - BOLSA DE VALORES */}
        <div className="px-4 space-y-3 pb-8">
          {sortedBarbers.slice(3).map((barber, index) => {
            const stockCode = barber.name.split(' ')[0].substring(0, 4).toUpperCase();
            const shareValue = (barber.xp * 0.15 + 10).toFixed(2);
            const isUp = index % 2 === 0;
            const variation = (isUp ? '+' : '-') + (Math.random() * 8 + 1).toFixed(1) + '%';
            
            return (
              <motion.div 
                onClick={() => navigate(`/profile/${barber.id}`)}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
                key={barber.id} 
                className="bg-white border border-gray-100 p-4 rounded-3xl flex items-center hover:border-blue-200 transition-all group cursor-pointer active:scale-[0.98] shadow-sm shadow-gray-200/20"
              >
                <div className="flex flex-col items-center min-w-[30px]">
                  <span className="text-gray-300 font-black font-orbitron text-[10px] italic">#{index + 4}</span>
                  {isUp ? <TrendingUp size={12} className="text-green-500 mt-1" /> : <TrendingDown size={12} className="text-red-400 mt-1" />}
                </div>
                
                <div className="mx-4">
                  <img src={barber.avatar} className="w-11 h-11 rounded-2xl object-cover border border-gray-50 shadow-sm" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-blue-950 font-black font-orbitron text-[10px] italic truncate group-hover:text-blue-600 transition-colors uppercase tracking-widest">{barber.name}</h4>
                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[6px] font-black tracking-widest">${stockCode}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em]">{barber.guild?.name || 'Guilda Elite'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-blue-950 font-black font-orbitron text-xs italic tracking-tighter">R$ {shareValue}</p>
                  <p className={`text-[7px] font-black uppercase tracking-widest ${isUp ? 'text-green-500' : 'text-red-500'}`}>{variation}</p>
                </div>
                
                <div className="ml-4 opacity-10 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={14} className="text-blue-600" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
}
