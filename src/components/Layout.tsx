import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Swords, MapPin, Trophy, User, Repeat, Search, Calendar } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const [isBarberView, setIsBarberView] = useState(true);

  // ESTADO GLOBAL DO MATCH (SIMULAÇÃO REALTIME)
  const [matchSession, setMatchSession] = useState<{
    status: 'idle' | 'searching' | 'proposal_sent' | 'accepted' | 'arrived' | 'in_service' | 'payment' | 'finished' | 'receipt';
    incomingRequests: any[]; 
    activeMatch: any | null; 
    bufferTime: number; 
    toleranceTimer: number; 
    evaluations: { clientRated: boolean; barberRated: boolean };
  }>({
    status: 'idle',
    incomingRequests: [
      { id: 'req1', client: { name: 'Joãozinho Silva', avatar: 'https://i.pravatar.cc/150?u=1', rating: 4.9, isNew: true }, services: ['Degradê Pro'], price: 45, observations: 'Quero bem baixinho', distance: '1.2km' },
      { id: 'req2', client: { name: 'Marcos Oliveira', avatar: 'https://i.pravatar.cc/150?u=2', rating: 4.7, isNew: false }, services: ['Barba & Toalha'], price: 30, observations: 'Desenhar cavanhaque', distance: '0.8km' },
      { id: 'req3', client: { name: 'Felipe Souza', avatar: 'https://i.pravatar.cc/150?u=3', rating: 5.0, isNew: true }, services: ['Corte + Barba'], price: 70, observations: 'Primeira vez na arena', distance: '2.5km' },
    ],
    activeMatch: null,
    bufferTime: 30,
    toleranceTimer: 1800,
    evaluations: { clientRated: false, barberRated: false }
  });

  const toggleVision = () => {
    const newView = !isBarberView;
    setIsBarberView(newView);
    if (newView) {
      navigate('/'); // Barbeiro vai para Arena
    } else {
      navigate('/map'); // Cliente vai para Mapa
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-0 md:p-4 font-inter">
      {/* Banner de visão (Sticky Top) */}
      <div className="w-full max-w-md bg-blue-600 p-2 flex justify-between items-center z-[5000] sticky top-0 shadow-xl">
        <span className="text-[10px] font-black text-white uppercase tracking-widest ml-4">
          Modo: {isBarberView ? 'Atleta (Barbeiro)' : 'Torcedor (Cliente)'}
        </span>
        <button 
          onClick={toggleVision}
          className="bg-white text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase mr-4 active:scale-95 transition-transform"
        >
          Trocar Visão
        </button>
      </div>

      <div className="w-full max-w-md bg-white flex-1 flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.05)] overflow-hidden">

        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
          <Outlet context={{ isBarberView, matchSession, setMatchSession }} />
        </main>

        {/* Bottom Navigation (Clean Floating HUD) */}
        <div className="absolute bottom-6 left-6 right-6 z-50">
          <nav className="h-16 bg-white/80 backdrop-blur-xl rounded-[28px] flex justify-around items-center px-4 shadow-[0_15px_40px_rgba(37,99,235,0.15)] border border-blue-50">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Swords size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Arena</span>
                </>
              )}
            </NavLink>
            
            <NavLink
              to="/map"
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <MapPin size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Mapa</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/ranking"
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Trophy size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">League</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/agenda"
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Calendar size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Agenda</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <User size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Perfil</span>
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
}
