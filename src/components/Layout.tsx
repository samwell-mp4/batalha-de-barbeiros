import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, MapPin, Trophy, User, Calendar, MessageSquare,
  Menu, X, Settings, Bell, DollarSign, Shield, HelpCircle, LogOut, Moon,
  PanelLeftClose
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: Globe, label: 'World', to: '/app' },
  { icon: MapPin, label: 'Mapa', to: '/app/map' },
  { icon: Trophy, label: 'League', to: '/app/league' },
  { icon: Calendar, label: 'Agenda', to: '/app/agenda' },
  { icon: MessageSquare, label: 'Chat', to: '/app/messages' },
  { icon: User, label: 'Perfil', to: '/app/profile' },
  { icon: DollarSign, label: 'Financeiro', to: '/app/financeiro' },
  { icon: Bell, label: 'Notificações', to: '/app/notificacoes' },
  { icon: Shield, label: 'Segurança', to: '/app/seguranca' },
  { icon: Settings, label: 'Configurações', to: '/app/configuracoes' },
  { icon: Moon, label: 'Aparência', to: '/app/aparencia' },
  { icon: HelpCircle, label: 'Ajuda', to: '/app/ajuda' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed?.id ? parsed : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
        { icon: Bell, label: 'Notificações', to: '/app/notificacoes' },
        { icon: Shield, label: 'Segurança', to: '/app/seguranca' },
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

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-56';

  return (
    <div className="h-screen bg-gray-50 font-inter flex overflow-hidden">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 ${sidebarWidth} transition-all duration-300 flex-shrink-0 z-30`}>
        {/* Logo */}
        <div className={`h-14 flex items-center shrink-0 border-b border-gray-100 ${sidebarCollapsed ? 'justify-center px-0' : 'px-5'}`}>
          <img src="/apple-touch-icon.png" alt="Battle Barber" className="w-8 h-8 rounded-xl flex-shrink-0 object-cover" />
          {!sidebarCollapsed && (
            <span className="ml-3 font-orbitron text-sm font-black text-gray-900 tracking-tight truncate">
              BATTLE <span className="text-[#00AEEF]">BARBER</span>
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const to = item.to || (user ? `/app/${item.label.toLowerCase()}` : '/auth');
            return (
              <NavLink
                key={item.label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  location.pathname === (item.to || (user ? `/app/${item.label.toLowerCase()}` : '/auth'))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <item.icon size={16} strokeWidth={2} />
                </div>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 py-2 px-2 space-y-1 shrink-0">
          {user && (
            <button
              onClick={handleLogout}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all`}
              title={sidebarCollapsed ? 'Sair' : undefined}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 flex-shrink-0">
                <LogOut size={16} />
              </div>
              {!sidebarCollapsed && <span>Sair</span>}
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all`}
            title={sidebarCollapsed ? 'Expandir' : 'Recolher'}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <PanelLeftClose size={16} />
            </div>
            {!sidebarCollapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between h-12 px-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Battle Barber" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-orbitron text-xs font-black text-gray-900">
              BATTLE <span className="text-[#00AEEF]">BARBER</span>
            </span>
          </div>
          <button onClick={() => setMenuOpen(true)} className="p-2 text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <Outlet context={{ isBarberView, matchSession, setMatchSession }} />
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100">
          <div className="flex items-center justify-around h-14 px-1">
            {[
              { icon: Globe, label: 'World', to: '/app' },
              { icon: MapPin, label: 'Mapa', to: '/app/map' },
              { icon: Calendar, label: 'Agenda', to: '/app/agenda' },
              { icon: MessageSquare, label: 'Chat', to: user ? '/app/messages' : '/auth' },
              { icon: Menu, label: 'Menu', to: '', isMenu: true },
            ].map((item) =>
              item.isMenu ? (
                <button
                  key={item.label}
                  onClick={() => setMenuOpen(true)}
                  className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-gray-400"
                >
                  <Menu size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">Menu</span>
                </button>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[9px] font-black uppercase tracking-widest font-orbitron">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE DRAWER ===== */}
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
              <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/apple-touch-icon.png" alt="Battle Barber" className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Menu</h2>
                    {user && <p className="text-[11px] text-gray-500">{user.name || user.email}</p>}
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              <div className="px-5 py-5 space-y-6">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-orbitron mb-3 px-1">{section.title}</h3>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                          <button
                            key={item.label}
                            onClick={() => handleNavigate(item.to)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left ${
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              <item.icon size={16} strokeWidth={2} />
                            </div>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

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
