import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Globe, MessageSquare, User,
  Crosshair, Shield, ArrowRight, Sword, Navigation,
  Sparkles, TrendingUp, Clock, Heart, Users,
  Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Mapa', href: '#map' },
  { label: 'Liga', href: '#stats' },
];

const SCREENS = [
  {
    id: 'map',
    icon: MapPin,
    label: 'Mapa',
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'MAPA AO VIVO',
    content: (
      <div className="relative w-full h-full bg-white flex flex-col">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[7px] text-emerald-600 font-bold">12 ONLINE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
              <Navigation size={8} className="text-blue-600" />
            </div>
            <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
              <Crosshair size={7} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="flex-1 relative mx-2 rounded-lg overflow-hidden" style={{ background: '#e8e4dc' }}>
          <svg className="w-full h-full" viewBox="0 0 160 240">
            <rect width="160" height="240" fill="#e8e4dc" />
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 40} x2="160" y2={i * 40} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="240" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            ))}
            <rect x="0" y="0" width="160" height="240" fill="rgba(200,220,200,0.3)" />
            <rect x="0" y="0" width="160" height="3" fill="#b8d4b8" />
            <rect x="0" y="237" width="160" height="3" fill="#b8d4b8" />
            <path d="M0 80 Q20 75 40 82 T80 78 T120 83 T160 80" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M0 120 Q40 115 80 122 T160 118" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M0 160 Q30 157 60 162 T100 158 T160 161" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M40 0 Q42 40 38 80 T42 120 T38 160 T42 200 T40 240" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M100 0 Q98 50 102 100 T98 150 T102 200 T100 240" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <rect x="50" y="60" width="8" height="8" rx="1" fill="#a8d5a2" />
            <rect x="90" y="135" width="6" height="6" rx="1" fill="#a8d5a2" />
            <rect x="25" y="175" width="5" height="5" rx="1" fill="#a8d5a2" />
            <rect x="20" y="40" width="4" height="4" rx="1" fill="#a8d5a2" />
            <rect x="130" y="65" width="4" height="4" rx="1" fill="#a8d5a2" />
            <rect x="115" y="200" width="5" height="5" rx="1" fill="#a8d5a2" />
            <circle cx="80" cy="105" r="20" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.6)" strokeWidth="2">
              <animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="105" r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <circle cx="55" cy="150" r="16" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.5)" strokeWidth="2">
              <animate attributeName="r" values="16;21;16" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="55" cy="150" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
            <circle cx="120" cy="80" r="14" fill="rgba(250,204,21,0.2)" stroke="rgba(250,204,21,0.5)" strokeWidth="2" />
            <circle cx="120" cy="80" r="4" fill="#facc15" stroke="white" strokeWidth="2" />
            <circle cx="130" cy="180" r="12" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.5)" strokeWidth="2" />
            <circle cx="130" cy="180" r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <rect x="52" y="30" width="56" height="14" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
            <text x="80" y="39" fill="#1f2937" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Bairro Centro</text>
            <rect x="78" y="128" width="30" height="16" rx="3" fill="#3b82f6" />
            <text x="93" y="139" fill="white" fontSize="5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">BK ★4.9</text>
            <rect x="50" y="170" width="28" height="14" rx="3" fill="white" stroke="#d1d5db" strokeWidth="0.3" />
            <text x="64" y="179" fill="#374151" fontSize="4.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Corte P ★5.0</text>
          </svg>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600 rounded text-[6px] text-white font-bold">EXPRESS</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1.5 border border-gray-100">
            <MapPin size={7} className="text-blue-600" />
            <span className="text-[6px] text-gray-500 flex-1"><span className="text-gray-900 font-bold">5 barbeiros</span> disponíveis próximo a você</span>
          </div>
        </div>
      </div>
    ),
    features: ['Matchmaking em raio de 5km', 'Barbeiros verificados', 'Agendamento em 1 toque'],
  },
  {
    id: 'league',
    icon: Sword,
    label: 'Liga',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'BATALHA 1x1',
    content: (
      <div className="relative w-full h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%)' }}>
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Sword size={7} className="text-white" />
            </div>
            <span className="text-[6px] font-orbitron text-gray-900 font-black uppercase tracking-widest">Liga</span>
          </div>
          <div className="text-[6px] text-gray-400 font-bold">1x1</div>
        </div>
        <div className="flex gap-1 px-3 mb-1.5">
          {['Torneios', 'Meus', 'Ranking'].map((tab, i) => (
            <div key={tab} className={`px-2 py-0.5 rounded-full text-[5px] font-black uppercase tracking-wider ${i === 0 ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-400'}`}>
              {tab}
            </div>
          ))}
        </div>
        <div className="flex-1 mx-2 rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-center gap-2 p-2 border-b border-gray-50">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[6px] font-black text-white border-2 border-white shadow-sm">BK</div>
              <span className="text-[5px] text-gray-500">Barber King</span>
              <span className="text-[4px] text-amber-500">★ 4.9</span>
            </div>
            <div className="font-orbitron text-[8px] font-black text-amber-500 px-1">VS</div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[6px] font-black text-white border-2 border-white shadow-sm">CP</div>
              <span className="text-[5px] text-gray-500">Corte Premium</span>
              <span className="text-[4px] text-amber-500">★ 5.0</span>
            </div>
          </div>
          <div className="px-2 py-1.5">
            <div className="flex justify-between text-[5px] text-gray-400 mb-0.5">
              <span>142 votos</span>
              <span className="text-blue-600 font-bold">AO VIVO</span>
              <span>117 votos</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-[55%] h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #f59e0b)' }} />
            </div>
            <div className="flex justify-between text-[5px] text-gray-400 mt-1">
              <span className="text-blue-600 font-bold">LIDERANDO</span>
              <span>+25 votos</span>
            </div>
          </div>
        </div>
        <div className="px-2 py-1.5">
          <div className="w-full py-1.5 rounded-md text-center text-[6px] font-black text-white uppercase tracking-widest" style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}>
            Ver Batalhas
          </div>
        </div>
      </div>
    ),
    features: ['Desafios 1x1', 'Votação da comunidade', 'Ranking global'],
  },
  {
    id: 'agenda',
    icon: Calendar,
    label: 'Agenda',
    gradient: 'from-emerald-500 to-green-600',
    badge: 'AGENDA',
    content: (
      <div className="relative w-full h-full bg-white flex flex-col">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <h2 className="text-[7px] font-black text-gray-900 uppercase tracking-tight">Agenda</h2>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-blue-50 rounded-md flex items-center justify-center">
              <Calendar size={6} className="text-blue-600" />
            </div>
            <div className="w-4 h-4 bg-gray-900 rounded-md flex items-center justify-center">
              <MapPin size={6} className="text-white" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 mb-1.5">
          <div className="flex-1 flex gap-0.5 overflow-x-auto">
            {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d, i) => (
              <div key={d} className={`flex-1 text-center py-1 rounded-md text-[5px] font-black uppercase ${i === 3 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                <div>{d}</div>
                <div className="text-[6px]">{['12', '13', '14', '15', '16', '17'][i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 mx-2 space-y-0.5">
          {[
            { time: '09:00', name: 'João Silva', service: 'Corte Degradê', status: 'Confirmado', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
            { time: '10:30', name: 'Maria Santos', service: 'Barba Completa', status: 'Em Serviço', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
            { time: '14:00', name: 'Pedro Alves', service: 'Corte + Barba', status: 'Pendente', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-gray-100">
              <div className={`w-1 h-5 rounded-full ${item.dot}`} />
              <div className="text-[7px] font-bold text-gray-900 w-5">{item.time}</div>
              <div className="flex-1">
                <div className="text-[6px] text-gray-900 font-medium">{item.name}</div>
                <div className="text-[5px] text-gray-400">{item.service}</div>
              </div>
              <div className={`${item.bg} ${item.color} px-1.5 py-0.5 rounded text-[5px] font-bold`}>{item.status}</div>
            </div>
          ))}
        </div>
        <div className="px-3 py-1.5">
          <div className="flex gap-1">
            <div className="flex-1 py-1 rounded-md bg-blue-600 text-center">
              <span className="text-[6px] font-black text-white uppercase tracking-wider">Agendar</span>
            </div>
            <div className="py-1 px-2 rounded-md bg-gray-100 text-center">
              <span className="text-[6px] font-black text-gray-500 uppercase tracking-wider">Histórico</span>
            </div>
          </div>
        </div>
      </div>
    ),
    features: ['Agendamento inteligente', 'Express em 5km', 'Fila de espera'],
  },
  {
    id: 'profile',
    icon: User,
    label: 'Perfil',
    gradient: 'from-rose-500 to-pink-600',
    badge: 'PERFIL',
    content: (
      <div className="relative w-full h-full bg-[#fcfcfd] flex flex-col">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <div className="flex items-center gap-1">
            <ArrowRight size={6} className="text-gray-400 rotate-180" />
            <span className="text-[6px] font-black text-gray-900 uppercase tracking-tight">Perfil</span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded-md flex items-center justify-center">
              <User size={6} className="text-gray-800" />
            </div>
            <div className="w-4 h-4 bg-gray-100 rounded-md flex items-center justify-center">
              <MapPin size={6} className="text-gray-800" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center px-4 py-2">
          <div className="w-10 h-10 rounded-[10px] p-[2px]" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #1e3a5f)' }}>
            <div className="w-full h-full rounded-[8px] bg-white flex items-center justify-center">
              <span className="text-[10px] font-black text-blue-600">BK</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[8px] font-black text-gray-900 uppercase tracking-tight">Barber King</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[5px] text-gray-400">Disponível Agora</span>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} width="5" height="5" viewBox="0 0 12 12" className="text-amber-400">
                <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 10,12 6,9 2,12 3.5,7.5 0,4.5 4.5,4.5" fill="currentColor" />
              </svg>
            ))}
            <span className="text-[5px] text-gray-400 ml-0.5">4.9</span>
          </div>
        </div>
        <div className="mx-2 p-2 rounded-lg bg-white border border-gray-50 shadow-sm">
          <div className="flex justify-between text-[5px] text-gray-500 mb-0.5">
            <span>XP PARA PRÓXIMO NÍVEL</span>
            <span className="text-blue-600 font-bold">720/1000</span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="w-[72%] h-full rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
          </div>
        </div>
        <div className="flex justify-around mx-2 mt-1.5 p-1.5 rounded-lg bg-white border border-gray-50 shadow-sm">
          {[
            { value: '47', label: 'Batalhas' },
            { value: '2.3K', label: 'Seguidores' },
            { value: '156', label: 'Cortes' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[8px] font-black text-gray-900">{stat.value}</div>
              <div className="text-[5px] text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mx-2 mt-1.5 grid grid-cols-3 gap-0.5 flex-1">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="rounded-md bg-gray-100 aspect-square flex items-center justify-center">
              <span className="text-[4px] text-gray-300 font-black">CORTE</span>
            </div>
          ))}
        </div>
      </div>
    ),
    features: ['Portfólio completo', 'Estatísticas detalhadas', 'Galeria de cortes'],
  },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Mapa Interativo em Tempo Real',
    desc: 'Veja todos os barbeiros disponíveis ao seu redor no mapa. Ative o GPS, encontre quem está online e agende um corte em segundos — igual Uber, mas para barbearia.',
    gradient: 'from-cyan-500 to-blue-600',
    highlight: 'Encontre barbeiros num raio de 5km com matchmaking express',
  },
  {
    icon: Sword,
    title: 'Liga de Batalhas Épicas',
    desc: 'Desafie outros barbeiros para duelos 1x1. Suba a foto do seu melhor corte, receba votos da comunidade e suba no ranking. O melhor barbeiro vence.',
    gradient: 'from-amber-500 to-orange-600',
    highlight: 'Mais de 2.000 batalhas realizadas com votação ao vivo',
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    desc: 'Gerencie sua agenda como um profissional. Agende horários, aceite pedidos express, entre na fila de espera. Controle total do seu tempo.',
    gradient: 'from-emerald-500 to-green-600',
    highlight: 'Três modos: agendado, express e fila de espera',
  },
  {
    icon: Globe,
    title: 'Feed Social',
    desc: 'Compartilhe seus melhores trabalhos, veja o que outros barbeiros estão fazendo, curta e comente. Sua vitrine digital para atrair clientes.',
    gradient: 'from-violet-500 to-purple-600',
    highlight: 'Construa sua reputação com posts, likes e comentários',
  },
  {
    icon: MessageSquare,
    title: 'Chat em Tempo Real',
    desc: 'Converse diretamente com clientes e barbeiros. Combine horários, tire dúvidas, negocie serviços — tudo dentro do app, sem precisar do WhatsApp.',
    gradient: 'from-blue-500 to-indigo-600',
    highlight: 'Mensagens instantâneas com histórico completo',
  },
  {
    icon: User,
    title: 'Perfil com Portfólio',
    desc: 'Seu perfil é sua vitrine. Mostre sua galeria de cortes, suas estatísticas de batalhas, avaliações da comunidade e configure seus serviços e preços.',
    gradient: 'from-rose-500 to-pink-600',
    highlight: 'Barbeiros verificados com reputação baseada em avaliações',
  },
];

const STATS = [
  { value: '500+', label: 'Barbeiros Ativos', icon: Users },
  { value: '2.000+', label: 'Batalhas Realizadas', icon: Sword },
  { value: '10.000+', label: 'Agendamentos', icon: Calendar },
  { value: '98%', label: 'Satisfação', icon: Heart },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Crosshair size={16} className="text-white" />
          </div>
          <span className="font-orbitron text-lg font-black text-gray-900 tracking-wider">
            BATTLE <span className="text-cyan-600">BARBER</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-300 font-medium"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => navigate('/app')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-300 font-medium"
          >
            Entrar
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300"
          >
            Começar Agora
          </button>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-700"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-gray-200 px-6 py-4 space-y-3"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              {item.label}
            </a>
          ))}
          <hr className="border-gray-100" />
          <button
            onClick={() => { setMobileOpen(false); navigate('/app'); }}
            className="block w-full text-sm text-gray-600 hover:text-gray-900 font-medium text-left"
          >
            Entrar
          </button>
          <button
            onClick={() => { setMobileOpen(false); navigate('/auth'); }}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-full"
          >
            Começar Agora
          </button>
        </motion.div>
      )}
    </motion.header>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % SCREENS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-white">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs text-cyan-700 mb-6">
                <Sparkles size={14} className="text-cyan-500" />
                A plataforma que está revolucionando a barbearia
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6"
            >
              O Encontro do
              <br />
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                Cliente com o Barbeiro Perfeito
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Encontre barbeiros perto de você no mapa, agende horários sem burocracia, desafie seus rivais em batalhas épicas e mostre seu talento para a comunidade.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-10"
            >
              <button
                onClick={() => navigate('/auth')}
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-3.5 rounded-full text-base hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center gap-2"
              >
                Quero Fazer Parte
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="text-gray-600 font-medium px-8 py-3.5 rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Explorar App
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-cyan-500', 'bg-blue-500', 'bg-violet-500'].map((c, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white flex items-center justify-center text-[8px] text-white font-bold`}>
                      {['J', 'M', 'P'][i]}
                    </div>
                  ))}
                </div>
                <span className="text-gray-500"><strong className="text-gray-900">+500</strong> barbeiros já estão na plataforma</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative flex justify-center"
          >
            <div className="absolute -inset-8 bg-gradient-to-b from-cyan-300/30 via-blue-300/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative w-[270px]">
              <div className="rounded-[2.5rem] bg-[#030303] p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
                <div className="rounded-[2.3rem] overflow-hidden bg-[#030303]">
                  <div className="aspect-[9/19] rounded-[1.4rem] overflow-hidden relative bg-white">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={SCREENS[activeScreen].id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        {SCREENS[activeScreen].content}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mt-4">
                {SCREENS.map((screen, i) => (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreen(i)}
                    className={`transition-all duration-300 ${
                      i === activeScreen
                        ? 'w-6 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600'
                        : 'w-1.5 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-3">
                {SCREENS.map((screen, i) => (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreen(i)}
                    className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                      i === activeScreen ? 'text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {screen.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MapFeatureSection() {
  const navigate = useNavigate();
  return (
    <section id="map" className="relative py-24 md:py-28 overflow-hidden bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-100/50 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold mb-5">
              <Navigation size={12} />
              GEOLOCALIZAÇÃO EM TEMPO REAL
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
              Encontre o Barbeiro Ideal{' '}
              <span className="text-cyan-600">a 5km de Você</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6">
              Abra o mapa, veja quem está online perto de você, confira avaliações e agende na hora.
              Chega de ligar para várias barbearias — o barbeiro certo está a poucos toques de distância.
            </p>
            <div className="space-y-3 mb-8">
              {[
                { icon: Navigation, text: 'Matchmaking express: cliente e barbeiro se encontram em segundos' },
                { icon: Shield, text: 'Veja reputação, avaliações e fotos reais de cada barbeiro' },
                { icon: Clock, text: 'Agende agora ou programe para depois — você escolhe' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-cyan-600" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 font-bold text-cyan-600 hover:text-cyan-700 transition-colors group"
            >
              Ver mapa ao vivo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 md:order-2 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-300/30 via-blue-300/20 to-transparent rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-gray-100 relative">
                <div className="absolute inset-0">
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      <span className="text-xs text-emerald-600 font-bold">12 ONLINE</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-2 py-0.5 bg-cyan-50 rounded text-[10px] text-cyan-700 font-bold border border-cyan-200">EXPRESS</div>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    <defs>
                      <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(6,182,212,0.06)" />
                        <stop offset="100%" stopColor="rgba(6,182,212,0.02)" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#gg)" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
                    ))}
                    <circle cx="120" cy="130" r="28" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.5)" strokeWidth="2">
                      <animate attributeName="r" values="28;34;28" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="120" cy="130" r="6" fill="#06b6d4" />
                    <circle cx="270" cy="110" r="22" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.5)" strokeWidth="2">
                      <animate attributeName="r" values="22;28;22" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="270" cy="110" r="5" fill="#10b981" />
                    <circle cx="190" cy="200" r="20" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.5)" strokeWidth="2" />
                    <circle cx="190" cy="200" r="4" fill="#f59e0b" />
                    <circle cx="70" cy="80" r="16" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                    <circle cx="70" cy="80" r="4" fill="#06b6d4" />
                    <circle cx="330" cy="210" r="16" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                    <circle cx="330" cy="210" r="4" fill="#06b6d4" />
                    <text x="120" y="168" fill="#0891b2" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Barber King ★4.9 — 1.2km</text>
                    <text x="270" y="142" fill="#059669" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Corte Premium ★5.0 — 2.8km</text>
                    <text x="190" y="228" fill="#d97706" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Barbearia Estilo ★4.7 — 3.1km</text>
                  </svg>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-gray-200 shadow-sm">
                    <MapPin size={14} className="text-cyan-600" />
                    <div className="flex-1 text-xs text-gray-500">
                      <span className="text-gray-900 font-bold">5 barbeiros</span> disponíveis próximo a você
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-28 bg-gray-50">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs text-cyan-700 mb-4">
            <Sparkles size={12} />
            TUDO QUE VOCÊ PRECISA
          </div>
          <h2 className="font-orbitron text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Uma Plataforma,{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Soluções Completas</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Do matchmaking ao pagamento, das batalhas ao feed — o Battle Barber é o ecossistema completo para barbeiros e clientes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-500"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4`}>
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
                  <feature.icon size={20} className="text-gray-900" />
                </div>
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">{feature.desc}</p>
              <div className="flex items-center gap-1.5 text-xs text-cyan-600 font-medium">
                <TrendingUp size={12} />
                <span>{feature.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="stats" className="relative py-20 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-orbitron text-2xl md:text-3xl font-black text-gray-900">
            Números que{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">falam</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 flex items-center justify-center mx-auto mb-3">
                <stat.icon size={18} className="text-cyan-600" />
              </div>
              <div className="font-orbitron text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="relative py-24 md:py-28 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-violet-200/40 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs text-cyan-700 mb-6">
            <Heart size={12} />
            JUNTE-SE À REVOLUÇÃO
          </div>
          <h2 className="font-orbitron text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Seu Próximo Grande Corte
            <br />
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Está a Um Toque de Distância</span>
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            Mais de 500 barbeiros já estão na plataforma. Crie sua conta grátis em 30 segundos e descubra o novo jeito de conectar barbeiros e clientes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-10 py-4 rounded-full text-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-300 inline-flex items-center gap-2"
            >
              Criar Conta Grátis
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/app')}
              className="text-gray-600 font-medium px-10 py-4 rounded-full border border-gray-300 hover:bg-white transition-all duration-300"
            >
              Fazer Login
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Crosshair size={16} className="text-white" />
              </div>
              <span className="font-orbitron text-lg font-black text-gray-900 tracking-wider">
                BATTLE <span className="text-cyan-600">BARBER</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              A plataforma completa para barbeiros e clientes. Encontre, agende, batalhe e construa sua reputação.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 text-sm font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {['Mapa', 'Liga', 'Agenda', 'Feed'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 text-sm font-bold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} />
                contato@battlebarber.app
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Globe size={14} />
                @battlebarber
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">© 2026 Battle Barber. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const user = JSON.parse(saved);
        if (user?.id) {
          navigate('/app', { replace: true });
        }
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <MapFeatureSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
