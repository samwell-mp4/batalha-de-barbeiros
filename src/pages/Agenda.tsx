import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, ChevronLeft, Plus, X, Zap, Bell, ShieldOff, Check, Scissors as ScissorsIcon, Star, Settings, Calendar, Clock, Navigation } from 'lucide-react';
import { api } from '../services/api';

export default function Agenda() {
  const context = useOutletContext<{ isBarberView: boolean, matchSession: any, setMatchSession: (s: any) => void }>() || { isBarberView: true, matchSession: {}, setMatchSession: () => {} };
  const { isBarberView, matchSession, setMatchSession } = context;

  const today = 16;
  const currentHour = new Date().getHours();
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHoursConfig, setShowHoursConfig] = useState(false);

  const [user] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined') return null;
    try { return JSON.parse(saved); } catch (e) { return null; }
  });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [barberAppointments, setBarberAppointments] = useState<any[]>([]);

  const globalAgenda = matchSession.globalAgenda || {};
  const notifications = matchSession.notifications || [];

  const futureDates = useMemo(() => [16, 17, 18, 19, 20, 21, 22].filter(d => d >= today), [today]);

  const loadClientAppointments = async () => {
    if (user?.id && !isBarberView) {
      try {
        const res = await api.getClientAppointments(user.id);
        setAppointments(res);
      } catch (e) {
        console.error('Failed to load client appointments:', e);
      }
    }
  };

  const loadBarberAppointments = async () => {
    if (user?.id && isBarberView) {
      try {
        const res = await api.getBarberAppointments(user.id);
        setBarberAppointments(res);
      } catch (e) {
        console.error('Failed to load barber appointments:', e);
      }
    }
  };

  useEffect(() => {
    loadClientAppointments();
    loadBarberAppointments();
  }, [user?.id, isBarberView]);

  const updateGlobalAgenda = (date: number, time: string, data: any) => {
    setMatchSession((prev: any) => {
      const currentAgenda = prev.globalAgenda || {};
      const dateData = currentAgenda[date] || {};
      const dateSlots = dateData.slots || [];
      const updatedSlots = [...dateSlots.filter((s: any) => s.time !== time), { time, ...data }];
      
      const updatedNotifs = data.status === 'occupied' 
        ? (prev.notifications || []).filter((n: any) => !(n.time === time && n.date === date))
        : (prev.notifications || []);

      return { 
        ...prev, 
        notifications: updatedNotifs,
        globalAgenda: { ...currentAgenda, [date]: { ...dateData, slots: updatedSlots } } 
      };
    });
    setSelectedSlot(null);
  };

  const handleGlobalAction = (action: 'block_all' | 'radar_all') => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const newSlots = hours.map(h => ({ time: h, status: action === 'block_all' ? 'blocked' : 'radar', client_name: action === 'block_all' ? 'Bloqueado' : 'Radar Ativo' }));
    setMatchSession((prev: any) => ({ ...prev, globalAgenda: { ...(prev.globalAgenda || {}), [selectedDate]: { ...(prev.globalAgenda?.[selectedDate] || {}), slots: newSlots } } }));
  };

  const hours24 = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`), []);

  const currentTimeSlots = useMemo(() => {
    const dayData = globalAgenda[selectedDate] || {};
    const slotsFromGlobal = dayData.slots || [];
    const workingHours = dayData.workingHours || { start: '08:00', end: '20:00' };
    const startIdx = parseInt(workingHours.start.split(':')[0]);
    const endIdx = parseInt(workingHours.end.split(':')[0]);

    return hours24.filter((_, i) => i >= startIdx && i <= endIdx).map(time => {
      const h = parseInt(time.split(':')[0]);
      if (selectedDate === today && h < currentHour) return null;

      // Find DB Appointment matching this specific day & hour slot
      const dbApp = barberAppointments.find((a: any) => {
        const appDate = new Date(a.date);
        return appDate.getDate() === selectedDate && a.time === time && a.status === 'CONFIRMED';
      });

      if (dbApp) {
        return {
          time,
          status: 'occupied',
          client_name: dbApp.client?.name || 'Cliente',
          services: dbApp.services,
          price: dbApp.price,
          isMyBooking: true,
          id: dbApp.id
        };
      }

      const existing = slotsFromGlobal.find((s: any) => s.time === time);
      return existing || { time, status: 'empty', client_name: 'Livre' };
    }).filter(Boolean);
  }, [selectedDate, globalAgenda, hours24, today, currentHour, barberAppointments]);

  const handleAcceptRequest = (notif: any) => {
    updateGlobalAgenda(notif.date, notif.time, { status: 'occupied', client_name: notif.client, services: notif.services, price: notif.price, isMyBooking: true });
    setShowNotifications(false);
    setSelectedSlot(null);
  };

  const setWorkingHours = (date: number, start: string, end: string) => {
    setMatchSession((prev: any) => ({
      ...prev,
      globalAgenda: { ...(prev.globalAgenda || {}), [date]: { ...(prev.globalAgenda?.[date] || {}), workingHours: { start, end } } }
    }));
    setShowHoursConfig(false);
  };

  return (
    <div className="flex flex-col bg-white min-h-full font-inter text-blue-950 pb-44 overflow-y-auto no-scrollbar items-center relative">
      <div className="w-full max-w-md flex flex-col min-h-full bg-white relative">
        
        {/* HEADER SECTION */}
        <div className="px-6 py-6 bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em]">
                  {isBarberView ? 'Gestão Live: Arena Barber' : 'Central do Cliente'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter">
                {isBarberView ? 'Agenda Estratégica' : 'Meus Desafios'}
              </h1>
            </div>
            <div className="flex space-x-2">
               {isBarberView && (
                 <button onClick={() => setShowNotifications(true)} className="p-3 bg-gray-50 rounded-2xl text-blue-950 relative border border-gray-100">
                    <Bell size={20}/>
                    {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold animate-pulse">{notifications.length}</span>}
                 </button>
               )}
               {isBarberView && (
                 <button onClick={() => setShowHoursConfig(true)} className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl">
                   <Settings size={20}/>
                 </button>
               )}
            </div>
          </div>

          {/* DATE PICKER SLIDER (BARBER VIEW ONLY) */}
          {isBarberView && (
            <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-[30px] border border-gray-100 mb-6">
              <button className="p-2 text-gray-300"><ChevronLeft size={20}/></button>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
                {futureDates.map(day => (
                  <button key={day} onClick={() => setSelectedDate(day)} className={`min-w-[50px] py-4 rounded-[22px] flex flex-col items-center transition-all relative ${selectedDate === day ? 'bg-blue-600 text-white shadow-xl scale-110' : 'text-gray-400'}`}>
                    <span className="text-[7px] font-black uppercase mb-1">{day === today ? 'Hoje' : 'Maio'}</span>
                    <span className="text-sm font-black">{day}</span>
                    {(globalAgenda[day]?.slots?.length > 0) && <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${selectedDate === day ? 'bg-white' : 'bg-blue-600'}`} />}
                  </button>
                ))}
              </div>
              <button className="p-2 text-gray-300"><ChevronRight size={20}/></button>
            </div>
          )}

          {isBarberView && (
             <div className="flex space-x-2">
                <button onClick={() => handleGlobalAction('block_all')} className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl text-[8px] font-black uppercase border border-red-100 flex items-center justify-center space-x-2"><ShieldOff size={14}/> <span>Bloquear Tudo</span></button>
                <button onClick={() => handleGlobalAction('radar_all')} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-[8px] font-black uppercase border border-blue-100 flex items-center justify-center space-x-2"><Zap size={14}/> <span>Tudo no Radar</span></button>
             </div>
          )}
        </div>

        {/* CONTENT LAYOUT */}
        <div className="px-6 pt-6">
          {!isBarberView ? (
            /* CLIENT VIEW DASHBOARD */
            <div className="flex flex-col w-full">
              {/* CURRENT ACTIVE BOOKINGS */}
              <div className="mb-8">
                <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Minhas Próximas Batalhas</h2>
                {appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'CONFIRMED').length > 0 ? (
                  <div className="space-y-4">
                    {appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'CONFIRMED').map((app: any) => (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={app.id} className="bg-gradient-to-br from-blue-950 to-blue-900 text-white p-6 rounded-[35px] shadow-2xl relative overflow-hidden border border-blue-800">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><Zap size={100} /></div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-4">
                            <img src={app.barber?.user?.avatar || `https://i.pravatar.cc/150?u=${app.barber?.id}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md" />
                            <div>
                              <h3 className="text-sm font-black uppercase italic leading-none">{app.barber?.user?.name || 'Arena Barber'}</h3>
                              <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-2 tracking-widest ${app.status === 'CONFIRMED' ? 'bg-green-500 text-white animate-pulse' : 'bg-yellow-500 text-black'}`}>
                                {app.status === 'CONFIRMED' ? 'Confirmado' : 'Aguardando Barbeiro'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[14px] font-black text-cyan-400 italic">R$ {app.price},00</p>
                            <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest mt-1">{app.paymentMethod || 'Pix'}</p>
                          </div>
                        </div>
                        <div className="bg-blue-900/50 p-4 rounded-2xl mb-6 flex items-center space-x-2 border border-blue-800">
                          <ScissorsIcon size={14} className="text-cyan-400" />
                          <span className="text-[9px] font-black uppercase tracking-wider">{(app.services || []).join(' + ')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-blue-300 mb-6 bg-blue-950/50 px-4 py-3 rounded-xl">
                          <div className="flex items-center space-x-1.5"><Calendar size={12} className="text-cyan-400" /><span>Dia {new Date(app.date).getDate() || 16}</span></div>
                          <div className="flex items-center space-x-1.5"><Clock size={12} className="text-cyan-400" /><span>Às {app.time}</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              const lat = app.barber?.latitude || -23.525;
                              const lng = app.barber?.longitude || -46.522;
                              alert(`Traçando rota até a Arena de ${app.barber?.user?.name || 'Gustavo'}.\nCoordenadas: [${lat}, ${lng}]`);
                            }} 
                            className="py-4 bg-cyan-500 text-blue-950 rounded-2xl font-black text-[9px] uppercase italic tracking-widest shadow-lg flex items-center justify-center space-x-1.5 active:scale-95 transition-transform"
                          >
                            <Navigation size={12} fill="currentColor" /> <span>Traçar Rota</span>
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja cancelar esta batalha?')) {
                                try {
                                  await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                  alert('Batalha cancelada com sucesso!');
                                  loadClientAppointments();
                                } catch (e: any) {
                                  alert('Erro ao cancelar: ' + e.message);
                                }
                              }
                            }} 
                            className="py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
                          >
                            Cancelar Batalha
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center opacity-30 flex flex-col items-center bg-gray-50 rounded-[35px] border border-gray-100">
                    <ScissorsIcon size={40} className="mb-3 text-blue-950" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-950">Nenhuma Batalha Agendada</p>
                  </div>
                )}
              </div>

              {/* PAST/COMPLETED BOOKINGS */}
              <div>
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Histórico de Batalhas</h2>
                {appointments.filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELLED').length > 0 ? (
                  <div className="space-y-3">
                    {appointments.filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELLED').map((app: any) => (
                      <div key={app.id} className="bg-gray-50 border border-gray-100 p-5 rounded-[28px] flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-left">
                          <img src={app.barber?.user?.avatar || `https://i.pravatar.cc/150?u=${app.barber?.id}`} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{app.barber?.user?.name || 'Gustavo'}</h4>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{(app.services || []).join(' + ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-blue-950">R$ {app.price},00</p>
                          <span className={`inline-block text-[7px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {app.status === 'COMPLETED' ? 'Finalizado' : 'Cancelado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center opacity-25">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Nenhum histórico disponível</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BARBER VIEW TIMELINE */
            <div className="space-y-3 relative pb-20">
               <div className="absolute left-9 top-0 bottom-0 w-px bg-gray-50 z-0" />
               {currentTimeSlots.map((slot: any) => {
                  const pendingRequests = notifications.filter((n: any) => n.time === slot.time && n.date === selectedDate && n.status === 'pending' && n.barberName !== 'Arena Aberta');
                  const isMyBooking = slot.isMyBooking && !isBarberView;
                  
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={slot.time} className="flex items-start space-x-4 relative z-10">
                       <div className="flex flex-col items-center w-8 pt-5"><span className="text-[8px] font-black text-gray-200">{slot.time}</span></div>
                       <div className="flex-1">
                          <button onClick={() => { 
                             if (isBarberView && pendingRequests.length > 0) {
                                setSelectedSlot({ ...slot, requests: pendingRequests });
                             } else {
                                setSelectedSlot(slot);
                             }
                          }}
                            className={`w-full p-5 rounded-[28px] border flex items-center justify-between transition-all ${pendingRequests.length > 0 ? 'bg-yellow-50 border-yellow-200 shadow-lg shadow-yellow-100/50' : isMyBooking ? 'bg-blue-600 border-none text-white shadow-2xl shadow-blue-100' : slot.status === 'occupied' ? 'bg-white border-gray-100 shadow-sm' : slot.status === 'radar' ? 'bg-blue-50 border-blue-200 border-dashed' : slot.status === 'blocked' ? 'bg-gray-50 opacity-50 grayscale' : 'bg-gray-50/10 border-dashed border-gray-100'}`}>
                             <div className="flex items-center space-x-4 text-left">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${pendingRequests.length > 0 ? 'bg-yellow-400 text-white' : isMyBooking ? 'bg-white/20 text-white shadow-inner' : slot.status === 'occupied' ? 'bg-blue-50 text-blue-600' : slot.status === 'radar' ? 'bg-blue-600 text-white' : slot.status === 'blocked' ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-200'}`}>
                                   {pendingRequests.length > 0 ? <span className="font-black text-xs">{pendingRequests.length}</span> : isMyBooking ? <User size={20} /> : slot.status === 'occupied' ? <User size={18} /> : slot.status === 'radar' ? <Zap size={18} fill="white" /> : slot.status === 'blocked' ? <ShieldOff size={18}/> : <Plus size={18} />}
                                </div>
                                <div>
                                   <h4 className={`text-[12px] font-black uppercase tracking-tight ${isMyBooking ? 'text-white' : (slot.status === 'empty' && pendingRequests.length === 0 ? 'text-gray-300' : 'text-blue-950')}`}>
                                      {pendingRequests.length > 1 ? `${pendingRequests.length} SOLICITAÇÕES` : (pendingRequests.length === 1 ? 'NOVA SOLICITAÇÃO' : (isMyBooking ? `Batalha c/ ${slot.client_name}` : slot.client_name))}
                                   </h4>
                                   <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isMyBooking ? 'text-blue-100' : 'text-gray-400'}`}>
                                      {pendingRequests.length > 0 ? 'Candidatos em espera' : (slot.services?.length ? `${slot.services.join(' + ')} • R$ ${slot.price},00` : slot.status)}
                                   </p>
                                </div>
                             </div>
                             {pendingRequests.length > 0 && <ChevronRight size={18} className="text-yellow-600 animate-pulse" />}
                          </button>
                       </div>
                    </motion.div>
                  );
               })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {/* MODAL GESTÃO BARBEIRO (MÚLTIPLOS PEDIDOS) */}
        {selectedSlot && isBarberView && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-blue-950/60 backdrop-blur-md flex items-end justify-center">
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-white rounded-t-[55px] p-10 shadow-2xl">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />
                
                {selectedSlot.requests?.length > 0 ? (
                  <div className="flex flex-col">
                     <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-2">{selectedSlot.requests.length} Desafios Pendentes</h3>
                     <p className="text-[10px] text-gray-400 font-black uppercase text-center mb-8 tracking-widest">Escolha o seu próximo oponente</p>
                     
                     <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar mb-8">
                        {selectedSlot.requests.map((req: any) => (
                           <div key={req.id} className="bg-gray-50 p-5 rounded-[35px] border border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center space-x-3">
                                    <img src={`https://i.pravatar.cc/150?u=${req.id}`} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md" />
                                    <div>
                                       <p className="text-xs font-black text-blue-950 uppercase italic leading-none">{req.client}</p>
                                       <div className="flex items-center text-yellow-500 font-black text-[8px] mt-1"><Star size={10} className="fill-yellow-500 mr-1" /> 4.9 • 1.2km</div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-black text-green-600">R$ {req.price},00</p>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase">{req.paymentMethod || 'Pix'}</p>
                                 </div>
                              </div>
                              <div className="bg-white p-3 rounded-2xl mb-4 flex items-center space-x-2 border border-gray-100">
                                 <ScissorsIcon size={14} className="text-blue-500"/><span className="text-[9px] font-black text-blue-950 uppercase">{req.services.join(' + ')}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <button onClick={() => handleAcceptRequest(req)} className="py-4 bg-blue-600 text-white rounded-[20px] font-black text-[9px] uppercase italic tracking-widest shadow-lg flex items-center justify-center space-x-2"><Check size={14}/> <span>Aceitar</span></button>
                                 <button onClick={() => {
                                    setMatchSession((prev: any) => ({ ...prev, notifications: prev.notifications.filter((n: any) => n.id !== req.id) }));
                                    setSelectedSlot(null);
                                 }} className="py-4 bg-white border border-red-50 text-red-500 rounded-[20px] font-black text-[9px] uppercase flex items-center justify-center space-x-2"><X size={14}/> <span>Recusar</span></button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                     <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-10 tracking-widest">Dia {selectedDate} • {selectedSlot.time}</h3>
                     <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'radar', client_name: 'Radar Ativo' })} className="w-full py-7 bg-blue-600 text-white rounded-[30px] font-black text-sm uppercase italic shadow-xl flex items-center justify-center space-x-3"><Zap size={22} className="text-cyan-300" /> <span>Lançar no Radar</span></button>
                     <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'occupied', client_name: 'Reserva Manual', services: ['Corte Manual'], price: 50 })} className="w-full py-6 bg-gray-900 text-white rounded-[30px] font-black text-xs uppercase flex items-center justify-center space-x-3"><Plus size={20}/> <span>Agendar Manual</span></button>
                     <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'blocked', client_name: 'Bloqueado' })} className="w-full py-6 bg-gray-100 text-gray-400 rounded-[30px] font-black text-xs uppercase flex items-center justify-center space-x-3"><ShieldOff size={20}/> <span>Bloquear Agenda</span></button>
                     <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'empty', client_name: 'Livre' })} className="w-full py-4 text-red-500 font-black text-[10px] uppercase mt-4 text-center">Limpar Slot</button>
                  </div>
                )}
                <button onClick={() => setSelectedSlot(null)} className="w-full py-4 text-gray-300 font-black text-[9px] uppercase mt-2">Fechar</button>
             </motion.div>
          </motion.div>
        )}

        {/* NOTIFICATIONS CENTER */}
        {showNotifications && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-blue-950/60 backdrop-blur-md flex items-end justify-center">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-white rounded-t-[55px] p-10 shadow-2xl">
                 <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />
                 <h3 className="text-2xl font-black text-blue-950 uppercase italic text-center mb-10">Solicitações Recentes</h3>
                 <div className="space-y-4 max-h-[450px] overflow-y-auto no-scrollbar pb-10">
                    {notifications.length > 0 ? notifications.map((n: any) => (
                      <div key={n.id} className="bg-gray-50 p-6 rounded-[40px] border border-gray-100">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                               <img src={`https://i.pravatar.cc/150?u=${n.id}`} className="w-12 h-12 rounded-2xl border-2 border-white" />
                               <div><p className="text-xs font-black text-blue-950 uppercase italic">{n.client}</p><p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Dia {n.date} às {n.time}</p></div>
                            </div>
                            <button onClick={() => handleAcceptRequest(n)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-50"><Check size={20}/></button>
                         </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center opacity-30"><Bell size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Nenhuma notificação</p></div>
                    )}
                 </div>
                 <button onClick={() => setShowNotifications(false)} className="w-full py-4 text-gray-300 font-black text-[9px] uppercase mt-2">Fechar</button>
              </motion.div>
           </motion.div>
        )}

        {/* WORK shift MODAL */}
        {showHoursConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-blue-950/60 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-black text-blue-950 uppercase italic mb-6">Configurar Jornada</h3>
                <div className="space-y-4 mb-8">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Início</p>
                      <select className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black text-sm" defaultValue="08:00"><option value="08:00">08:00</option><option value="09:00">09:00</option><option value="10:00">10:00</option></select>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Fim</p>
                      <select className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black text-sm" defaultValue="19:00"><option value="18:00">18:00</option><option value="19:00">19:00</option><option value="20:00">20:00</option></select>
                   </div>
                </div>
                <button onClick={() => setWorkingHours(selectedDate, '08:00', '19:00')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Salvar Turno</button>
                <button onClick={() => setShowHoursConfig(false)} className="w-full py-4 text-gray-300 font-black text-[9px] uppercase mt-2 text-center w-full">Cancelar</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
