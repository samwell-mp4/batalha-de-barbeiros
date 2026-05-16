import 'leaflet/dist/leaflet.css';
import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MOCK_BARBERS, STATUS } from '@/constants/mockData';
import { MapPin, Star, Navigation, X, Share2, ChevronRight, Clock, CheckCircle2, Zap, Flame, Calendar, Trash2, LayoutGrid, Loader2, Eye, EyeOff, User, Camera, Scissors, Share, Plus, ChevronLeft, Radar, Check, DollarSign, QrCode, CalendarDays, List, Heart, MessageCircle, Info, CreditCard, Wallet, Swords, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterButton({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return (
    <button onClick={() => map.setView(coords, 15)} className="absolute top-20 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl border border-gray-100 text-blue-600 active:scale-95 transition-transform"><Navigation size={20} /></button>
  );
}

export default function MapPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const initialPosition: [number, number] = [-23.525, -46.522];

  const context = useOutletContext<{
    isBarberView: boolean,
    matchSession: any,
    setMatchSession: (s: any) => void
  }>();

  const isBarberView = context?.isBarberView ?? false;
  const matchSession = context?.matchSession ?? { status: 'idle', incomingRequests: [] };
  const setMatchSession = context?.setMatchSession ?? (() => { });

  const [isRequesting, setIsRequesting] = useState(false);
  const [clientMode, setClientMode] = useState<'expresso' | 'radares'>('expresso');
  const [isBookingAgenda, setIsBookingAgenda] = useState(false);
  const [bookingStep, setBookingStep] = useState<'calendar' | 'services' | 'payment'>('calendar');
  const [bookingData, setBookingData] = useState<any>({ time: '', date: 16 });
  const [selectedBookingDate, setSelectedBookingDate] = useState(16); // Data padrão hoje (16)
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [proposalPrice, setProposalPrice] = useState<number>(0);
  const [observations] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [viewingStory, setViewingStory] = useState<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<'all' | 'livre' | 'ocupado' | 'acabando' | 'radar'>('all');
  const [showRadius, setShowRadius] = useState(true);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [dbBarbers, setDbBarbers] = useState<any[]>([]);
  
  // EVALUATION & PAYMENT STATE
  const [stars, setStars] = useState(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit' | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelledToast, setShowCancelledToast] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [showOpportunityAlert, setShowOpportunityAlert] = useState<string | null>(null);
  const [prevSlotCount, setPrevSlotCount] = useState(0);

  useEffect(() => {
    fetchBarberLocations();
  }, []);

  const fetchBarberLocations = async () => {
    setLoading(true);
    try {
      const data = await api.getBarberLocations();
      setDbBarbers(data);
    } catch (error) {
      console.error('Failed to fetch barber locations', error);
    } finally {
      setLoading(false);
    }
  };

  const dragControls = useDragControls();

  useEffect(() => {
    const today = 16;
    const hour = new Date().getHours();
    const dayData = matchSession.globalAgenda?.[today] || {};
    const slots = dayData.slots || [];
    const currentAvailable = slots.filter((s: any) => parseInt(s.time) >= hour && (s.status === 'empty' || s.status === 'radar')).length;

    if (currentAvailable > prevSlotCount && prevSlotCount === 0) {
      setShowOpportunityAlert("O Gustavo abriu uma nova vaga agora!");
      setTimeout(() => setShowOpportunityAlert(null), 6000);
    }
    setPrevSlotCount(currentAvailable);
  }, [matchSession.globalAgenda]);

  const SERVICE_CATEGORIES = [
    { id: 'fade', label: 'Corte Fade', icon: '✂️', price: 45, time: '30-40 min' },
    { id: 'navalhado', label: 'Corte Navalhado', icon: '🪒', price: 50, time: '45-50 min' },
    { id: 'degrade', label: 'Degradê Pro', icon: '📏', price: 40, time: '30 min' },
    { id: 'barba', label: 'Barba & Toalha', icon: '🧔', price: 30, time: '20 min' },
    { id: 'freestyle', label: 'Freestyle Art', icon: '🎨', price: 70, time: '60 min' },
    { id: 'pigmentacao', label: 'Pigmentação', icon: '🖋️', price: 25, time: '15 min' },
  ];

  const currentTotal = useMemo(() => {
    return selectedServices.reduce((sum, serviceId) => {
      const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
  }, [selectedServices]);

  useEffect(() => { setProposalPrice(currentTotal); }, [currentTotal]);

  useEffect(() => {
    let interval: any;
    if (matchSession?.status === 'accepted' && matchSession?.toleranceTimer > 0) {
      interval = setInterval(() => { setMatchSession((prev: any) => ({ ...prev, toleranceTimer: prev.toleranceTimer - 1 })); }, 1000);
    } else if (matchSession?.status === 'in_service' && matchSession?.bufferTime > 0) {
      interval = setInterval(() => { setMatchSession((prev: any) => ({ ...prev, bufferTime: Math.max(0, prev.bufferTime - (1 / 60)) })); }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchSession?.status]);

  const handleSendProposal = () => {
    const newRequest = {
      id: 'user_req_' + Date.now(),
      client: { name: 'Luis', avatar: 'https://i.pravatar.cc/150?u=luis', rating: 4.8, isNew: true },
      services: selectedServices.map(s => SERVICE_CATEGORIES.find(cat => cat.id === s)?.label),
      price: proposalPrice,
      observations: observations,
      distance: '1.2km'
    };
    setMatchSession((prev: any) => ({ ...prev, status: 'searching', activeMatch: newRequest, incomingRequests: [newRequest, ...prev.incomingRequests] }));
    setIsRequesting(false);
  };

  const handleFinalizePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => { setIsProcessingPayment(false); setMatchSession((prev: any) => ({ ...prev, status: 'finished' })); }, 2500);
  };

  const handleFinalCancel = () => {
    setShowCancelConfirm(false);
    setShowCancelledToast(true);
    setTimeout(() => {
      setMatchSession((prev: any) => ({ ...prev, status: 'idle', activeMatch: null }));
      setShowCancelledToast(false);
    }, 2000);
  };

  const getStatusLabel = () => {
    switch (matchSession.status) {
      case 'searching': return isBarberView ? 'Pedido de Atendimento' : 'Procurando...';
      case 'proposal_sent': return isBarberView ? 'Proposta Enviada' : 'Analisar Proposta';
      case 'accepted': return 'A Caminho';
      case 'arrived': return isBarberView ? 'Barbeiro no Local' : 'Cheguei';
      case 'in_service': return 'Em Atendimento';
      default: return '';
    }
  };

  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-pulse"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
    iconSize: [32, 32],
  });

  const createBarberIcon = (barber: any) => {
    const status = barber.status || STATUS.FECHADO;
    const isCurrent = matchSession?.activeMatch?.barberId === barber.id;
    return L.divIcon({
      className: 'barber-marker',
      html: `<div class="relative flex items-center justify-center ${isCurrent && matchSession?.status === 'in_service' ? 'animate-pulse' : ''}"><div class="w-12 h-12 rounded-full border-4 border-white shadow-2xl overflow-hidden"><img src="${barber.avatar}" class="w-full h-full object-cover" /></div><div class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-[10px]" style="background-color: ${status.color}">${status.icon}</div></div>`,
      iconSize: [48, 48],
    });
  };

  // VARREDURA DE RADARES ABERTOS (5KM)
  const radarBarbers = useMemo(() => {
    const hour = new Date().getHours();
    const globalAgenda = matchSession.globalAgenda || {};

    const allBarbers = [...dbBarbers.map(b => ({
      id: b.id,
      name: b.user.name,
      avatar: b.user.avatar,
      coordinates: { latitude: b.latitude, longitude: b.longitude },
      status: b.isOnline ? STATUS.LIVRE : STATUS.FECHADO,
      waitTime: 0
    })), ...MOCK_BARBERS.filter(mb => !dbBarbers.find(db => db.user.name === mb.name))];

    // Varre os barbeiros e encontra quem tem slot 'radar' futuro hoje
    return allBarbers.map(barber => {
      const dayData = globalAgenda[barber.id] || (barber.name.includes("Gustavo") ? globalAgenda[16] : null) || {};
      const slots = dayData.slots || [];
      const activeRadars = slots.filter((s: any) => parseInt(s.time) >= hour && s.status === 'radar');

      if (activeRadars.length > 0) {
        return { ...barber, openRadars: activeRadars };
      }
      return null;
    }).filter(Boolean);
  }, [matchSession.globalAgenda]);

  const filteredBarbers = useMemo(() => {
    // Combine mock and db barbers for testing, but prioritize DB
    const allBarbers = [...dbBarbers.map(b => ({
      id: b.id,
      name: b.user.name,
      avatar: b.user.avatar,
      coordinates: { latitude: b.latitude, longitude: b.longitude },
      status: b.isOnline ? STATUS.LIVRE : STATUS.FECHADO,
      waitTime: 0
    })), ...MOCK_BARBERS.filter(mb => !dbBarbers.find(db => db.user.name === mb.name))];

    return allBarbers.filter(b => {
      if (!b.coordinates?.latitude || !b.coordinates?.longitude) return false;
      
      if (statusFilter === 'radar') {
        return radarBarbers.some((rb: any) => rb.id === b.id);
      }

      const isLivre = b.status?.id === STATUS.LIVRE.id;
      const isOcupado = b.status?.id === STATUS.TRABALHANDO.id;
      const isAcabando = isOcupado && b.waitTime <= 10;
      if (statusFilter === 'livre') return isLivre;
      if (statusFilter === 'ocupado') return isOcupado;
      if (statusFilter === 'acabando') return isAcabando;
      return true;
    });
  }, [statusFilter, radarBarbers, dbBarbers]);

  const activeBarberCoords = useMemo(() => {
    if (!matchSession?.activeMatch?.barberId) return null;
    const b = MOCK_BARBERS.find(b => b.id === matchSession.activeMatch.barberId);
    if (!b?.coordinates) return null;
    return [b.coordinates.latitude, b.coordinates.longitude] as [number, number];
  }, [matchSession?.activeMatch?.barberId]);



  // PEGA SLOTS DO GUSTAVO EM TEMPO REAL (SINCRONIZADO COM AGENDA.TSX)
  const barberSlots = useMemo(() => {
    const today = 16;
    const currentHour = new Date().getHours();
    const globalAgenda = matchSession.globalAgenda || {};
    const dayData = globalAgenda[selectedBookingDate] || {};
    const slotsFromGlobal = dayData.slots || [];
    const workingHours = dayData.workingHours || { start: '08:00', end: '20:00' };

    const startIdx = parseInt(workingHours.start.split(':')[0]);
    const endIdx = parseInt(workingHours.end.split(':')[0]);

    // Gera a grade de 24h e filtra pela jornada e pelo tempo presente
    return Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, '0')}:00`)
      .filter((time) => {
        const h = parseInt(time.split(':')[0]);
        const isWithinShift = h >= startIdx && h <= endIdx;
        const isFuture = selectedBookingDate > today || (selectedBookingDate === today && h >= currentHour);
        return isWithinShift && isFuture;
      })
      .map(time => {
        const existing = slotsFromGlobal.find((s: any) => s.time === time);
        return existing || { time, status: 'empty', client_name: 'Livre' };
      });
  }, [selectedBookingDate, matchSession.globalAgenda]);

  return (
    <div className="flex flex-col w-full h-full bg-[#f8fafc] font-inter overflow-hidden relative" style={{ height: 'calc(100vh - 6rem)' }}>
      {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[999] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>}
      <style>{`
        .leaflet-container {
          background: #f8fafc !important;
          height: 100%;
          width: 100%;
        }
      `}</style>
      <AnimatePresence>
        {showOpportunityAlert && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="absolute top-4 left-4 right-4 z-[5000] flex justify-center">
            <div className="bg-white/80 backdrop-blur-xl border border-blue-100 p-4 rounded-[30px] shadow-2xl flex items-center justify-between space-x-4 max-w-sm w-full">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce">
                  <Zap size={20} fill="white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-950 uppercase italic leading-tight">Oportunidade Live!</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{showOpportunityAlert}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedBarber(MOCK_BARBERS.find(b => b.name.includes("Gustavo"))); setIsDrawerMinimized(false); setShowOpportunityAlert(null); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase italic shadow-lg shadow-blue-100">Agendar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* FILTROS FLUTUANTES */}
      <div className="absolute top-4 left-0 right-0 z-[1000] pointer-events-none flex justify-center">
        <div className="w-full pointer-events-auto overflow-x-auto no-scrollbar py-2 px-6 flex justify-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="flex bg-white/95 backdrop-blur-xl p-1.5 rounded-[22px] shadow-2xl border border-white/20 space-x-1 min-w-max"
          >
            {[
              { id: 'all', label: 'Todos', icon: LayoutGrid },
              { id: 'radar', label: 'Radar', icon: Zap },
              { id: 'livre', label: 'Disponíveis', icon: CheckCircle2 },
              { id: 'ocupado', label: 'Ocupados', icon: Clock },
              { id: 'acabando', label: 'Finalizando', icon: Flame }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all active:scale-95 shrink-0 ${statusFilter === filter.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <filter.icon size={14} fill={statusFilter === filter.id ? 'white' : 'none'} />
                <span className="text-[10px] font-black uppercase tracking-widest">{filter.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute top-32 right-4 z-[1000] flex flex-col space-y-2">
        <button onClick={() => setShowRadius(!showRadius)} className={`p-3 rounded-2xl shadow-xl border border-gray-100 transition-all active:scale-95 ${showRadius ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>{showRadius ? <Eye size={20} /> : <EyeOff size={20} />}</button>
      </div>

      <div className="flex-1 relative z-0 w-full bg-[#f8fafc]" style={{ minHeight: '400px' }}>
        <MapContainer center={initialPosition} zoom={15} style={{ height: '100%', width: '100%', background: '#f8fafc' }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
          {showRadius && <Circle center={initialPosition} radius={1000} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.05, color: '#3b82f6', weight: 2, dashArray: '5, 10' }} />}
          <Marker position={initialPosition} icon={userIcon} />
          {!isBarberView && matchSession.status === 'searching' && (
            <Marker position={initialPosition} icon={L.divIcon({ className: 'radar-pulse', html: '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full border-2 border-blue-500/40 animate-ping"></div>', iconSize: [0, 0] })} />
          )}
          {filteredBarbers.map((barber) => (
            <Marker key={barber.id} position={[barber.coordinates.latitude, barber.coordinates.longitude]} icon={createBarberIcon(barber)} eventHandlers={{ click: () => { if (matchSession.status === 'idle') { setSelectedBarber(barber); setIsBookingAgenda(false); setIsDrawerMinimized(false); } } }} />
          ))}
          {activeBarberCoords && <Polyline positions={[initialPosition, activeBarberCoords]} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.5, dashArray: '10, 10' }} />}
          <RecenterButton coords={initialPosition} />
        </MapContainer>
      </div>

      <AnimatePresence>
        {/* STORY VIEWER FULLSCREEN */}
        {viewingStory && selectedBarber && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[6000] bg-black flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mt-8 mb-4">
              <div className="flex items-center space-x-3">
                <img src={selectedBarber.avatar} className="w-10 h-10 rounded-full border-2 border-blue-500" />
                <div><p className="text-white text-sm font-black uppercase italic">{selectedBarber.name}</p><p className="text-gray-400 text-[10px] font-bold">Postado recentemente</p></div>
              </div>
              <button onClick={() => setViewingStory(false)} className="text-white p-2"><X size={24} /></button>
            </div>
            <div className="flex-1 rounded-[40px] overflow-hidden shadow-2xl relative">
              <img src={`https://picsum.photos/800/1600?random=${selectedBarber.id}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2"><Heart size={24} /><MessageCircle size={24} /><Share2 size={24} /></div>
                <button className="bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[10px]">Ver agora</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* DRAWER DE PERFIL INDIVIDUAL DO BARBEIRO */}
        {selectedBarber && matchSession.status === 'idle' && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: isDrawerMinimized ? "calc(100% - 130px)" : 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 50) setIsDrawerMinimized(true);
              else if (info.offset.y < -50) setIsDrawerMinimized(false);
            }}
            className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[2005] bg-white rounded-t-[50px] px-0 pb-28 shadow-[0_-20px_80px_rgba(0,0,0,0.3)] border-t border-gray-100 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 pt-4 pb-2 px-8 flex flex-col">
              <button 
                onPointerDown={(e) => dragControls.start(e)}
                onClick={() => setIsDrawerMinimized(!isDrawerMinimized)}
                className="w-full py-4 mb-2 flex justify-center group touch-none"
              >
                <div className={`w-12 h-1.5 rounded-full transition-all ${isDrawerMinimized ? 'bg-blue-600 w-16' : 'bg-gray-100 group-hover:bg-gray-200'}`} />
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewingStory(true)} className="relative group">
                    <div className="w-20 h-20 rounded-[28px] p-1 bg-gradient-to-tr from-gray-200 via-gray-100 to-gray-200">
                      <img src={selectedBarber.avatar} className="w-full h-full rounded-[24px] object-cover border-2 border-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={12} className="fill-white" /></div>
                  </motion.button>
                  <div>
                    <h4 className="text-2xl font-black text-blue-950 uppercase italic leading-tight">{selectedBarber.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 uppercase tracking-widest">RANK {selectedBarber.id % 5 + 1}Âº</span>
                      <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100"><Star size={10} className="fill-yellow-500 mr-1" /><span className="text-[10px] font-black">{selectedBarber.rating}</span></div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><Share size={20} /></button>
                  <button onClick={() => setSelectedBarber(null)} className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><X size={24} /></button>
                </div>
              </div>
            </div>

            <div className="px-8 mt-6">
              {!isBookingAgenda ? (
                <>
                  {/* STATUS DINÃ‚MICO INTELIGENTE COM CONTADOR DE VAGAS */}
                  {(() => {
                    const today = 16;
                    const now = new Date();
                    const hour = now.getHours();
                    const dayData = matchSession.globalAgenda?.[today] || {};
                    const slots = dayData.slots || [];
                    const workingHours = dayData.workingHours || { start: '08:00', end: '19:00' };

                    const currentSlot = slots.find((s: any) => parseInt(s.time) === hour);

                    // CONTAGEM DE VAGAS RESTANTES NO DIA (DA HORA ATUAL EM DIANTE)
                    const availableSlots = slots.filter((s: any) => {
                      const h = parseInt(s.time);
                      return h >= hour && (s.status === 'empty' || s.status === 'radar');
                    });

                    // Se não houver slots definidos na agenda global ainda, vamos considerar como livre
                    const hasNoSlotsYet = slots.length === 0;
                    
                    let statusLabel = 'Agenda Disponível';
                    let statusColor = '#10b981'; // Verde
                    let prediction = 'Vagas Disponíveis';

                    if (availableSlots.length > 0 || hasNoSlotsYet) {
                      const count = hasNoSlotsYet ? 8 : availableSlots.length;
                      prediction = count === 1 ? 'Só resta 1 vaga!' : `${count} vagas disponíveis`;
                      
                      if (hour < parseInt(workingHours.start)) {
                        statusLabel = `Abre às ${workingHours.start}`;
                        statusColor = '#10b981'; // Verde
                      } else if (currentSlot?.status === 'radar') {
                        statusLabel = 'Disponível no Radar';
                        statusColor = '#06b6d4'; // Ciano
                        prediction = 'Imediato';
                      } else if (currentSlot?.status === 'occupied') {
                        statusLabel = 'Em Atendimento';
                        statusColor = '#f59e0b'; // Laranja
                      } else {
                        statusLabel = count <= 2 && !hasNoSlotsYet ? 'Corra! Poucas Vagas' : 'Disponível Agora';
                        statusColor = '#10b981'; // Verde
                      }
                    } else {
                      statusLabel = 'Agenda Esgotada';
                      statusColor = '#ef4444'; // Vermelho
                      prediction = 'Sem Vagas';
                    }

                    return (
                      <div className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 mb-8 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Status da Arena</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: statusColor }}></div>
                            <span className="text-sm font-black text-blue-950 uppercase italic">{statusLabel}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Disponibilidade</p>
                          <span className={`text-sm font-black uppercase italic ${availableSlots.length <= 2 && availableSlots.length > 0 ? 'text-red-500 animate-bounce' : 'text-blue-950'}`}>
                            {prediction}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* FEED CAROUSEL */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Camera size={12} className="mr-2" /> Trabalhos Recentes</p>
                      <span className="text-[10px] font-black text-blue-500 uppercase">Ver todos</span>
                    </div>
                    <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="min-w-[130px] h-44 rounded-[30px] bg-gray-100 overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                          <img src={`https://picsum.photos/400/600?random=${i + 20}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ENDEREÃ‡O */}
                  <div className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 mb-8 flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><MapPin size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">LocalizaÃ§Ã£o</p>
                      <p className="text-xs font-bold text-blue-950">Rua da Arena, 452 - TatuapÃ©, SÃ£o Paulo</p>
                    </div>
                  </div>

                  {/* BOTÃ•ES DE AÃ‡ÃƒO */}
                  <div className="flex flex-col space-y-3">
                    <button onClick={() => setIsBookingAgenda(true)} className="w-full py-6 bg-gray-900 text-white rounded-[32px] font-black text-sm uppercase italic tracking-widest shadow-2xl flex items-center justify-center space-x-3 transition-transform active:scale-95">
                      <Calendar size={20} className="text-cyan-400" /> <span>Agendar HorÃ¡rio</span>
                    </button>
                    <button onClick={() => navigate(`/profile/${selectedBarber.id}`)} className="w-full py-6 bg-white text-blue-950 border-2 border-gray-100 rounded-[32px] font-black text-sm uppercase italic tracking-widest flex items-center justify-center space-x-3 transition-transform active:scale-95">
                      <User size={20} className="text-blue-600" /> <span>Ver Perfil Completo</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pb-6">
                  {/* FLUXO DE AGENDAMENTO MULTI-STEP */}
                  {(() => {
                    if (!bookingStep || bookingStep === 'calendar') {
                      const isPublicFila = selectedBarber?.name === 'Arena Aberta';
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={() => { setIsBookingAgenda(false); setSelectedBarber(null); }} className="p-2 bg-gray-100 rounded-xl text-blue-950 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{isPublicFila ? 'Passo 1: Quando?' : 'Selecione o HorÃ¡rio'}</span>
                              <h4 className="text-sm font-black text-blue-950 uppercase italic tracking-widest">{isPublicFila ? 'Fila de Agendamento' : `Batalha c/ ${selectedBarber.name}`}</h4>
                            </div>
                            <div className="w-10" />
                          </div>

                          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-6 px-1">
                            {[16, 17, 18, 19, 20, 21, 22].map(day => (
                              <button key={day} onClick={() => setSelectedBookingDate(day)} className={`min-w-[60px] py-4 rounded-[25px] flex flex-col items-center transition-all ${selectedBookingDate === day ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-110' : 'bg-gray-50 text-gray-400'}`}>
                                <span className="text-[7px] font-black uppercase mb-1">{day === 16 ? 'Hoje' : 'Maio'}</span>
                                <span className="text-sm font-black">{day}</span>
                                {selectedBookingDate === day && <div className="w-1.5 h-1.5 rounded-full mt-1 bg-white" />}
                              </button>
                            ))}
                          </div>

                          {isPublicFila ? (
                            <div className="flex flex-col space-y-6 pb-6">
                              <div className="bg-blue-50 p-6 rounded-[35px] border border-blue-100">
                                <p className="text-[10px] font-black text-blue-950 uppercase mb-4 text-center">Qual horário você deseja?</p>
                                <div className="grid grid-cols-4 gap-2">
                                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(time => (
                                    <button
                                      key={time}
                                      onClick={() => {
                                        setBookingData({ ...bookingData, time, date: selectedBookingDate });
                                        setBookingStep('services');
                                      }}
                                      className="py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-blue-950 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="p-5 bg-gray-50 rounded-[30px] flex items-center space-x-4 border border-gray-100 opacity-60">
                                <Info size={24} className="text-gray-400" />
                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-tight">Sua vaga serÃ¡ lanÃ§ada na Arena. Qualquer barbeiro disponÃ­vel poderÃ¡ aceitar sua batalha.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pb-6 pr-1">
                              {barberSlots.map((slot, idx) => (
                                <button
                                  key={idx}
                                  disabled={slot.status === 'occupied' || slot.status === 'blocked'}
                                  onClick={() => {
                                    setBookingData({ ...bookingData, time: slot.time, date: selectedBookingDate });
                                    setBookingStep('services');
                                  }}
                                  className={`w-full p-5 rounded-[30px] border flex items-center justify-between transition-all active:scale-[0.98] ${slot.status === 'occupied' ? 'bg-gray-50 border-gray-50 opacity-40 grayscale' :
                                    slot.status === 'radar' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 border-none animate-pulse' :
                                      slot.status === 'blocked' ? 'bg-red-50 border-red-50 text-red-300' :
                                        'bg-white border-gray-100 shadow-sm'
                                    }`}
                                >
                                  <div className="flex items-center space-x-4 text-left">
                                    <span className={`text-xs font-black ${slot.status === 'radar' ? 'text-white' : 'text-blue-950'}`}>{slot.time}</span>
                                    <div>
                                      <p className={`text-[10px] font-black uppercase tracking-tight ${slot.status === 'radar' ? 'text-white' : slot.status === 'occupied' ? 'text-gray-400' : 'text-blue-950'}`}>{slot.client_name}</p>
                                      <p className={`text-[7px] font-bold uppercase tracking-widest ${slot.status === 'radar' ? 'text-cyan-200' : 'text-gray-400'}`}>
                                        {slot.status === 'radar' ? 'Vaga Flash Ativa' : slot.status === 'occupied' ? 'Já Reservado' : slot.status === 'blocked' ? 'Indisponível' : 'Horário Livre'}
                                      </p>
                                    </div>
                                  </div>
                                  {slot.status !== 'occupied' && slot.status !== 'blocked' && <Plus size={18} className={slot.status === 'radar' ? 'text-white' : 'text-blue-600'} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    }

                    if (bookingStep === 'services') {
                      return (
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-8">
                            <button onClick={() => setBookingStep('calendar')} className="p-2 bg-gray-100 rounded-xl text-blue-950 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Passo 2 de 3</span>
                              <h4 className="text-sm font-black text-blue-950 uppercase italic tracking-widest">O que vamos fazer?</h4>
                            </div>
                            <div className="w-10" />
                          </div>

                          <div className="space-y-3 mb-10">
                            {SERVICE_CATEGORIES.map(service => (
                              <button
                                key={service.id}
                                onClick={() => {
                                  const exists = selectedServices.includes(service.label);
                                  if (exists) setSelectedServices(prev => prev.filter(s => s !== service.label));
                                  else setSelectedServices(prev => [...prev, service.label]);
                                }}
                                className={`w-full p-5 rounded-[30px] border-2 flex items-center justify-between transition-all ${selectedServices.includes(service.label) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white'}`}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="text-2xl">{service.icon}</div>
                                  <div className="text-left">
                                    <p className="text-xs font-black text-blue-950 uppercase">{service.label}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{service.time}</p>
                                  </div>
                                </div>
                                <div className="text-right">

                                  <div className={`w-5 h-5 rounded-md border-2 mt-1 flex items-center justify-center ${selectedServices.includes(service.label) ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                                    {selectedServices.includes(service.label) && <Check size={12} className="text-white" />}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>

                          <button
                            disabled={selectedServices.length === 0}
                            onClick={() => setBookingStep('payment')}
                            className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black text-sm uppercase italic tracking-widest shadow-2xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale transition-transform active:scale-95"
                          >
                            <span>Continuar para Pagamento</span> <ChevronRight size={20} />
                          </button>
                        </div>
                      );
                    }

                    if (bookingStep === 'payment') {
                      const totalPrice = SERVICE_CATEGORIES.filter(s => selectedServices.includes(s.label)).reduce((acc, curr) => acc + curr.price, 0);
                      return (
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-8">
                            <button onClick={() => setBookingStep('services')} className="p-2 bg-gray-100 rounded-xl text-blue-950 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Passo Final</span>
                              <h4 className="text-sm font-black text-blue-950 uppercase italic tracking-widest">MÃ©todo de Pagamento</h4>
                            </div>
                            <div className="w-10" />
                          </div>

                          <div className="bg-blue-950 text-white p-6 rounded-[35px] mb-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Total da Batalha</p>
                            <h3 className="text-4xl font-black italic">R$ {totalPrice},00</h3>
                            <p className="text-[9px] font-bold text-blue-400 mt-2 uppercase tracking-tighter">{selectedServices.join(' + ')}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-10">
                            {['pix', 'credit', 'debit'].map((method) => (
                              <button
                                key={method}
                                onClick={() => setPaymentMethod(method as any)}
                                className={`p-6 rounded-[30px] border-2 flex flex-col items-center space-y-3 transition-all ${paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'}`}
                              >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  {method === 'pix' ? <QrCode size={24} /> : method === 'credit' ? <CreditCard size={24} /> : <Wallet size={24} />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{method === 'pix' ? 'Pix Live' : method === 'credit' ? 'CartÃ£o CrÃ©dito' : 'CartÃ£o DÃ©bito'}</span>
                              </button>
                            ))}
                          </div>

                          <button
                            disabled={!paymentMethod}
                            onClick={() => {
                              alert(`SolicitaÃ§Ã£o enviada para o dia ${bookingData.date} Ã s ${bookingData.time}!`);
                              setMatchSession((prev: any) => ({
                                ...prev,
                                notifications: [
                                  {
                                    id: Date.now(),
                                    type: 'booking',
                                    time: bookingData.time,
                                    date: bookingData.date,
                                    client: 'Luis (Novo)',
                                    status: 'pending',
                                    barberName: selectedBarber.name,
                                    services: selectedServices,
                                    price: totalPrice,
                                    paymentMethod: paymentMethod
                                  },
                                  ...(prev.notifications || [])
                                ]
                              }));
                              setIsBookingAgenda(false);
                              setSelectedBarber(null);
                              setBookingStep('calendar');
                            }}
                            className="w-full py-7 bg-green-500 text-white rounded-[32px] font-black text-sm uppercase italic tracking-widest shadow-2xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale transition-transform active:scale-95"
                          >
                            <CheckCircle2 size={24} /> <span>Confirmar Batalha</span>
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PADRÃƒÆ’O STEP */}
        {/* PAINEL DE AÃƒâ€¡Ãƒâ€¢ES INICIAL */}
        {matchSession?.status === 'idle' && !isRequesting && !isRadarOpen && !selectedBarber && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: isDrawerMinimized ? "calc(100% - 220px)" : 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 50) setIsDrawerMinimized(true);
              else if (info.offset.y < -50) setIsDrawerMinimized(false);
            }}
            className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[1001] bg-white rounded-t-[40px] px-8 pb-28 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] border-t border-gray-100 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <button 
              onPointerDown={(e) => dragControls.start(e)}
              onClick={() => setIsDrawerMinimized(!isDrawerMinimized)}
              className="w-full py-4 mb-2 flex justify-center group pointer-events-auto touch-none"
            >
              <div className={`w-12 h-1.5 rounded-full transition-all ${isDrawerMinimized ? 'bg-blue-600 w-16' : 'bg-gray-100 group-hover:bg-gray-200'}`} />
            </button>
            <div className="flex items-center justify-between mb-8 px-2"><h3 className="text-2xl font-black text-blue-950 uppercase italic">{isBarberView ? 'Status Disponível' : 'O que deseja hoje?'}</h3><LayoutGrid size={24} className="text-blue-600" /></div>
            <div className="px-6 py-2 flex space-x-2 mb-4">
              <button onClick={() => setClientMode('expresso')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${clientMode === 'expresso' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}>Expresso (Match)</button>
              <button onClick={() => setClientMode('radares')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${clientMode === 'radares' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}>Radares Abertos</button>
            </div>

            <div className="flex flex-col space-y-3">
              {isBarberView && clientMode === 'expresso' ? (
                <>
                  <div className={`p-6 rounded-[35px] border-2 transition-all ${isRadarOpen ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-200 animate-pulse' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isRadarOpen ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-400'}`}><Zap size={24} fill={isRadarOpen ? 'currentColor' : 'none'} /></div>
                        <div>
                          <p className={`text-[11px] font-black uppercase italic ${isRadarOpen ? 'text-white' : 'text-blue-950'}`}>Radar {isRadarOpen ? 'Online' : 'Offline'}</p>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${isRadarOpen ? 'text-blue-100' : 'text-gray-400'}`}>{isRadarOpen ? 'Captando Clientes Live' : 'Visibilidade Oculta'}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsRadarOpen(!isRadarOpen)} className={`w-14 h-8 rounded-full p-1 transition-all ${isRadarOpen ? 'bg-green-400' : 'bg-gray-300'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${isRadarOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    {isRadarOpen && <p className="text-[7px] text-blue-100 font-bold uppercase tracking-tighter text-center">VocÃƒÂª estÃƒÂ¡ visÃƒÂ­vel para chamados de "Match Expresso" num raio de 5km.</p>}
                  </div>
                  <button onClick={() => navigate('/agenda')} className="w-full py-5 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl shadow-xl mt-3 flex items-center justify-center space-x-2">
                    <CalendarDays size={18} className="text-cyan-400" /> <span>Gerenciar Minha Agenda</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  {clientMode === 'expresso' ? (
                    <div className="space-y-3">
                      <button onClick={() => setIsRequesting(true)} className="w-full bg-blue-600 text-white py-6 rounded-[30px] shadow-xl flex items-center justify-center space-x-3 border-4 border-white active:scale-95 transition-transform">
                        <Scissors size={24} className="text-cyan-300" />
                        <span className="font-black uppercase italic tracking-widest text-sm">Chamar Barbeiro (Raio 5km)</span>
                      </button>
                      <button onClick={() => {
                        setSelectedBarber({ name: 'Arena Aberta', avatar: 'https://cdn-icons-png.flaticon.com/512/1458/1458260.png' });
                        setIsBookingAgenda(true);
                        setBookingStep('calendar');
                      }} className="w-full py-5 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest border-2 border-blue-50 rounded-2xl italic shadow-sm flex items-center justify-center space-x-2">
                        <List size={16} /> <span>Entrar na Fila de Agendamento</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4 max-h-[450px] overflow-y-auto no-scrollbar pb-6 pr-1">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-sm font-black text-blue-950 uppercase italic tracking-widest flex items-center"><Zap size={16} className="text-blue-600 mr-2" /> Fila de Agendamento (5km)</h4>
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Live Agora</span>
                      </div>

                      {/* VISÃƒÆ’O DO CLIENTE: VÃƒÅ  APENAS BARBEIROS COM RADAR ABERTO */}
                      {!isBarberView && (
                        <div className="space-y-4">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Barbeiros DisponÃƒÂ­veis</p>
                          {radarBarbers.length > 0 ? radarBarbers.map((barber: any) => (
                            <div key={barber.id} className="bg-white border-2 border-gray-100 p-5 rounded-[35px] shadow-sm hover:border-blue-600 transition-all group">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <img src={barber.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" />
                                  <div>
                                    <p className="text-[11px] font-black text-blue-950 uppercase italic leading-none">{barber.name}</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">DistÃƒÂ¢ncia: 1.2km</p>
                                  </div>
                                </div>
                                <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg"><Star size={10} className="fill-yellow-500 mr-1" /><span className="text-[10px] font-black">{barber.rating}</span></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {barber?.openRadars?.map((slot: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => { setSelectedBarber(barber); setSelectedBookingDate(16); setIsBookingAgenda(true); }}
                                    className="py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                                  >
                                    <Zap size={12} fill="white" /> <span>Reservar {slot.time}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )) : (
                            <div className="py-12 text-center flex flex-col items-center opacity-30">
                              <Radar size={48} className="mb-4 text-blue-600 animate-pulse" />
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-950">Nenhum Radar Aberto</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* VISÃƒO DO BARBEIRO: VÃŠ CLIENTES BUSCANDO (FILA) */}
                      {isBarberView && (
                        <div className="space-y-4">
                          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-2">CLIENTES BUSCANDO</p>
                          {(matchSession.notifications || []).filter((n: any) => n.status === 'pending' && n.type === 'booking').length > 0 ? (
                            (matchSession.notifications || []).filter((n: any) => n.status === 'pending' && n.type === 'booking').map((req: any) => (
                              <div key={req.id} className="bg-blue-950 text-white p-5 rounded-[35px] shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Swords size={60} /></div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <img src={`https://i.pravatar.cc/150?u=${req.id}`} className="w-10 h-10 rounded-xl border-2 border-blue-800" />
                                    <div>
                                      <p className="text-[11px] font-black uppercase italic leading-none">{req.client}</p>
                                      <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-1">Dia {req.date} Ã s {req.time}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-cyan-400">R$ {req.price},00</p>
                                    <p className="text-[7px] font-bold text-blue-300 uppercase">{req.paymentMethod || 'Pix'}</p>
                                  </div>
                                </div>
                                <div className="bg-blue-900/50 p-3 rounded-2xl mb-4 flex items-center space-x-2 border border-blue-800">
                                  <Scissors size={14} className="text-cyan-400" /><span className="text-[8px] font-black uppercase">{(req.services || []).join(' + ')}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setMatchSession((prev: any) => {
                                      const currentAgenda = prev.globalAgenda || {};
                                      const dateData = currentAgenda[req.date] || {};
                                      const dateSlots = dateData.slots || [];
                                      const updatedSlots = [...dateSlots.filter((s: any) => s.time !== req.time), { time: req.time, status: 'occupied', client_name: req.client, services: req.services, price: req.price, isMyBooking: true }];
                                      return { ...prev, notifications: (prev.notifications || []).filter((n: any) => n.id !== req.id), globalAgenda: { ...currentAgenda, [req.date]: { ...dateData, slots: updatedSlots } } };
                                    });
                                    alert(`VocÃª aceitou o desafio de ${req.client}! Agenda atualizada para o dia ${req.date}.`);
                                  }}
                                  className="w-full py-4 bg-cyan-500 text-blue-950 rounded-2xl font-black text-[9px] uppercase italic tracking-widest shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                                >
                                  <CheckCircle2 size={16} /> <span>Aceitar Desafio</span>
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="py-20 text-center opacity-30 flex flex-col items-center">
                              <User size={48} className="mb-4 text-blue-600" />
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-950">Nenhum Cliente na Fila</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PRO ATENDIMENTO DRAWER */}
        {(matchSession?.status === 'searching' || matchSession?.status === 'proposal_sent' || matchSession?.status === 'accepted' || matchSession?.status === 'arrived' || matchSession?.status === 'in_service') && matchSession?.activeMatch && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[2000] bg-white rounded-t-[40px] px-8 pb-28 shadow-2xl border-t-4 border-blue-600">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto my-4" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-5">
                <img src={isBarberView ? matchSession.activeMatch.client.avatar : MOCK_BARBERS[0].avatar} className="w-20 h-20 rounded-[30px] object-cover border-4 border-blue-600 shadow-xl" />
                <div><h4 className="text-2xl font-black text-blue-950 uppercase italic">{isBarberView ? matchSession.activeMatch.client.name : `@${MOCK_BARBERS[0].username}`}</h4><p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{getStatusLabel()}</p></div>
              </div>
              <div className="text-right">
                {!isBarberView && matchSession.status === 'searching' ? (<><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Espera</p><h3 className="text-2xl font-black text-blue-950 italic">~15m</h3></>) : (<><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total</p><h3 className="text-2xl font-black text-blue-950 italic">R$ {matchSession.activeMatch.price},00</h3></>)}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowCancelConfirm(true)} className="flex-1 py-6 bg-gray-50 rounded-[30px] font-black text-xs uppercase text-gray-400">Cancelar</button>
              {isBarberView && matchSession.status === 'searching' && (<button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'proposal_sent' }))} className="flex-[2] py-6 bg-blue-600 text-white rounded-[30px] font-black text-sm uppercase shadow-2xl">Enviar Proposta</button>)}
              {!isBarberView && matchSession.status === 'proposal_sent' && (<button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'accepted', barberId: 'b1' }))} className="flex-[2] py-6 bg-green-500 text-white rounded-[30px] font-black text-sm uppercase shadow-2xl">Aceitar</button>)}
              {!isBarberView && matchSession.status === 'accepted' && (<button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'arrived' }))} className="flex-[2] py-6 bg-yellow-400 text-black rounded-[30px] font-black text-sm uppercase shadow-2xl">Cheguei</button>)}
              {isBarberView && (matchSession.status === 'arrived' || matchSession.status === 'accepted') && (<button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'in_service' }))} className="flex-[2] py-6 bg-blue-600 text-white rounded-[30px] font-black text-sm uppercase shadow-2xl">Iniciar Atendimento</button>)}
              {isBarberView && matchSession.status === 'in_service' && (
                <div className="flex-[2] flex flex-col space-y-2">
                  <button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'payment' }))} className="w-full py-6 bg-green-500 text-white rounded-[30px] font-black text-sm uppercase shadow-xl">Finalizar</button>
                  <button onClick={() => { alert('Notificação enviada ao próximo cliente: "O barbeiro solicitou mais 10 minutos para finalizar o trabalho atual." '); }} className="w-full py-3 bg-yellow-400 text-black rounded-[20px] font-black text-[10px] uppercase shadow-sm border-2 border-white flex items-center justify-center space-x-2">
                    <Clock size={14} /> <span>Aumentar +10m (Avisar Próximo)</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* MÃ“DULO DE PAGAMENTO */}
        {matchSession?.status === 'payment' && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[2000] bg-[#0f172a] rounded-t-[40px] px-8 pb-28 shadow-2xl border-t-4 border-green-500">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-4" />
            {!isBarberView ? (
              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase italic mb-6">Pagar Atendimento</h3>
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 mb-8 text-left"><p className="text-xl font-black text-green-400 italic">Total: R$ {matchSession.activeMatch.price},00</p></div>
                <div className="grid grid-cols-3 gap-3 mb-8">{[{ id: 'pix', icon: Zap, label: 'PIX' }, { id: 'credit', icon: CreditCard, label: 'CrÃ©dito' }, { id: 'debit', icon: Wallet, label: 'DÃ©bito' }].map(method => (<button key={method.id} onClick={() => setPaymentMethod(method.id as any)} className={`flex flex-col items-center p-5 rounded-[24px] border-2 transition-all ${paymentMethod === method.id ? 'border-green-500 bg-green-500/20' : 'border-white/5 bg-white/5'}`}><method.icon size={28} className={paymentMethod === method.id ? 'text-green-400' : 'text-white/20'} /><span className="text-[10px] font-black uppercase mt-2">{method.label}</span></button>))}</div>
                <button disabled={!paymentMethod || isProcessingPayment} onClick={handleFinalizePayment} className="w-full py-6 bg-green-500 text-white rounded-[30px] font-black text-sm uppercase shadow-xl flex items-center justify-center space-x-3">{isProcessingPayment ? <><Loader2 size={20} className="animate-spin" /> <span>Processando...</span></> : <span>Confirmar Pagamento</span>}</button>
              </div>
            ) : (
              <div className="text-center py-10"><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={32} className="text-green-400" /></motion.div><h3 className="text-2xl font-black text-white uppercase italic mb-2">Aguardando Pagamento</h3><button onClick={() => console.log('Reportar problema')} className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 py-6 rounded-[30px] font-black text-xs uppercase mt-12 border border-red-500/20"><AlertTriangle size={18} /> <span>Reportar Problema</span></button></div>
            )}
          </motion.div>
        )}

        {/* MODAL DE AVALIAÃ‡ÃƒO */}
        {matchSession?.status === 'finished' && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[3000] bg-white rounded-t-[40px] px-8 pb-28 shadow-2xl flex flex-col items-center">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full my-4" /><h3 className="text-sm font-bold text-gray-800 mb-2">Como foi o atendimento?</h3><h2 className="text-2xl font-black text-blue-950 mb-6">{isBarberView ? matchSession.activeMatch?.client.name : 'Junior Vila'}</h2><div className="flex space-x-3 mb-8">{[1, 2, 3, 4, 5].map(s => (<Star key={s} size={42} onClick={() => setStars(s)} className={stars >= s ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-200'} />))}</div>
            <div className="flex flex-col w-full space-y-3"><button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'receipt' }))} className="w-full bg-black text-white py-6 rounded-2xl font-black text-sm uppercase shadow-xl">Avaliar profissional</button><button onClick={() => setMatchSession((prev: any) => ({ ...prev, status: 'receipt' }))} className="w-full py-4 text-gray-400 font-black text-[10px] uppercase">Não Avaliar agora</button></div>
          </motion.div>
        )}

        {/* TELA DE RECIBO */}
        {matchSession?.status === 'receipt' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[4000] bg-blue-950 flex flex-col items-center p-8 text-center overflow-y-auto no-scrollbar">
            <div className="mt-12 bg-white w-full rounded-[48px] p-8 shadow-2xl relative overflow-hidden"><h2 className="text-3xl font-black text-blue-950 uppercase italic mb-2 tracking-tighter">Atendimento Finalizado</h2><div className="border-t-2 border-dashed border-gray-100 py-6 flex justify-between text-sm font-black text-blue-950 uppercase"><span>Total Pago</span><span>R$ {matchSession.activeMatch.price + tipAmount},00</span></div><div className="bg-blue-600 rounded-[32px] p-6 text-white mb-8"><span className="text-xl font-black italic">+500 Pontos</span></div><div className="grid grid-cols-2 gap-3"><button className="bg-gray-900 text-white py-5 rounded-[24px] font-black text-[10px] uppercase">Compartilhar</button><button className="bg-gray-50 text-gray-400 py-5 rounded-[24px] font-black text-[10px] uppercase">Baixar Recibo</button></div></div>
            <button onClick={() => { setMatchSession((prev: any) => ({ ...prev, status: 'idle', activeMatch: null })); setIsRequesting(false); setIsRadarOpen(false); setSelectedServices([]); setStars(0); setTipAmount(0); setPaymentMethod(null); }} className="mt-12 w-full bg-white/10 text-white py-6 rounded-[30px] font-black text-sm uppercase">Voltar ao Mapa</button>
          </motion.div>
        )}

        {/* SELECTION DRAWER */}
        {isRequesting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[2000] flex items-end justify-center bg-blue-950/40 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-white rounded-t-[50px] pt-2 pb-12 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto my-4" />
              <div className="px-8 flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-blue-950 uppercase italic">Serviços</h3>
                <X size={24} className="text-gray-400" onClick={() => setIsRequesting(false)} />
              </div>
              <div className="flex-1 overflow-y-auto px-8 space-y-4 no-scrollbar pb-8">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedServices(prev => prev.includes(cat.label) ? prev.filter(s => s !== cat.label) : [...prev, cat.label])}
                    className={`w-full flex items-center justify-between p-6 rounded-[28px] border-2 transition-all ${selectedServices.includes(cat.label) ? 'border-blue-600 bg-blue-50' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-black text-blue-950 text-sm">{cat.label}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">R$ {cat.price}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedServices.includes(cat.label) ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                      {selectedServices.includes(cat.label) && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-8">
                <button onClick={handleSendProposal} disabled={selectedServices.length === 0} className="w-full bg-blue-600 text-white py-7 rounded-[35px] font-black text-xl shadow-2xl disabled:opacity-30 uppercase italic">Solicitar Atendimento</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* RADAR DRAWER */}
        {isRadarOpen && isBarberView && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: isDrawerMinimized ? "calc(100% - 220px)" : 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 50) setIsDrawerMinimized(true);
              else if (info.offset.y < -50) setIsDrawerMinimized(false);
            }}
            className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[2000] bg-white rounded-t-[40px] px-6 pb-28 shadow-2xl border-t border-gray-100 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <button 
              onPointerDown={(e) => dragControls.start(e)}
              onClick={() => setIsDrawerMinimized(!isDrawerMinimized)}
              className="w-full py-4 flex justify-center group touch-none"
            >
              <div className={`w-12 h-1.5 rounded-full transition-all ${isDrawerMinimized ? 'bg-blue-600 w-16' : 'bg-gray-100 group-hover:bg-gray-200'}`} />
            </button>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-2xl font-black text-blue-950 uppercase italic">Lista de Pedidos</h3>
              <X size={24} className="text-gray-300" onClick={() => setIsRadarOpen(false)} />
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pb-6">
              {matchSession.incomingRequests.map((req: any) => (
                <div key={req.id} className="bg-gray-50 p-5 rounded-[28px] flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={req.client.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <p className="text-sm font-black text-blue-950 uppercase italic">{req.client.name}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase">{req.services.join(' + ')}</p>
                    </div>
                  </div>
                  <button onClick={() => { setMatchSession((prev: any) => ({ ...prev, activeMatch: req, status: 'searching' })); setIsRadarOpen(false); }} className="bg-blue-600 text-white p-3.5 rounded-2xl">
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CONFIRMAÇÃO DE CANCELAMENTO */}
        {showCancelConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-y-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[5000] bg-black/60 backdrop-blur-md flex items-center justify-center p-8"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl"><div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={32} className="text-red-500" /></div><h3 className="text-2xl font-black text-blue-950 uppercase italic mb-4">Atenção!</h3><p className="text-sm text-gray-400 font-medium mb-8">Deseja cancelar este atendimento?</p><div className="flex flex-col space-y-3"><button onClick={handleFinalCancel} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase">Sim, cancelar</button><button onClick={() => setShowCancelConfirm(false)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase">Não, manter</button></div></motion.div></motion.div>
        )}

        {/* TOAST CANCELADO */}
        {showCancelledToast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 100, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 w-full max-w-md left-1/2 -translate-x-1/2 z-[6000] flex justify-center px-8 pt-4"><div className="bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 border-2 border-white/10"><AlertTriangle size={18} className="text-yellow-400" /><span className="font-black uppercase italic tracking-widest text-[10px]">Atendimento Cancelado</span></div></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
