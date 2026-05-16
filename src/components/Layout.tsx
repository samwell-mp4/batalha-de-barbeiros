import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Swords, MapPin, Trophy, User, Calendar } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Sistema de Sessão Blindado
  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') {
      return null;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.id) return null;
      return parsed;
    } catch (e) {
      console.error('Sessão corrompida, limpando...');
      localStorage.removeItem('user');
      return null;
    }
  }, [location.pathname]); // Re-valida a cada troca de página

  useEffect(() => {
    // Redirecionamento forçado se não estiver logado
    if (!user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, location.pathname, navigate]);

  const isBarberView = user?.role === 'BARBER';

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
    incomingRequests: [],
    activeMatch: null,
    bufferTime: 30,
    toleranceTimer: 1800,
    evaluations: { clientRated: false, barberRated: false }
  });

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-0 md:p-4 font-inter">
      <div className="w-full max-w-md bg-white flex-1 flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.05)] overflow-hidden">

        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
          <Outlet context={{ isBarberView, matchSession, setMatchSession }} />
        </main>

        {/* Bottom Navigation (Clean Floating HUD) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-[5000] px-6">
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
              to="/league"
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
              to={user ? "/profile" : "/auth"}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <User size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">{user ? 'Perfil' : 'Entrar'}</span>
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
}
