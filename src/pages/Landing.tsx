import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Sword, User, Sparkles,
  ArrowRight, Navigation, Shield, Clock, Users, Heart,
  TrendingUp, ChevronRight, Zap, Eye, Star, Check,
  Menu, X, MessageSquare, Bell
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Mapa', href: '#map' },
  { label: 'App', href: '#cta' },
];

const SCREENS = [
  {
    id: 'map',
    icon: MapPin,
    label: 'Mapa',
    gradient: 'from-[#00AEEF] to-[#2563FF]',
    badge: '12 ONLINE',
    content: (
      <div className="relative w-full h-full bg-white flex flex-col">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[7px] text-emerald-600 font-bold">12 ONLINE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
              <Navigation size={8} className="text-[#2563FF]" />
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
            <path d="M0 80 Q20 75 40 82 T80 78 T120 83 T160 80" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M0 120 Q40 115 80 122 T160 118" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M0 160 Q30 157 60 162 T100 158 T160 161" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M40 0 Q42 40 38 80 T42 120 T38 160 T42 200 T40 240" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <path d="M100 0 Q98 50 102 100 T98 150 T102 200 T100 240" stroke="#f0f0e8" strokeWidth="2" fill="none" />
            <rect x="50" y="60" width="8" height="8" rx="1" fill="#a8d5a2" />
            <rect x="90" y="135" width="6" height="6" rx="1" fill="#a8d5a2" />
            <circle cx="80" cy="105" r="20" fill="rgba(0,174,239,0.2)" stroke="rgba(0,174,239,0.6)" strokeWidth="2">
              <animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="105" r="6" fill="#00AEEF" stroke="white" strokeWidth="2" />
            <circle cx="55" cy="150" r="16" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.5)" strokeWidth="2">
              <animate attributeName="r" values="16;21;16" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="55" cy="150" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
            <circle cx="120" cy="80" r="14" fill="rgba(250,204,21,0.2)" stroke="rgba(250,204,21,0.5)" strokeWidth="2" />
            <circle cx="120" cy="80" r="4" fill="#facc15" stroke="white" strokeWidth="2" />
            <rect x="52" y="30" width="56" height="14" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
            <text x="80" y="39" fill="#1f2937" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Bairro Centro</text>
            <rect x="78" y="128" width="30" height="16" rx="3" fill="#00AEEF" />
            <text x="93" y="139" fill="white" fontSize="5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">BK ★4.9</text>
            <rect x="50" y="170" width="28" height="14" rx="3" fill="white" stroke="#d1d5db" strokeWidth="0.3" />
            <text x="64" y="179" fill="#374151" fontSize="4.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Corte P ★5.0</text>
          </svg>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#00AEEF] rounded text-[6px] text-white font-bold">EXPRESS</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1.5 border border-gray-100">
            <MapPin size={7} className="text-[#2563FF]" />
            <span className="text-[6px] text-gray-500 flex-1"><span className="text-gray-900 font-bold">5 barbeiros</span> disponíveis próximo a você</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'league',
    icon: Sword,
    label: 'Liga',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'BATALHA 1x1',
    content: (
      <div className="relative w-full h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #fff 50%, #eff6ff 100%)' }}>
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Sword size={7} className="text-white" />
            </div>
            <span className="text-[6px] font-orbitron text-gray-900 font-black uppercase tracking-widest">Liga</span>
          </div>
          <div className="text-[6px] text-gray-400 font-bold">1x1</div>
        </div>
        <div className="flex-1 mx-2 rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-center gap-2 p-2 border-b border-gray-50">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#2563FF] flex items-center justify-center text-[6px] font-black text-white border-2 border-white shadow-sm">BK</div>
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
              <span className="text-[#2563FF] font-bold">AO VIVO</span>
              <span>117 votos</span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-[55%] h-full rounded-full" style={{ background: 'linear-gradient(90deg, #00AEEF, #f59e0b)' }} />
            </div>
            <div className="flex justify-between text-[5px] text-gray-400 mt-1">
              <span className="text-[#2563FF] font-bold">LIDERANDO</span>
              <span>+25 votos</span>
            </div>
          </div>
        </div>
      </div>
    ),
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
        </div>
        <div className="flex items-center gap-1 px-3 mb-1.5">
          <div className="flex-1 flex gap-0.5 overflow-x-auto">
            {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d, i) => (
              <div key={d} className={`flex-1 text-center py-1 rounded-md text-[5px] font-black uppercase ${i === 3 ? 'bg-[#00AEEF] text-white shadow-sm' : 'text-gray-400'}`}>
                <div>{d}</div>
                <div className="text-[6px]">{['12', '13', '14', '15', '16', '17'][i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 mx-2 space-y-0.5">
          {[
            { time: '09:00', name: 'João Silva', service: 'Corte Degradê', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
            { time: '10:30', name: 'Maria Santos', service: 'Barba Completa', color: 'text-[#2563FF]', bg: 'bg-blue-50', dot: 'bg-[#2563FF]' },
            { time: '14:00', name: 'Pedro Alves', service: 'Corte + Barba', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-gray-100">
              <div className={`w-1 h-5 rounded-full ${item.dot}`} />
              <div className="text-[7px] font-bold text-gray-900 w-5">{item.time}</div>
              <div className="flex-1">
                <div className="text-[6px] text-gray-900 font-medium">{item.name}</div>
                <div className="text-[5px] text-gray-400">{item.service}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
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
          <span className="text-[6px] font-black text-gray-900 uppercase tracking-tight">Perfil</span>
        </div>
        <div className="flex flex-col items-center px-4 py-2">
          <div className="w-10 h-10 rounded-[10px] p-[2px]" style={{ background: 'linear-gradient(135deg, #00AEEF, #06b6d4, #1e3a5f)' }}>
            <div className="w-full h-full rounded-[8px] bg-white flex items-center justify-center">
              <span className="text-[10px] font-black text-[#00AEEF]">BK</span>
            </div>
          </div>
          <span className="text-[8px] font-black text-gray-900 uppercase tracking-tight mt-1">Barber King</span>
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
        <div className="flex justify-around mx-2 p-1.5 rounded-lg bg-white border border-gray-50 shadow-sm">
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
      </div>
    ),
  },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <img src="/apple-touch-icon.png" alt="Battle Barber" className="w-8 h-8 rounded-xl object-cover shadow-lg" />
          <span className="font-orbitron text-lg font-black text-gray-900 tracking-tight">
            BATTLE <span className="text-[#00AEEF]">BARBER</span>
          </span>
        </motion.div>

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
            className="relative bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:shadow-[0_0_25px_rgba(0,174,239,0.4)] transition-all duration-300 group overflow-hidden"
          >
            <span className="relative z-10">Começar Agora</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563FF] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-700"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3"
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
              className="w-full bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white text-sm font-bold px-5 py-2.5 rounded-full"
            >
              Começar Agora
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [0, 3]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % SCREENS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F7FAFC]">
      {/* Aurora blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#00AEEF]/10 via-[#2563FF]/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#7C3AED]/10 via-[#2563FF]/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#00F0FF]/5 via-[#00AEEF]/5 to-transparent rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00AEEF]/10 border border-[#00AEEF]/20 text-xs font-semibold text-[#00AEEF]">
                <Sparkles size={12} />
                O Uber da barbearia chegou
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight mb-4"
            >
              <span className="block">Barbeiros</span>
              <span className="bg-gradient-to-r from-[#00AEEF] via-[#2563FF] to-[#7C3AED] bg-clip-text text-transparent">
                online perto
              </span>
              <span className="block">de você</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-500 max-w-md mb-8 leading-relaxed"
            >
              Abra o mapa. Veja quem está online. Agende em segundos. Pague com PIX.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-10"
            >
              <motion.button
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-8 py-4 rounded-full text-base hover:shadow-[0_0_35px_rgba(0,174,239,0.5)] transition-all duration-300 flex items-center gap-2 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Seu próximo corte em 30s
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563FF] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
              <a
                href="#features"
                className="group text-gray-600 font-medium px-8 py-4 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-white/80 transition-all duration-300 flex items-center gap-2"
              >
                Explorar App
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    { bg: 'bg-gradient-to-br from-[#00AEEF] to-[#2563FF]', text: 'J' },
                    { bg: 'bg-gradient-to-br from-[#7C3AED] to-[#2563FF]', text: 'M' },
                    { bg: 'bg-gradient-to-br from-[#00F0FF] to-[#00AEEF]', text: 'P' },
                  ].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c.bg} border-2 border-white flex items-center justify-center text-[9px] text-white font-bold shadow-sm`}>
                      {c.text}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  <strong className="text-gray-900">+500</strong> barbeiros ativos
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Heart size={14} className="text-rose-400" />
                <span><strong className="text-gray-900">98%</strong> satisfação</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Phone */}
          <motion.div
            style={{ y: phoneY, rotate: phoneRotate }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative flex justify-center"
          >
            {/* Dynamic glow */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-10 bg-gradient-to-br from-[#00AEEF]/30 via-[#2563FF]/20 to-[#7C3AED]/30 rounded-3xl blur-3xl"
            />

            {/* Glow ring */}
            <div className="absolute -inset-6 bg-gradient-to-br from-[#00F0FF]/10 via-[#00AEEF]/10 to-transparent rounded-full blur-2xl" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[270px]"
            >
              {/* Phone frame */}
              <div className="rounded-[2.5rem] bg-[#030303] p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.15)]">
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

                    {/* Top notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#030303] rounded-b-xl flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {SCREENS.map((screen, i) => (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreen(i)}
                    className={`transition-all duration-300 ${
                      i === activeScreen
                        ? 'w-8 h-1.5 rounded-full bg-gradient-to-r from-[#00AEEF] to-[#2563FF] shadow-[0_0_10px_rgba(0,174,239,0.4)]'
                        : 'w-1.5 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Labels */}
              <div className="flex justify-center gap-3 mt-3">
                {SCREENS.map((screen, i) => (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreen(i)}
                    className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      i === activeScreen ? 'text-[#00AEEF]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {screen.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Center: Live bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex justify-center mt-8"
        >
          <div className="hidden md:flex items-center gap-6 py-3 px-6 rounded-full bg-white/60 backdrop-blur-xl border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <LiveBarbers />
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap size={14} className="text-[#00AEEF]" />
              <LiveBookings />
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-gray-500">98% satisfação</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye size={14} className="text-[#7C3AED]" />
              <span><strong className="text-gray-900">10K+</strong> agendamentos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LiveBarbers() {
  const [count, setCount] = useState(12);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(5, Math.min(30, prev + delta));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span>
      <span className="font-bold text-gray-900">{count}</span> barbeiros online agora
    </span>
  );
}

function LiveBookings() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span>
      <span className="font-bold text-gray-900">{count}</span> agendamentos nos últimos 5 min
    </span>
  );
}

function MapFeatureSection() {
  const navigate = useNavigate();
  return (
    <section id="map" className="relative py-16 md:py-28 overflow-hidden bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00AEEF]/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AEEF]/10 border border-[#00AEEF]/20 text-xs font-semibold text-[#00AEEF] mb-5"
            >
              <Navigation size={12} />
              GEOLOCALIZAÇÃO EM TEMPO REAL
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight"
            >
              Veja quem está
              <br />
              <span className="bg-gradient-to-r from-[#00AEEF] to-[#2563FF] bg-clip-text text-transparent">
                online agora
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-500 text-lg leading-relaxed mb-8"
            >
              Abra o mapa e veja todos os barbeiros disponíveis ao seu redor. Com avaliações reais, preços fixos e agendamento em 1 toque.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4 mb-8"
            >
              {[
                { icon: Navigation, text: 'Matchmaking em segundos — cliente e barbeiro se conectam' },
                { icon: Shield, text: 'Avaliações reais com fotos dos cortes' },
                { icon: Clock, text: 'Agende agora ou programe para depois' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00AEEF]/10 to-[#2563FF]/10 border border-[#00AEEF]/20 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-[#00AEEF]" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 font-semibold text-[#00AEEF] hover:text-[#2563FF] transition-colors group"
            >
              Ver mapa ao vivo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 md:order-2 relative"
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-6 bg-gradient-to-br from-[#00AEEF]/20 via-[#2563FF]/10 to-[#7C3AED]/20 rounded-3xl blur-3xl"
            />
            <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/80 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-gray-100 relative">
                <div className="absolute inset-0">
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      <span className="text-xs text-emerald-600 font-bold">12 ONLINE</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 bg-[#00AEEF]/10 rounded-full text-[10px] text-[#00AEEF] font-bold border border-[#00AEEF]/20 backdrop-blur-sm">EXPRESS</div>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    <defs>
                      <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(0,174,239,0.04)" />
                        <stop offset="100%" stopColor="rgba(0,174,239,0)" />
                      </radialGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#mapGlow)" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="rgba(0,174,239,0.06)" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="rgba(0,174,239,0.06)" strokeWidth="0.5" />
                    ))}
                    <circle cx="120" cy="130" r="28" fill="rgba(0,174,239,0.12)" stroke="rgba(0,174,239,0.5)" strokeWidth="2">
                      <animate attributeName="r" values="28;34;28" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="120" cy="130" r="6" fill="#00AEEF" />
                    <circle cx="270" cy="110" r="22" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.5)" strokeWidth="2">
                      <animate attributeName="r" values="22;28;22" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="270" cy="110" r="5" fill="#10b981" />
                    <circle cx="190" cy="200" r="20" fill="rgba(124,58,237,0.1)" stroke="rgba(124,58,237,0.5)" strokeWidth="2" />
                    <circle cx="190" cy="200" r="4" fill="#7C3AED" />
                    <circle cx="70" cy="80" r="16" fill="rgba(0,174,239,0.1)" stroke="rgba(0,174,239,0.5)" strokeWidth="2" />
                    <circle cx="70" cy="80" r="4" fill="#00AEEF" />
                    <circle cx="330" cy="210" r="16" fill="rgba(0,174,239,0.1)" stroke="rgba(0,174,239,0.5)" strokeWidth="2" />
                    <circle cx="330" cy="210" r="4" fill="#00AEEF" />
                    <text x="120" y="168" fill="#00AEEF" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Barber King ★4.9 — 1.2km</text>
                    <text x="270" y="142" fill="#059669" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Corte Premium ★5.0 — 2.8km</text>
                    <text x="190" y="228" fill="#7C3AED" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Barbearia Estilo ★4.7 — 3.1km</text>
                  </svg>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                      <MapPin size={16} className="text-[#00AEEF]" />
                      <div className="flex-1 text-sm text-gray-500">
                        <span className="text-gray-900 font-bold">5 barbeiros</span> disponíveis próximo a você
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
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

function LeagueSection() {
  const navigate = useNavigate();
  return (
    <section id="league" className="relative py-16 md:py-28 overflow-hidden bg-[#0A0A0B]">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Badge + Headline centralizado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 mb-5">
            <Sword size={12} />
            BATALHAS & LEAGUE
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            Barbeiros em duelos.
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Você decide quem vence
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Barbeiros postam a foto do melhor corte. A comunidade vota. Quem tiver mais votos vence. Prêmio em dinheiro, seguidores novos e respeito.
          </p>
        </motion.div>

        {/* VS Battle Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative max-w-2xl mx-auto mb-8 md:mb-14"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-10 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-[50px] blur-[80px]"
          />
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-center gap-6 md:gap-10 mb-5">
              {/* Player 1 */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#2563FF] flex items-center justify-center text-2xl md:text-3xl font-black text-white border-2 border-white/20 shadow-xl"
                >
                  BK
                </motion.div>
                <span className="text-sm font-bold text-white">Barber King</span>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 12 12" className="text-amber-400">
                      <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 10,12 6,9 2,12 3.5,7.5 0,4.5 4.5,4.5" fill="currentColor" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* VS Badge */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <span className="font-orbitron text-xl md:text-2xl font-black text-white tracking-wider">VS</span>
              </motion.div>

              {/* Player 2 */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl md:text-3xl font-black text-white border-2 border-white/20 shadow-xl"
                >
                  CP
                </motion.div>
                <span className="text-sm font-bold text-white">Corte Premium</span>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} width="12" height="12" viewBox="0 0 12 12" className="text-amber-400">
                      <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 10,12 6,9 2,12 3.5,7.5 0,4.5 4.5,4.5" fill="currentColor" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 px-2">
              <span className="text-[#00AEEF] font-bold">142 votos</span>
              <span className="text-emerald-400 font-bold tracking-wider">AO VIVO</span>
              <span className="text-purple-400 font-bold">117 votos</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: '55%' }}
                animate={{ width: ['55%', '58%', '55%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#00AEEF] via-amber-500 to-purple-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1.5 px-2">
              <span className="text-[#00AEEF] font-bold">LIDERANDO</span>
              <span className="text-amber-400 font-bold">+25 votos</span>
            </div>
          </div>
        </motion.div>

        {/* Problem/Solution + Bullets + CTA em grid 2 colunas */}
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] text-red-400 font-bold">!</span>
              </div>
              <div>
                <div className="text-sm font-bold text-red-400 mb-0.5">Problema</div>
                <span className="text-sm text-red-300/80">Barbeiro bom não tem visibilidade. Cliente não conhece novos talentos.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={12} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-400 mb-0.5">Solução</div>
                <span className="text-sm text-emerald-300/80">Batalhas revelam os melhores. Cliente descobre, barbeiro cresce.</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-3 mb-6">
              {[
                { text: 'Duelos 1x1 com votação ao vivo', icon: '⚔️' },
                { text: 'Prêmios em dinheiro reais (R$ 1.000 para o 1º)', icon: '💰' },
                { text: 'Rankings por divisão: Bronze → Legend', icon: '🏆' },
                { text: 'Descubra barbeiros novos votando nas batalhas', icon: '🔍' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-[0_8px_40px_rgba(251,146,60,0.4)] transition-all duration-300 group"
            >
              Ver batalhas ao vivo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AgendaSection() {
  const navigate = useNavigate();
  return (
    <section id="agenda" className="relative py-16 md:py-28 overflow-hidden bg-white">
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-200/20 via-green-200/10 to-transparent rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 md:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 mb-5"
          >
            <Calendar size={12} />
            AGENDA INTELIGENTE
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight"
          >
            Agende sem falar
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              com ninguém
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto"
          >
            Cliente vê os horários disponíveis e agenda sozinho. Barbeiro só confirma. Três modos: agendamento normal, pedido Express e fila de espera.
          </motion.p>
        </motion.div>

        {/* Visual — horizontal timeline strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mb-8 md:mb-14"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-8 bg-gradient-to-br from-emerald-200/30 via-green-200/20 to-transparent rounded-[40px] blur-3xl"
          />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/80 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap justify-center gap-3">
              <div className="text-center py-2 px-4 rounded-xl bg-[#00AEEF] text-white">
                <div className="text-[10px] font-bold uppercase tracking-wide">Seg</div>
                <div className="text-lg font-black">12</div>
              </div>
              <div className="text-center py-2 px-4 rounded-xl bg-gray-50 text-gray-400">
                <div className="text-[10px] font-bold uppercase tracking-wide">Ter</div>
                <div className="text-lg font-black">13</div>
              </div>
              <div className="text-center py-2 px-4 rounded-xl bg-gray-50 text-gray-400">
                <div className="text-[10px] font-bold uppercase tracking-wide">Qua</div>
                <div className="text-lg font-black">14</div>
              </div>
              <div className="text-center py-2 px-4 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                <div className="text-[10px] font-bold uppercase tracking-wide">Qui</div>
                <div className="text-lg font-black">15</div>
                <div className="text-[9px] font-bold">HOJE</div>
              </div>
              <div className="text-center py-2 px-4 rounded-xl bg-gray-50 text-gray-400">
                <div className="text-[10px] font-bold uppercase tracking-wide">Sex</div>
                <div className="text-lg font-black">16</div>
              </div>
              <div className="text-center py-2 px-4 rounded-xl bg-gray-50 text-gray-400">
                <div className="text-[10px] font-bold uppercase tracking-wide">Sáb</div>
                <div className="text-lg font-black">17</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { time: '09:00', name: 'João Silva', service: 'Corte Degradê', dot: 'bg-emerald-500' },
                { time: '10:30', name: 'Maria Santos', service: 'Barba Completa', dot: 'bg-[#2563FF]' },
                { time: '14:00', name: 'Pedro Alves', service: 'Corte + Barba', dot: 'bg-amber-500' },
                { time: '16:30', name: 'Lucas Oliveira', service: 'Hidratação', dot: 'bg-violet-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className={`w-1 h-10 rounded-full ${item.dot}`} />
                  <span className="text-sm font-bold text-gray-900 w-14">{item.time}</span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.service}</div>
                  </div>
                  <div className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-emerald-600 border border-emerald-100">Confirmado</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Copy + Bullets + CTA in a centered row */}
        <div className="grid md:grid-cols-2 gap-10 items-start max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-start gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] text-red-500 font-bold">!</span>
              </div>
              <span className="text-red-400">Cliente manda mensagem, barbeiro demora 3h pra responder. Horário perdido.</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={10} className="text-emerald-500" />
              </div>
              <span className="text-emerald-600 font-medium">Cliente agenda direto. Barbeiro só confirma. Zero atrito.</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-3 mb-5">
              {[
                { text: 'Agendamento direto — cliente vê horário e já marca' },
                { text: 'Modo Express — pedido disparado para barbeiros próximos' },
                { text: 'Fila de espera automática se o horário estiver ocupado' },
                { text: 'Notificação de confirmação em tempo real para os dois' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={10} className="text-emerald-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              Experimentar agenda
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeedSocialSection() {
  const navigate = useNavigate();
  return (
    <section id="feed" className="relative py-16 md:py-28 overflow-hidden bg-[#F7FAFC]">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-orange-200/20 via-amber-200/10 to-transparent rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-5 gap-10 items-center"
        >
          {/* Copy — takes 2/5 */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-600 mb-5"
            >
              <Heart size={12} />
              FEED SOCIAL
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight"
            >
              O Instagram
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                dos barbeiros
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-500 text-lg leading-relaxed mb-6"
            >
              Barbeiros postam fotos dos cortes. Clientes curtem, comentam e descobrem novos talentos. Cada post é um novo cliente em potencial.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="space-y-2 mb-6"
            >
              <div className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-red-500 font-bold">!</span>
                </div>
                <span className="text-red-400">Barbeiro posta no Instagram mas ninguém da cidade vê. O alcance orgânico morreu.</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={10} className="text-emerald-500" />
                </div>
                <span className="text-emerald-600 font-medium">Aqui o cliente já está procurando barbeiro. Seu corte vira cliente.</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3 mb-6"
            >
              {[
                { text: 'Feed com fotos dos cortes dos barbeiros da sua cidade' },
                { text: 'Curtidas e comentários — igual rede social' },
                { text: 'Descubra novos barbeiros pelo feed sem sair de casa' },
                { text: 'Barbeiro posta o corte e atrai cliente na mesma hora' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-orange-500 font-bold text-sm">0{i + 1}</span>
                  <span className="text-gray-700 text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700 transition-colors group"
            >
              Ver feed de cortes
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Visual — masonry-style grid takes 3/5 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-3"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '✂️', name: 'Barber King', cut: 'Degradê Navalhado', likes: '234', gradient: 'from-[#00AEEF]/10 to-[#2563FF]/10' },
                { emoji: '💈', name: 'Corte Premium', cut: 'Social Clássico', likes: '189', gradient: 'from-amber-500/10 to-orange-500/10' },
                { emoji: '🔥', name: 'Fade Master', cut: 'Mid Fade + Barba', likes: '312', gradient: 'from-rose-500/10 to-pink-500/10' },
                { emoji: '⭐', name: 'Barber King', cut: 'Corte Infantil', likes: '98', gradient: 'from-emerald-500/10 to-green-500/10' },
                { emoji: '💎', name: 'Style Barber', cut: 'Pompadour', likes: '156', gradient: 'from-violet-500/10 to-purple-500/10' },
                { emoji: '✂️', name: 'Corte Premium', cut: 'Degradê Americano', likes: '278', gradient: 'from-blue-500/10 to-indigo-500/10' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ${i % 2 === 0 ? 'mt-0' : 'mt-6'}`}
                >
                  <div className={`h-28 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm text-2xl">
                      {item.emoji}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-gray-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-gray-400 truncate mb-2">{item.cut}</div>
                    <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
                      <Heart size={10} />
                      {item.likes}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FinanceiroSection() {
  const navigate = useNavigate();
  return (
    <section id="financeiro" className="relative py-16 md:py-28 overflow-hidden bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-200/20 via-purple-200/10 to-transparent rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-2 gap-12 items-start"
        >
          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-600 mb-5"
            >
              <TrendingUp size={12} />
              FINANCEIRO & PIX
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight"
            >
              Pague com PIX.
              <br />
              <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                Receba na hora
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-500 text-lg leading-relaxed mb-6"
            >
              Pagamento integrado com Mercado Pago. Cliente paga por PIX no app. Barbeiro recebe com taxa de apenas R$1. Extrato, histórico e controle total.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="space-y-2 mb-6"
            >
              <div className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-red-500 font-bold">!</span>
                </div>
                <span className="text-red-400">Cliente sem dinheiro vivo. Barbeiro sem maquininha. Pagamento vira novela.</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={10} className="text-emerald-500" />
                </div>
                <span className="text-emerald-600 font-medium">PIX direto no app. Barbeiro recebe na hora. Cliente paga sem preocupação.</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4 mb-6"
            >
              {[
                { text: 'Pagamento por PIX dentro do app — sem sair do sofá' },
                { text: 'Taxa fixa de R$1 por transação — a mais baixa do mercado' },
                { text: 'Transferência automática pro barbeiro na hora' },
                { text: 'Histórico completo e extrato mensal' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600">
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-gray-700 text-sm">{item.text}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:shadow-[0_8px_30px_rgba(124,58,237,0.3)] transition-all duration-300 group"
            >
              Ver financeiro
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Visual — dashboard de métricas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-6 bg-gradient-to-br from-violet-200/30 via-purple-200/20 to-transparent rounded-3xl blur-3xl"
            />
            <div className="relative space-y-4">
              {/* Card Principal — Saldo */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl"
              >
                <div className="text-sm text-violet-200 font-medium mb-1">Saldo disponível</div>
                <div className="text-4xl font-black mb-4">R$ 1.247,00</div>
                <div className="flex items-center gap-4 text-xs text-violet-200">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>+12% essa semana</span>
                  </div>
                  <div className="px-2 py-0.5 bg-white/20 rounded-full text-white font-bold">PIX</div>
                </div>
              </motion.div>

              {/* Cards de métrica */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Receita hoje', value: 'R$ 347,00', change: '+ R$ 45,00', gradient: 'from-emerald-500 to-green-600' },
                  { label: 'Clientes atendidos', value: '7', change: '+2 hoje', gradient: 'from-[#00AEEF] to-[#2563FF]' },
                  { label: 'Taxa média', value: 'R$ 1,00', change: 'Menor do mercado', gradient: 'from-amber-500 to-orange-600' },
                  { label: 'Extrato mensal', value: 'R$ 4.230', change: 'Últimos 30 dias', gradient: 'from-rose-500 to-pink-600' },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.35 + i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="bg-white/70 backdrop-blur rounded-2xl border border-gray-200/80 p-4 shadow-sm"
                  >
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">{card.label}</div>
                    <div className="text-lg font-black text-gray-900">{card.value}</div>
                    <div className={`text-[10px] font-semibold mt-1 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>{card.change}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MensageiroSection() {
  const navigate = useNavigate();
  return (
    <section id="mensageiro" className="relative py-16 md:py-28 overflow-hidden bg-[#F7FAFC]">
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-200/20 via-indigo-200/10 to-transparent rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Visual — lista de conversas */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-6 bg-gradient-to-br from-blue-200/30 via-indigo-200/20 to-transparent rounded-3xl blur-3xl"
            />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/80 shadow-[0_20px_80px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Conversas</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Lista de contatos */}
              <div className="divide-y divide-gray-50">
                {[
                  { initials: 'BK', name: 'Barber King', lastMsg: 'Perfeito! Consigo fazer esse degradê sim', time: '2 min', online: true, color: 'from-[#00AEEF] to-[#2563FF]', unread: 2 },
                  { initials: 'CP', name: 'Corte Premium', lastMsg: 'Disponho sim, pode vir às 14h', time: '15 min', online: true, color: 'from-amber-500 to-orange-500', unread: 0 },
                  { initials: 'FM', name: 'Fade Master', lastMsg: 'Manda a foto do corte que você quer', time: '1 hora', online: false, color: 'from-rose-500 to-pink-500', unread: 0 },
                  { initials: 'SB', name: 'Style Barber', lastMsg: 'Obrigado pela preferência! 😊', time: '3 horas', online: false, color: 'from-violet-500 to-purple-500', unread: 0 },
                ].map((contact, i) => (
                  <motion.div
                    key={contact.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-sm font-black text-white`}>
                        {contact.initials}
                      </div>
                      {contact.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{contact.name}</span>
                        <span className="text-[10px] text-gray-400">{contact.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 truncate">{contact.lastMsg}</span>
                        {contact.unread > 0 && (
                          <div className="w-4 h-4 rounded-full bg-[#00AEEF] flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">{contact.unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 mb-5"
            >
              <MessageSquare size={12} />
              MENSAGEIRO
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight"
            >
              Tire dúvidas sem
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                sair do app
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-500 text-lg leading-relaxed mb-6"
            >
              Chat em tempo real entre cliente e barbeiro. Sem precisar passar WhatsApp, sem expor número pessoal. Histórico completo de conversas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="space-y-2 mb-6"
            >
              <div className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-red-500 font-bold">!</span>
                </div>
                <span className="text-red-400">Cliente tem dúvida mas não quer ligar. Barbeiro se perde em 500 conversas no WhatsApp.</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={10} className="text-emerald-500" />
                </div>
                <span className="text-emerald-600 font-medium">Chat direto dentro do app. Dúvida sanada em segundos. Histórico salvo.</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3 mb-6"
            >
              {[
                { text: 'Chat em tempo real com o barbeiro antes de agendar' },
                { text: 'Envie fotos de referência do corte que você quer' },
                { text: 'Histórico completo salvo — nada se perde' },
                { text: 'Sem expor seu número de WhatsApp pessoal' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">{i + 1}</span>
                  <span className="text-gray-700 text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              Abrir mensageiro
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NotificacoesSection() {
  const navigate = useNavigate();
  return (
    <section id="notificacoes" className="relative py-16 md:py-28 overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-rose-200/20 via-pink-200/10 to-transparent rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-5 gap-10 items-center"
        >
          {/* Visual — timeline de notificações ocupa 3/5 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-3 relative"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-8 bg-gradient-to-br from-rose-200/30 via-pink-200/20 to-transparent rounded-[40px] blur-3xl"
            />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/80 p-1 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
              <div className="p-5">
                {/* Bell icon header animado */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                      <Bell size={18} className="text-rose-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">Notificações</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">3</span>
                  </div>
                </div>

                {/* Linha do tempo */}
                <div className="relative">
                  <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-rose-100" />
                  {[
                    { emoji: '✂️', title: 'Horário confirmado', desc: 'Barber King confirmou seu agendamento para 14h', time: 'há 2 min', color: 'bg-emerald-500', bold: true },
                    { emoji: '🏆', title: 'Batalha começou', desc: 'Barber King vs Corte Premium — vote agora!', time: 'há 8 min', color: 'bg-amber-500', bold: true },
                    { emoji: '⭐', title: 'Novo seguidor', desc: 'Maria Santos começou a seguir você', time: 'há 15 min', color: 'bg-blue-500', bold: false },
                    { emoji: '💰', title: 'Pagamento recebido', desc: 'R$ 45,00 via PIX — Corte Degradê', time: 'há 32 min', color: 'bg-emerald-500', bold: false },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * i }}
                      className="flex items-start gap-4 pl-0 pb-5 last:pb-0"
                    >
                      <div className={`w-[34px] h-[34px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-base shadow-sm z-10 ${item.bold ? 'ring-2 ring-rose-200' : ''}`}>
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${item.bold ? 'font-bold' : 'font-medium'} text-gray-900`}>{item.title}</span>
                          {item.bold && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                        <span className="text-[10px] text-gray-400">{item.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy — ocupa 2/5 */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 mb-5"
            >
              <Bell size={12} />
              NOTIFICAÇÕES EM TEMPO REAL
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight"
            >
              Você nunca perde
              <br />
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                um update
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-500 text-lg leading-relaxed mb-6"
            >
              Cada etapa do serviço notifica você na hora. Confirmação, lembrete, barbeiro chegou, serviço pronto, pagamento recebido. Tudo em tempo real.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="space-y-2 mb-6"
            >
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[10px] font-bold text-red-400 bg-red-50 border border-red-100 rounded-full px-2 py-0.5 flex-shrink-0 mt-0.5">PROBLEMA</span>
                <span className="text-red-400">Cliente esquece o horário. Barbeiro perde cliente porque não consegue avisar.</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 flex-shrink-0 mt-0.5">SOLUÇÃO</span>
                <span className="text-emerald-600 font-medium">Notificação em cada etapa. Ninguém esquece, ninguém perde cliente.</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3 mb-6"
            >
              {[
                { text: 'Lembrete automático 30 minutos antes do horário', icon: '⏰' },
                { text: 'Status em tempo real: chegou, em serviço, pronto', icon: '🔄' },
                { text: 'Alerta quando uma batalha que você votou está acabando', icon: '🏆' },
                { text: 'Notificação de pagamento confirmado e novo seguidor', icon: '💰' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100/50">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-gray-700 text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
            >
              Ativar notificações
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LiveFeedSection() {
  const [events, setEvents] = useState([
    { emoji: '✂️', text: 'João agendou com Barber King', time: 'há 2 min' },
    { emoji: '🏆', text: 'Corte Premium venceu batalha', time: 'há 5 min' },
    { emoji: '⭐', text: 'Maria avaliou 5.0 o corte', time: 'há 8 min' },
    { emoji: '💰', text: 'Pagamento via PIX confirmado', time: 'há 12 min' },
    { emoji: '🔥', text: 'Pedro entrou na plataforma', time: 'há 15 min' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = [
        { emoji: '✂️', text: `${['Lucas', 'Ana', 'Carlos', 'Julia', 'Rafael'][Math.floor(Math.random() * 5)]} agendou corte`, time: 'agora' },
        { emoji: '⭐', text: `Novo avaliação 5.0 recebida`, time: 'agora' },
        { emoji: '🏆', text: `Batalha encerrada com ${Math.floor(Math.random() * 200)} votos`, time: 'agora' },
      ];
      setEvents((prev) => [newEvents[Math.floor(Math.random() * newEvents.length)], ...prev.slice(0, 4)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-white">
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 mb-4">
            <Zap size={12} />
            ATIVIDADE EM TEMPO REAL
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Sua comunidade está{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">movimentada</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/80 p-1 shadow-sm"
        >
          <div className="space-y-0.5">
            {events.map((event, i) => (
              <motion.div
                key={`${event.text}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-sm">
                  {event.emoji}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-700">{event.text}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{event.time}</span>
                {event.time === 'agora' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative py-14 md:py-24 overflow-hidden bg-[#F7FAFC]">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F7FAFC] to-white" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '500+', label: 'Barbeiros Ativos', icon: Users, gradient: 'from-[#00AEEF] to-[#2563FF]' },
            { value: '10K+', label: 'Agendamentos', icon: Calendar, gradient: 'from-emerald-500 to-green-600' },
            { value: '2K+', label: 'Batalhas', icon: Sword, gradient: 'from-amber-500 to-orange-600' },
            { value: '98%', label: 'Satisfação', icon: Heart, gradient: 'from-rose-500 to-pink-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="text-center p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} p-[1px] mx-auto mb-4`}>
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <stat.icon size={20} className="text-gray-900" />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</div>
              <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate();
  return (
    <section id="cta" className="relative py-16 md:py-28 overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#00AEEF]/10 via-[#2563FF]/10 to-[#7C3AED]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AEEF]/10 border border-[#00AEEF]/20 text-xs font-semibold text-[#00AEEF] mb-6">
            <Heart size={12} />
            JUNTE-SE A +500 BARBEIROS
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 leading-[0.95] tracking-tight">
            Seu próximo corte
            <br />
            <span className="bg-gradient-to-r from-[#00AEEF] via-[#2563FF] to-[#7C3AED] bg-clip-text text-transparent">
              está a 30 segundos
            </span>
          </h2>

          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
            Crie sua conta grátis. Sem compromisso. Sem mensalidade. Só o melhor jeito de cortar cabelo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-10 py-4 rounded-full text-lg hover:shadow-[0_0_40px_rgba(0,174,239,0.5)] transition-all duration-300 inline-flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Criar Conta Grátis
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#2563FF] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/app')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-gray-600 font-medium px-10 py-4 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Fazer Login
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              <span>Sem mensalidade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              <span>2 minutos para criar conta</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <img src="/apple-touch-icon.png" alt="Battle Barber" className="w-8 h-8 rounded-xl object-cover shadow-lg" />
            <span className="font-orbitron text-lg font-black text-gray-900 tracking-tight">
              BATTLE <span className="text-[#00AEEF]">BARBER</span>
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-600 transition-colors">Funcionalidades</a>
            <a href="#map" className="hover:text-gray-600 transition-colors">Mapa</a>
            <a href="#cta" className="hover:text-gray-600 transition-colors">App</a>
            <span>contato@battlebarber.com.br</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs">© 2026 Battle Barber. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Feito com</span>
            <Heart size={10} className="text-rose-400" />
            <span>para barbeiros do Brasil</span>
          </div>
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

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const id = anchor.getAttribute('href')?.slice(1);
        if (id) {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-inter antialiased">
      <Navbar />
      <HeroSection />
      <MapFeatureSection />
      <AgendaSection />
      <FeedSocialSection />
      <FinanceiroSection />
      <MensageiroSection />
      <NotificacoesSection />
      <LiveFeedSection />
      <StatsSection />
      <LeagueSection />
      <CTASection />
      <Footer />
    </div>
  );
}
