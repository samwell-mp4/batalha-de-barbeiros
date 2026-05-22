import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, MapPin, Trophy, User, Calendar, MessageSquare,
  Menu, X, Settings, Bell, DollarSign, Shield, HelpCircle, LogOut, Moon
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Sistema de Sessão Blindada com Sincronização de Banco
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed?.id ? parsed : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    async function syncUser() {
      if (user?.id) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me/${user.id}`);
          if (response.ok) {
            const freshUser = await response.json();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (e) {
          console.error('Erro ao sincronizar com banco:', e);
        }
      }
    }

    syncUser();

    if (!user && location.pathname !== '/auth' && location.pathname !== '/app/league') {
      navigate('/auth');
    }
  }, [location.pathname]);

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

  const menuSections = [
    {
      title: 'Navegação',
      items: [
        { icon: Globe, label: 'World', to: '/app' },
        { icon: MapPin, label: 'Mapa', to: '/app/map' },
        { icon: Trophy, label: 'League', to: '/app/league' },
        { icon: Calendar, label: 'Agenda', to: '/app/agenda' },
        { icon: MessageSquare, label: 'Chat', to: user ? '/app/messages' : '/auth' },
        { icon: User, label: 'Perfil', to: user ? '/app/profile' : '/auth' },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { icon: DollarSign, label: 'Financeiro', to: '/app/financeiro' },
        { icon: Bell, label: 'Central de Notificações', to: '/app/notificacoes' },
        { icon: Shield, label: 'Central de Segurança', to: '/app/seguranca' },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { icon: Settings, label: 'Configurações', to: '/app/configuracoes' },
        { icon: Moon, label: 'Aparência', to: '/app/aparencia' },
        { icon: HelpCircle, label: 'Ajuda & Suporte', to: '/app/ajuda' },
      ]
    },
  ];

  const handleNavigate = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-0 md:p-4 font-inter">
      <div className="w-full max-w-md bg-white flex-1 flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.05)] overflow-hidden">

        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
          <Outlet context={{ isBarberView, matchSession, setMatchSession }} />
        </main>

        {/* Bottom Navigation (Clean Floating HUD) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-[5000] px-6">
          <nav className="h-16 bg-white/80 backdrop-blur-xl rounded-[28px] flex justify-around items-center px-2 shadow-[0_15px_40px_rgba(37,99,235,0.15)] border border-blue-50">
            <NavLink
              to="/app"
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Globe size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">World</span>
                </>
              )}
            </NavLink>
            
            <NavLink
              to="/app/map"
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
              to="/app/league"
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
              to="/app/agenda"
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
              to={user ? "/app/messages" : "/auth"}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <MessageSquare size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Chat</span>
                </>
              )}
            </NavLink>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 text-gray-400 hover:text-blue-400"
            >
              <Menu size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Menu</span>
            </button>
          </nav>
        </div>
      </div>

      {/* DRAWER OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[6000]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[7000] shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-sm font-orbitron">BB</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Menu</h2>
                    {user && (
                      <p className="text-[11px] text-gray-500">{user.name || user.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Drawer Sections */}
              <div className="px-5 py-5 space-y-6">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-orbitron mb-3 px-1">
                      {section.title}
                    </h3>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                          <button
                            key={item.label}
                            onClick={() => handleNavigate(item.to)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <item.icon size={16} strokeWidth={2} />
                            </div>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Sair */}
                {user && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500">
                        <LogOut size={16} strokeWidth={2} />
                      </div>
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="px-5 pb-8 text-center">
                <p className="text-[10px] text-gray-300 font-orbitron tracking-wider">Battle Barber League 2026</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
