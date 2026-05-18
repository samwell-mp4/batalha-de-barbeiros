import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, ChevronLeft, Plus, X, Zap, Bell, ShieldOff, Check, Scissors as ScissorsIcon, Star, Settings, Calendar, Clock, Navigation } from 'lucide-react';
import { api } from '../services/api';

export default function Agenda() {
  const context = useOutletContext<{ isBarberView: boolean, matchSession: any, setMatchSession: (s: any) => void }>() || { isBarberView: true, matchSession: {}, setMatchSession: () => { } };
  const { isBarberView, matchSession, setMatchSession } = context;
  const navigate = useNavigate(); console.log(navigate);

  const today = 16;
  const currentHour = new Date().getHours();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHoursConfig, setShowHoursConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'agenda' | 'financeiro' | 'notificacoes'>('agenda');
  const [hoursConfigStart, setHoursConfigStart] = useState('08:00');
  const [hoursConfigEnd, setHoursConfigEnd] = useState('20:00');
  const [shownPopupIds, setShownPopupIds] = useState<string[]>([]);
  const [activePopupNotification, setActivePopupNotification] = useState<any>(null);

  const [user] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined') return null;
    try { return JSON.parse(saved); } catch (e: any) { return null; }
  });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [barberAppointments, setBarberAppointments] = useState<any[]>([]);
  const [clientRatings, setClientRatings] = useState<Record<string, number>>({});
  const [barberRatings, setBarberRatings] = useState<Record<string, number>>({});

  const globalAgenda = matchSession.globalAgenda || {};
  const barberKeyPrefix = user?.barberProfile?.id || user?.id || 'default';
  const notifications = matchSession.notifications || [];

  // Log derivado em tempo real de todas as notificações de status para ambos (Cliente e Barbeiro)
  const notificationsList = useMemo(() => {
    const list: any[] = [];
    const sourceApps = isBarberView ? barberAppointments : appointments;

    sourceApps.forEach((app: any) => {
      const appDate = new Date(app.date);
      const dayStr = appDate.getUTCDate() || 16;
      const timeStr = app.time;
      const targetName = isBarberView ? (app.client?.name || 'Cliente') : (app.barber?.user?.name || 'Arena Barber');

      if (app.status === 'PENDING') {
        list.push({
          id: `${app.id}_pending`,
          title: isBarberView ? 'Nova Solicitação' : 'Solicitado',
          message: isBarberView 
            ? `Você recebeu um novo pedido de agendamento de ${targetName} para o Dia ${dayStr} às ${timeStr}.`
            : `Seu agendamento para o Dia ${dayStr} às ${timeStr} foi enviado e aguarda o aceite de ${targetName}.`,
          type: 'pending',
          date: app.updatedAt || app.createdAt || new Date().toISOString(),
          appointment: app
        });
      } else if (app.status === 'PROPOSAL_SENT') {
        list.push({
          id: `${app.id}_proposal`,
          title: 'Proposta de Valor',
          message: isBarberView
            ? `Proposta enviada para ${targetName} para o Dia ${dayStr} às ${timeStr} no valor de R$ ${app.price},00.`
            : `Você recebeu uma proposta de R$ ${app.price},00 de ${targetName} para o Dia ${dayStr} às ${timeStr}.`,
          type: 'proposal',
          date: app.updatedAt || new Date().toISOString(),
          appointment: app
        });
      } else if (app.status === 'CONFIRMED') {
        list.push({
          id: `${app.id}_confirmed`,
          title: 'Agendamento Confirmado',
          message: isBarberView
            ? `O agendamento com ${targetName} para o Dia ${dayStr} às ${timeStr} está CONFIRMADO!`
            : `Seu agendamento com ${targetName} para o Dia ${dayStr} às ${timeStr} foi CONFIRMADO!`,
          type: 'confirmed',
          date: app.updatedAt || new Date().toISOString(),
          appointment: app
        });
      } else if (app.status === 'IN_SERVICE') {
        list.push({
          id: `${app.id}_inservice`,
          title: 'Serviço Iniciado',
          message: isBarberView
            ? `Você iniciou o atendimento de ${targetName} às ${timeStr}.`
            : `Seu atendimento com ${targetName} para o Dia ${dayStr} às ${timeStr} foi INICIADO.`,
          type: 'inservice',
          date: app.updatedAt || new Date().toISOString(),
          appointment: app
        });
      } else if (app.status === 'PAYMENT') {
        list.push({
          id: `${app.id}_payment`,
          title: 'Aguardando Pagamento',
          message: isBarberView
            ? `Serviço com ${targetName} finalizado. Aguardando comprovação de pagamento de R$ ${app.price},00.`
            : `Serviço finalizado! Por favor, realize o pagamento de R$ ${app.price},00 via Pix para ${targetName}.`,
          type: 'payment',
          date: app.updatedAt || new Date().toISOString(),
          appointment: app
        });
      } else if (app.status === 'COMPLETED') {
        list.push({
          id: `${app.id}_completed`,
          title: 'Serviço Concluído',
          message: isBarberView
            ? `Atendimento de ${targetName} concluído com sucesso! R$ ${app.price},00 adicionados ao seu painel.`
            : `Seu atendimento com ${targetName} foi CONCLUÍDO! Avalie o barbeiro na sua aba de agendamentos.`,
          type: 'completed',
          date: app.updatedAt || new Date().toISOString(),
          appointment: app
        });
      } else if (app.status === 'CANCELLED') {
        list.push({
          id: `${app.id}_cancelled`,
          title: 'Agendamento Cancelado',
          message: `O agendamento com ${targetName} para o Dia ${dayStr} às ${timeStr} foi CANCELADO.`,
          type: 'cancelled',
          date: app.updatedAt || new Date().toISOString(),
          appointment: app
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [barberAppointments, appointments, isBarberView]);

  // Sincronizar dinamicamente os inputs da jornada de trabalho ao trocar de data
  useEffect(() => {
    const key = `${barberKeyPrefix}_${selectedDate}`;
    const dayData = globalAgenda[key] || {};
    const workingHours = dayData.workingHours || { start: '08:00', end: '20:00' };
    setHoursConfigStart(workingHours.start || '08:00');
    setHoursConfigEnd(workingHours.end || '20:00');
  }, [selectedDate, globalAgenda, barberKeyPrefix]);

  // Disparar alertas popup dinamicamente quando uma nova notificação chega (polling)
  useEffect(() => {
    if (notificationsList.length > 0) {
      const latestNotif = notificationsList[0];
      if (!shownPopupIds.includes(latestNotif.id)) {
        // Evita disparos duplicados para a mesma notificação
        setShownPopupIds(prev => [...prev, latestNotif.id]);
        
        // Apenas dispara popup para notificações recentes (criadas/atualizadas nos últimos 60 segundos)
        const notifTime = new Date(latestNotif.date).getTime();
        const nowTime = new Date().getTime();
        const isRecent = Math.abs(nowTime - notifTime) < 60000;
        
        if (isRecent) {
          setActivePopupNotification(latestNotif);
          // Ocultar automaticamente após 8 segundos
          const timer = setTimeout(() => {
            setActivePopupNotification((current: any) => {
              if (current && current.id === latestNotif.id) {
                return null;
              }
              return current;
            });
          }, 8000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [notificationsList, shownPopupIds]);

  const handleNotificationClick = (notif: any) => {
    if (notif.appointment) {
      const app = notif.appointment;
      const appDate = new Date(app.date);
      const dayNum = appDate.getUTCDate();
      
      // 1. Alterna para a aba de Agenda
      setActiveTab('agenda');
      
      // 2. Seleciona o dia correto
      setSelectedDate(dayNum);
      
      // 3. Se for barbeiro, abre o modal de gestão do slot imediatamente
      if (isBarberView) {
        setSelectedSlot({
          time: app.time,
          status: 'occupied',
          client_name: app.client?.name || 'Cliente',
          services: app.services || ['Serviço'],
          price: app.price || 50,
          appointment: app
        });
      } else {
        // Se for cliente, fecha o modal anterior e foca na agenda
        setSelectedSlot(null);
      }
      
      // 4. Limpa o popup ativo se foi clicado
      setActivePopupNotification(null);
    }
  };

  const futureDates = useMemo(() => [16, 17, 18, 19, 20, 21, 22].filter(d => d >= today), [today]);

  const loadClientAppointments = async () => {
    if (user?.id && !isBarberView) {
      try {
        const res = await api.getClientAppointments(user.id);
        setAppointments(res);
      } catch (e: any) {
        console.error('Failed to load client appointments:', e);
      }
    }
  };

  const loadBarberAppointments = async () => {
    if (user?.id && isBarberView) {
      try {
        const res = await api.getBarberAppointments(user.id);
        setBarberAppointments(res);
      } catch (e: any) {
        console.error('Failed to load barber appointments:', e);
      }
    }
  };

  useEffect(() => {
    loadClientAppointments();
    loadBarberAppointments();

    const interval = setInterval(() => {
      loadClientAppointments();
      loadBarberAppointments();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, isBarberView]);

  useEffect(() => {
    async function loadBarberSchedule() {
      if (isBarberView && user?.id) {
        try {
          const barberData = await api.getBarber(user.id);
          if (barberData && barberData.schedule) {
            const parsedSchedule = JSON.parse(barberData.schedule);
            setMatchSession((prev: any) => ({
              ...prev,
              globalAgenda: {
                ...(prev.globalAgenda || {}),
                ...parsedSchedule
              }
            }));
          }
        } catch (e: any) {
          console.error('Failed to load barber schedule from DB:', e);
        }
      }
    }
    loadBarberSchedule();
  }, [user?.id, isBarberView]);

  const updateGlobalAgenda = (date: number, time: string, data: any) => {
    setMatchSession((prev: any) => {
      const currentAgenda = prev.globalAgenda || {};
      const key = `${barberKeyPrefix}_${date}`;
      const dateData = currentAgenda[key] || {};
      const dateSlots = dateData.slots || [];
      const updatedSlots = [...dateSlots.filter((s: any) => s.time !== time), { time, ...data }];

      const updatedNotifs = data.status === 'occupied'
        ? (prev.notifications || []).filter((n: any) => !(n.time === time && n.date === date))
        : (prev.notifications || []);

      const newAgenda = { ...currentAgenda, [key]: { ...dateData, slots: updatedSlots } };

      // Save schedule to database
      if (user?.id) {
        api.updateBarberProfile(user.id, { schedule: JSON.stringify(newAgenda) })
          .catch(err => console.error('Error persisting agenda update to DB:', err));
      }

      return {
        ...prev,
        notifications: updatedNotifs,
        globalAgenda: newAgenda
      };
    });
    setSelectedSlot(null);
  };

  const handleGlobalAction = (action: 'block_all' | 'radar_all') => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const newSlots = hours.map(h => ({ time: h, status: action === 'block_all' ? 'blocked' : 'radar', client_name: action === 'block_all' ? 'Bloqueado' : 'Radar Ativo' }));
    const key = `${barberKeyPrefix}_${selectedDate}`;

    setMatchSession((prev: any) => {
      const currentAgenda = prev.globalAgenda || {};
      const newAgenda = { ...currentAgenda, [key]: { ...(currentAgenda[key] || {}), slots: newSlots } };

      // Save schedule to database
      if (user?.id) {
        api.updateBarberProfile(user.id, { schedule: JSON.stringify(newAgenda) })
          .catch(err => console.error('Error persisting agenda action to DB:', err));
      }

      return { ...prev, globalAgenda: newAgenda };
    });
  };

  const hours24 = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`), []);

  const currentTimeSlots = useMemo(() => {
    const key = `${barberKeyPrefix}_${selectedDate}`;
    const dayData = globalAgenda[key] || {};
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
        return appDate.getUTCDate() === selectedDate && a.time === time && ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'].includes(a.status);
      });

      if (dbApp) {
        return {
          time,
          status: 'occupied',
          client_name: dbApp.client?.name || 'Cliente',
          services: dbApp.services,
          price: dbApp.price,
          isMyBooking: true,
          id: dbApp.id,
          appointment: dbApp
        };
      }

      const existing = slotsFromGlobal.find((s: any) => s.time === time);
      return existing || { time, status: 'empty', client_name: 'Livre' };
    }).filter(Boolean);
  }, [selectedDate, globalAgenda, hours24, today, currentHour, barberAppointments, user?.id]);

  const handleAcceptRequest = (notif: any) => {
    updateGlobalAgenda(notif.date, notif.time, { status: 'occupied', client_name: notif.client, services: notif.services, price: notif.price, isMyBooking: true });
    setShowNotifications(false);
    setSelectedSlot(null);
  };

  const setWorkingHours = (date: number, start: string, end: string) => {
    const key = `${barberKeyPrefix}_${date}`;
    setMatchSession((prev: any) => {
      const currentAgenda = prev.globalAgenda || {};
      const newAgenda = { ...currentAgenda, [key]: { ...(currentAgenda[key] || {}), workingHours: { start, end } } };

      // Save working hours to database schedule
      if (user?.id) {
        api.updateBarberProfile(user.id, { schedule: JSON.stringify(newAgenda) })
          .catch(err => console.error('Error persisting working hours to DB:', err));
      }

      return { ...prev, globalAgenda: newAgenda };
    });
    setShowHoursConfig(false);
  };

  const completedApps = isBarberView
    ? barberAppointments.filter((a: any) => a.status === 'COMPLETED')
    : appointments.filter((a: any) => a.status === 'COMPLETED');

  const faturamentoRealizado = completedApps.reduce((sum, a) => sum + (a.price || 0), 0);

  const pendingOrConfirmedApps = isBarberView
    ? barberAppointments.filter((a: any) => ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT'].includes(a.status))
    : appointments.filter((a: any) => ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT'].includes(a.status));

  const faturamentoPrevisto = pendingOrConfirmedApps.reduce((sum, a) => sum + (a.price || 0), 0);

  const totalGasto = completedApps.reduce((sum, a) => sum + (a.price || 0), 0);
  const totalAgendado = pendingOrConfirmedApps.reduce((sum, a) => sum + (a.price || 0), 0);

  const allApps = isBarberView
    ? [...barberAppointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                {isBarberView ? 'Agenda Estratégica' : 'Meus Serviço'}
              </h1>
            </div>
            <div className="flex space-x-2">
              {isBarberView && (
                <button onClick={() => setShowNotifications(true)} className="p-3 bg-gray-50 rounded-2xl text-blue-950 relative border border-gray-100">
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold animate-pulse">{notifications.length}</span>}
                </button>
              )}
              {isBarberView && (
                <button onClick={() => setShowHoursConfig(true)} className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl">
                  <Settings size={20} />
                </button>
              )}
            </div>
          </div>

          {/* DATE PICKER SLIDER (BARBER VIEW ONLY) */}
          {isBarberView && (
            <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-[30px] border border-gray-100 mb-6">
              <button className="p-2 text-gray-300"><ChevronLeft size={20} /></button>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
                {futureDates.map(day => (
                  <button key={day} onClick={() => setSelectedDate(day)} className={`min-w-[50px] py-4 rounded-[22px] flex flex-col items-center transition-all relative ${selectedDate === day ? 'bg-blue-600 text-white shadow-xl scale-110' : 'text-gray-400'}`}>
                    <span className="text-[7px] font-black uppercase mb-1">{day === today ? 'Hoje' : 'Maio'}</span>
                    <span className="text-sm font-black">{day}</span>
                    {(globalAgenda[day]?.slots?.length > 0) && <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${selectedDate === day ? 'bg-white' : 'bg-blue-600'}`} />}
                  </button>
                ))}
              </div>
              <button className="p-2 text-gray-300"><ChevronRight size={20} /></button>
            </div>
          )}

          {isBarberView && (
            <div className="flex space-x-2">
              <button onClick={() => handleGlobalAction('block_all')} className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl text-[8px] font-black uppercase border border-red-100 flex items-center justify-center space-x-2"><ShieldOff size={14} /> <span>Bloquear Tudo</span></button>
              <button onClick={() => handleGlobalAction('radar_all')} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-[8px] font-black uppercase border border-blue-100 flex items-center justify-center space-x-2"><Zap size={14} /> <span>Tudo no Radar</span></button>
            </div>
          )}
        </div>

        {/* CONTENT LAYOUT */}
        <div className="px-6 pt-6">
          {/* TAB SYSTEM */}
          <div className="flex space-x-2 bg-gray-50 p-1.5 rounded-[24px] border border-gray-100 mb-6 w-full">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 py-3.5 rounded-[18px] text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'agenda' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              {isBarberView ? 'Agenda' : 'Agendamentos'}
            </button>
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`flex-1 py-3.5 rounded-[18px] text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'financeiro' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              {isBarberView ? 'Financeiro' : 'Histórico'}
            </button>
            <button
              onClick={() => setActiveTab('notificacoes')}
              className={`flex-1 py-3.5 rounded-[18px] text-[9px] font-black uppercase tracking-wider transition-all relative ${activeTab === 'notificacoes' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              <span>Alertas</span>
              {isBarberView && notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'financeiro' ? (
            /* FINANCEIRO / HISTORICO PANEL */
            <div className="flex flex-col w-full pb-20">
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white p-5 rounded-[28px] border border-blue-800 text-left">
                  <span className="text-[8px] font-black text-cyan-300 uppercase tracking-widest block mb-1">
                    {isBarberView ? 'Faturamento Real' : 'Despesas Totais'}
                  </span>
                  <p className="text-xl font-black italic">R$ {isBarberView ? faturamentoRealizado : totalGasto},00</p>
                  <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest block mt-2">
                    ✓ {completedApps.length} Atendimentos
                  </span>
                </div>
                <div className="bg-gray-50 p-5 rounded-[28px] border border-gray-100 text-left">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    {isBarberView ? 'Previsão / Agendado' : 'Agendamentos Pendentes'}
                  </span>
                  <p className="text-xl font-black italic text-blue-950">R$ {isBarberView ? faturamentoPrevisto : totalAgendado},00</p>
                  <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest block mt-2">
                    ⧗ {pendingOrConfirmedApps.length} Reservas
                  </span>
                </div>
              </div>

              {/* HISTORICO LIST */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 text-left">Lista de Agendamentos</p>
                {allApps.length > 0 ? (
                  allApps.map((app: any) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
                      PROPOSAL_SENT: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
                      CONFIRMED: 'bg-blue-50 text-blue-600 border border-blue-100',
                      ARRIVED: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
                      IN_SERVICE: 'bg-purple-50 text-purple-600 border border-purple-100 animate-pulse',
                      PAYMENT: 'bg-orange-50 text-orange-600 border border-orange-100',
                      COMPLETED: 'bg-green-50 text-green-600 border border-green-100',
                      CANCELLED: 'bg-red-50 text-red-600 border border-red-100',
                    };
                    const statusLabels: Record<string, string> = {
                      PENDING: 'Pendente',
                      PROPOSAL_SENT: 'Proposta',
                      CONFIRMED: 'Confirmado',
                      ARRIVED: 'Chegou',
                      IN_SERVICE: 'Em Andamento',
                      PAYMENT: 'Pagamento',
                      COMPLETED: 'Finalizado',
                      CANCELLED: 'Cancelado',
                    };
                    const displayUser = isBarberView ? app.client : (app.barber?.user || app.barber || {});
                    const appDate = new Date(app.date);

                    return (
                      <div key={app.id} className="bg-white border border-gray-100 p-5 rounded-[28px] flex flex-col space-y-4 shadow-sm text-left">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <img
                              src={displayUser?.avatar || 'https://i.pravatar.cc/150'}
                              className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md"
                            />
                            <div>
                              <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{displayUser?.name || 'Luis'}</h4>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 block">
                                Dia {appDate.getUTCDate() || 16} às {app.time}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${statusColors[app.status] || 'bg-gray-50 text-gray-400'}`}>
                            {statusLabels[app.status] || app.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <div>
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Serviços</p>
                            <p className="text-[10px] font-black text-blue-950 uppercase mt-0.5">{(app.services || []).join(' + ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Valor</p>
                            <p className="text-xs font-black text-blue-600 mt-0.5">R$ {app.price},00</p>
                          </div>
                        </div>

                        {/* Cancel Action inside History for pending/confirmed ones */}
                        {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                          <button
                            onClick={async () => {
                              if (confirm('Tem certeza de que deseja cancelar este agendamento?')) {
                                try {
                                  await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                  alert('Agendamento cancelado com sucesso!');
                                  loadClientAppointments();
                                  loadBarberAppointments();
                                } catch (e: any) {
                                  alert('Erro ao cancelar: ' + e.message);
                                }
                              }
                            }}
                            className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-[8px] font-black uppercase border border-red-100 hover:bg-red-100 active:scale-95 transition-all text-center"
                          >
                            Cancelar Agendamento
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center opacity-30 bg-gray-50 rounded-[35px] border border-gray-100">
                    <Calendar size={48} className="mx-auto mb-4 text-blue-950" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum Registro Encontrado</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'notificacoes' ? (
            /* NOTIFICAÇÕES TAB CONTENT */
            <div className="flex flex-col w-full pb-28 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase text-blue-950/40 tracking-wider">Histórico de Alertas</h3>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {notificationsList.length} total
                </span>
              </div>

              {notificationsList.length > 0 ? (
                <div className="space-y-4">
                  {notificationsList.map((notif: any) => {
                    let borderClass = 'border-gray-100 bg-gray-50/50';
                    let iconBg = 'bg-gray-100 text-gray-400';
                    if (notif.type === 'pending') {
                      borderClass = 'border-yellow-100 bg-yellow-50/30';
                      iconBg = 'bg-yellow-400 text-white animate-pulse';
                    } else if (notif.type === 'confirmed') {
                      borderClass = 'border-green-100 bg-green-50/30';
                      iconBg = 'bg-green-500 text-white';
                    } else if (notif.type === 'cancelled') {
                      borderClass = 'border-red-100 bg-red-50/30';
                      iconBg = 'bg-red-500 text-white';
                    } else if (notif.type === 'inservice') {
                      borderClass = 'border-cyan-100 bg-cyan-50/30';
                      iconBg = 'bg-cyan-500 text-white';
                    } else if (notif.type === 'payment') {
                      borderClass = 'border-orange-100 bg-orange-50/30';
                      iconBg = 'bg-orange-500 text-white';
                    } else if (notif.type === 'completed') {
                      borderClass = 'border-blue-100 bg-blue-50/30';
                      iconBg = 'bg-blue-600 text-white';
                    }

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-5 rounded-[28px] border flex items-start space-x-4 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${borderClass}`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
                          {notif.type === 'pending' || notif.type === 'proposal' ? (
                            <Zap size={16} fill={notif.type === 'pending' ? 'white' : 'transparent'} />
                          ) : notif.type === 'confirmed' ? (
                            <Check size={16} />
                          ) : notif.type === 'cancelled' ? (
                            <X size={16} />
                          ) : notif.type === 'inservice' ? (
                            <Clock size={16} />
                          ) : notif.type === 'payment' ? (
                            <ScissorsIcon size={16} />
                          ) : (
                            <Star size={16} fill="white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-black uppercase text-blue-950 leading-tight">
                              {notif.title}
                            </h4>
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest shrink-0 ml-2">
                              {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-bold leading-normal">
                            {notif.message}
                          </p>
                          {notif.appointment && (
                            <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest mt-1.5 block">
                              Ver na Grade →
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                  <Bell size={48} className="text-gray-400 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-950">
                    Nenhum alerta recente
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* AGENDA / TIMELINE TAB */
            <>
              {!isBarberView ? (
                /* CLIENT VIEW DASHBOARD */
                <div className="flex flex-col w-full">
                  {/* CURRENT ACTIVE BOOKINGS */}
                  {/* CURRENT ACTIVE BOOKINGS */}
                  <div className="mb-8">
                    <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Minhas Próximas Batalhas</h2>
                    {appointments.filter((a: any) => ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'].includes(a.status)).length > 0 ? (
                      <div className="space-y-4">
                        {appointments.filter((a: any) => ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'].includes(a.status)).map((app: any) => {
                          const steps = ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'];
                          const stepLabels = ['Solicitado', 'Proposta', 'Confirmado', 'Ativo', 'Pagamento', 'Avaliado'];
                          const currentStepIdx = steps.indexOf(app.status);

                          return (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={app.id} className="bg-gradient-to-br from-blue-950 to-blue-900 text-white p-6 rounded-[35px] shadow-2xl relative overflow-hidden border border-blue-800">
                              <div className="absolute top-0 right-0 p-6 opacity-5"><Zap size={100} /></div>

                              {/* HEADER INFO */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-4">
                                  <img src={app.barber?.user?.avatar || `https://i.pravatar.cc/150?u=${app.barber?.id}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md" />
                                  <div>
                                    <h3 className="text-sm font-black uppercase italic leading-none">{app.barber?.user?.name || 'Arena Barber'}</h3>
                                    <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-2 tracking-widest ${app.status === 'CONFIRMED' || app.status === 'IN_SERVICE' ? 'bg-green-500 text-white animate-pulse' : 'bg-yellow-500 text-black'}`}>
                                      {app.status === 'PENDING' ? 'Aguardando Barbeiro' :
                                        app.status === 'PROPOSAL_SENT' ? 'Proposta Recebida' :
                                          app.status === 'CONFIRMED' ? 'Confirmado' :
                                            app.status === 'IN_SERVICE' ? 'Serviço Iniciado' :
                                              app.status === 'PAYMENT' ? 'Aguardando Pagamento' :
                                                'Concluído'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[14px] font-black text-cyan-400 italic">R$ {app.price},00</p>
                                  <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest mt-1">{app.paymentMethod || 'Pix'}</p>
                                </div>
                              </div>

                              {/* SERVICES & SCHEDULE INFO */}
                              <div className="bg-blue-900/40 p-3.5 rounded-2xl mb-4 flex items-center space-x-2 border border-blue-800">
                                <ScissorsIcon size={14} className="text-cyan-400" />
                                <span className="text-[9px] font-black uppercase tracking-wider">{(app.services || []).join(' + ')}</span>
                              </div>

                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-blue-300 mb-6 bg-blue-950/40 px-4 py-3 rounded-xl">
                                <div className="flex items-center space-x-1.5"><Calendar size={12} className="text-cyan-400" /><span>Dia {new Date(app.date).getUTCDate() || 16}</span></div>
                                <div className="flex items-center space-x-1.5"><Clock size={12} className="text-cyan-400" /><span>Às {app.time}</span></div>
                              </div>

                              {/* NEON STEPPER */}
                              <div className="flex items-center justify-between mt-2 mb-6 px-1 relative w-full">
                                {steps.map((st, idx) => {
                                  const isCompleted = idx < currentStepIdx;
                                  const isActive = idx === currentStepIdx;
                                  return (
                                    <div key={st} className="flex flex-col items-center relative z-10">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${isCompleted ? 'bg-cyan-500 text-blue-950' : isActive ? 'bg-green-400 text-blue-950 ring-4 ring-green-400/20 scale-110 animate-pulse' : 'bg-blue-900 text-blue-400'}`}>
                                        {idx + 1}
                                      </div>
                                      <span className={`text-[6px] font-black uppercase mt-1 tracking-tighter ${isActive ? 'text-green-300' : 'text-blue-300'}`}>{stepLabels[idx]}</span>
                                    </div>
                                  );
                                })}
                                <div className="absolute top-[11px] left-3 right-3 h-[2px] bg-blue-900 z-0" />
                                <div className="absolute top-[11px] left-3 right-3 h-[2px] bg-cyan-400 z-0 transition-all" style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 90}%` }} />
                              </div>

                              {/* STATE ACTIONS */}
                              {app.status === 'PENDING' && (
                                <div className="flex flex-col space-y-2">
                                  <p className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider text-center">Aguardando aceite do barbeiro na timeline dele.</p>
                                  <button
                                    onClick={async () => {
                                      if (confirm('Tem certeza de que deseja cancelar este agendamento?')) {
                                        try {
                                          await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                          alert('Agendamento cancelado com sucesso!');
                                          loadClientAppointments();
                                        } catch (e: any) {
                                          alert('Erro ao cancelar: ' + e.message);
                                        }
                                      }
                                    }}
                                    className="w-full py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
                                  >
                                    Cancelar Serviço
                                  </button>
                                </div>
                              )}

                              {app.status === 'PROPOSAL_SENT' && (
                                <div className="flex flex-col space-y-3 bg-blue-950/50 p-4 rounded-3xl border border-blue-800">
                                  <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider text-center">Preço customizado proposto pelo barbeiro: R$ {app.price},00</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.updateAppointmentStatus(app.id, 'CONFIRMED');
                                          alert('Proposta aceita! O agendamento está confirmado.');
                                          loadClientAppointments();
                                        } catch (err: any) {
                                          alert('Erro ao aceitar proposta: ' + err.message);
                                        }
                                      }}
                                      className="py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center space-x-1.5"
                                    >
                                      <Check size={12} /> <span>Aceitar</span>
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                          alert('Proposta recusada.');
                                          loadClientAppointments();
                                        } catch (err: any) {
                                          alert('Erro ao recusar proposta: ' + err.message);
                                        }
                                      }}
                                      className="py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
                                    >
                                      Recusar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {app.status === 'CONFIRMED' && (
                                <div className="flex flex-col space-y-2">
                                  <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider text-center mb-1">Você está a caminho! Dirija-se até a Arena.</p>
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
                                </div>
                              )}

                              {app.status === 'IN_SERVICE' && (
                                <div className="flex flex-col space-y-4 bg-blue-950/40 p-4 rounded-3xl border border-blue-800">
                                  <div className="text-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-ping mr-2" />
                                    <p className="text-[10px] text-green-400 font-black uppercase tracking-wider inline-block">Atendimento em Andamento</p>
                                  </div>
                                  <div className="bg-blue-900/20 p-3 rounded-2xl">
                                    <p className="text-[7px] font-black text-blue-300 uppercase tracking-widest mb-1.5">Comanda de Serviços Activa</p>
                                    <ul className="space-y-1">
                                      {(app.services || []).map((srv: string, i: number) => (
                                        <li key={i} className="text-[9px] font-bold text-white flex items-center space-x-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                          <span>{srv}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-800/40">
                                      <span className="text-[8px] font-black text-blue-300 uppercase">Total Consolidado</span>
                                      <span className="text-xs font-black text-cyan-400">R$ {app.price},00</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      onClick={async () => {
                                        if (confirm('Deseja reportar um problema? Nossa equipe de suporte será notificada.')) {
                                          alert('Problema reportado! Entraremos em contato.');
                                        }
                                      }}
                                      className="py-3 bg-yellow-500/20 text-yellow-400 rounded-xl font-black text-[9px] uppercase tracking-wider border border-yellow-500/20"
                                    >
                                      Reportar Problema
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm('Tem certeza de que deseja cancelar este atendimento em andamento?')) {
                                          try {
                                            await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                            alert('Atendimento cancelado com sucesso.');
                                            loadClientAppointments();
                                          } catch (e: any) {
                                            alert('Erro ao cancelar: ' + e.message);
                                          }
                                        }
                                      }}
                                      className="py-3 bg-red-500/20 text-red-400 rounded-xl font-black text-[9px] uppercase tracking-wider border border-red-500/20"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {app.status === 'PAYMENT' && (
                                <div className="flex flex-col space-y-4 bg-blue-950/50 p-4 rounded-3xl border border-blue-800">
                                  <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider text-center">Fase de Pagamento Ativa</p>
                                  <div className="bg-white text-blue-950 p-4 rounded-2xl text-center flex flex-col items-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 mb-2">
                                      <Zap size={48} className="text-cyan-500 animate-pulse" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase text-blue-950">Chave Pix Copia e Cola:</p>
                                    <code className="text-[7px] font-mono bg-gray-50 p-1.5 rounded border border-gray-100 block w-full select-all overflow-x-auto whitespace-nowrap mt-1 text-gray-500">00020126360014BR.GOV.BCB.PIX0114battlebarberpix</code>
                                    <span className="text-[7px] font-bold text-gray-400 mt-1">Clique acima para copiar</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      alert('Pagamento enviado! Aguardando o barbeiro confirmar o recebimento na tela dele.');
                                    }}
                                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                                  >
                                    <Check size={14} /> <span>Já realizei o pagamento</span>
                                  </button>
                                </div>
                              )}

                              {app.status === 'COMPLETED' && (
                                <div className="flex flex-col space-y-4 bg-blue-950/60 p-5 rounded-3xl border border-blue-800 text-center">
                                  <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Atendimento Concluído com Sucesso!</p>

                                  {barberRatings[app.id] ? (
                                    <div className="py-2">
                                      <p className="text-[9px] text-cyan-400 font-black uppercase">Avaliação enviada com sucesso!</p>
                                      <div className="flex justify-center space-x-1 mt-1.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star key={i} size={14} className={i < barberRatings[app.id] ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-2">
                                      <p className="text-[9px] text-blue-200 font-black uppercase">Avalie o atendimento do Barbeiro:</p>
                                      <div className="flex justify-center space-x-2 mt-3">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                          const ratingValue = i + 1;
                                          return (
                                            <button
                                              key={i}
                                              onClick={() => {
                                                setBarberRatings(prev => ({ ...prev, [app.id]: ratingValue }));
                                                alert(`Muito obrigado! Você avaliou este atendimento com ${ratingValue} estrelas.`);
                                              }}
                                              className="transition-transform active:scale-125"
                                            >
                                              <Star size={24} className="text-gray-500 hover:text-yellow-400 hover:fill-yellow-400" />
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            </motion.div>
                          );
                        })}
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
                                {pendingRequests.length > 0 ? <span className="font-black text-xs">{pendingRequests.length}</span> : isMyBooking ? <User size={20} /> : slot.status === 'occupied' ? <User size={18} /> : slot.status === 'radar' ? <Zap size={18} fill="white" /> : slot.status === 'blocked' ? <ShieldOff size={18} /> : <Plus size={18} />}
                              </div>
                              <div>
                                <h4 className={`text-[12px] font-black uppercase tracking-tight ${isMyBooking ? 'text-white' : (slot.status === 'empty' && pendingRequests.length === 0 ? 'text-gray-300' : 'text-blue-950')}`}>
                                  {pendingRequests.length > 1 ? `${pendingRequests.length} SOLICITAÇÕES` : (pendingRequests.length === 1 ? 'NOVA SOLICITAÇÃO' : (isMyBooking ? `Batalha c/ ${slot.client_name}` : slot.client_name))}
                                </h4>
                                <div className="flex items-center space-x-2 mt-0.5 flex-wrap gap-y-1">
                                  <p className={`text-[9px] font-black uppercase tracking-widest ${isMyBooking ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {pendingRequests.length > 0 ? 'Candidatos em espera' : (slot.services?.length ? `${slot.services.join(' + ')} • R$ ${slot.price},00` : slot.status)}
                                  </p>
                                  {isBarberView && slot.appointment && (
                                    <span className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-wider ${
                                      slot.appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                      slot.appointment.status === 'PROPOSAL_SENT' ? 'bg-blue-100 text-blue-600' :
                                      slot.appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-600 animate-pulse' :
                                      slot.appointment.status === 'IN_SERVICE' ? 'bg-cyan-500 text-white animate-pulse' :
                                      slot.appointment.status === 'PAYMENT' ? 'bg-orange-500 text-white animate-pulse' :
                                      slot.appointment.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' :
                                      'bg-red-100 text-red-500'
                                    }`}>
                                      {slot.appointment.status === 'PENDING' ? 'Pendente' :
                                       slot.appointment.status === 'PROPOSAL_SENT' ? 'Proposta' :
                                       slot.appointment.status === 'CONFIRMED' ? 'Confirmado' :
                                       slot.appointment.status === 'IN_SERVICE' ? 'Em Atendimento' :
                                       slot.appointment.status === 'PAYMENT' ? 'Aguardando Pagamento' :
                                       slot.appointment.status === 'COMPLETED' ? 'Concluído' :
                                       'Cancelado'}
                                    </span>
                                  )}
                                </div>
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
            </>
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
                          <ScissorsIcon size={14} className="text-blue-500" /><span className="text-[9px] font-black text-blue-950 uppercase">{req.services.join(' + ')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleAcceptRequest(req)} className="py-4 bg-blue-600 text-white rounded-[20px] font-black text-[9px] uppercase italic tracking-widest shadow-lg flex items-center justify-center space-x-2"><Check size={14} /> <span>Aceitar</span></button>
                          <button onClick={async () => {
                            if (req.appointment?.id) {
                              try {
                                await api.updateAppointmentStatus(req.appointment.id, 'CANCELLED');
                                loadBarberAppointments();
                              } catch (err: any) {
                                console.error('Failed to cancel appointment:', err);
                              }
                            }
                            setMatchSession((prev: any) => ({ ...prev, notifications: prev.notifications.filter((n: any) => n.id !== req.id) }));
                            setSelectedSlot(null);
                          }} className="py-4 bg-white border border-red-50 text-red-500 rounded-[20px] font-black text-[9px] uppercase flex items-center justify-center space-x-2"><X size={14} /> <span>Recusar</span></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedSlot.status === 'occupied' ? (() => {
                const app = selectedSlot.appointment || {
                  id: 'manual',
                  status: 'CONFIRMED',
                  client: { name: selectedSlot.client_name || 'Cliente' },
                  services: selectedSlot.services || ['Corte Manual'],
                  price: selectedSlot.price || 50,
                  date: new Date(2026, 4, selectedDate).toISOString(),
                  time: selectedSlot.time
                };

                const steps = ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'];
                const stepLabels = ['Solicitado', 'Proposta', 'Confirmado', 'Ativo', 'Pagamento', 'Avaliado'];
                const currentStepIdx = steps.indexOf(app.status);

                return (
                  <div className="flex flex-col space-y-4 text-left">
                    <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-1 tracking-widest">Painel do Atendimento</h3>
                    <p className="text-[9px] text-gray-400 font-black uppercase text-center mb-3 tracking-widest">Dia {selectedDate} às {selectedSlot.time}</p>

                    {/* STEPPER */}
                    <div className="flex items-center justify-between mt-2 mb-6 px-1 relative w-full">
                      {steps.map((st, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isActive = idx === currentStepIdx;
                        return (
                          <div key={st} className="flex flex-col items-center relative z-10">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black transition-all ${isCompleted ? 'bg-blue-600 text-white' : isActive ? 'bg-green-500 text-white ring-4 ring-green-500/20 scale-110 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                              {idx + 1}
                            </div>
                            <span className={`text-[5px] font-black uppercase mt-1 tracking-tighter ${isActive ? 'text-green-600' : 'text-gray-400'}`}>{stepLabels[idx]}</span>
                          </div>
                        );
                      })}
                      <div className="absolute top-[9px] left-3 right-3 h-[1px] bg-gray-100 z-0" />
                      <div className="absolute top-[9px] left-3 right-3 h-[1px] bg-blue-600 z-0 transition-all" style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 90}%` }} />
                    </div>

                    {/* CARD CLIENT DETAILS */}
                    <div className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 mb-2 text-left">
                      <div className="flex items-center space-x-3 mb-4">
                        <img src={app.client?.avatar || 'https://i.pravatar.cc/150'} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover" />
                        <div>
                          <p className="text-xs font-black text-blue-950 uppercase italic leading-none">{app.client?.name || selectedSlot.client_name}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest mt-1 block ${app.status === 'CONFIRMED' || app.status === 'IN_SERVICE' ? 'text-green-600' : 'text-gray-400'}`}>
                            {app.status === 'PENDING' ? 'Aguardando Aceite' :
                              app.status === 'PROPOSAL_SENT' ? 'Proposta Enviada' :
                                app.status === 'CONFIRMED' ? 'Confirmado' :
                                  app.status === 'IN_SERVICE' ? 'Atendimento Ativo' :
                                    app.status === 'PAYMENT' ? 'Faturamento / Pix' :
                                      'Finalizado'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl mb-4 border border-gray-100">
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Serviços Contratados</p>
                        <div className="flex flex-wrap gap-1">
                          {(app.services || []).map((srv: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-50 text-blue-950 rounded-lg text-[9px] font-black uppercase border border-gray-100 flex items-center space-x-1">
                              <ScissorsIcon size={10} className="text-blue-500" />
                              <span>{srv}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-[9px] font-black text-gray-400 uppercase">Preço Acordado</span>
                        <span className="text-lg font-black text-blue-600">R$ {app.price},00</span>
                      </div>
                    </div>

                    {/* ACTIONS BY STEP */}
                    {app.status === 'PENDING' && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(app.id, 'CONFIRMED');
                              alert('Agendamento confirmado!');
                              loadBarberAppointments();
                              setSelectedSlot(null);
                            } catch (err: any) {
                              alert('Erro ao confirmar: ' + err.message);
                            }
                          }}
                          className="py-4 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase italic flex items-center justify-center space-x-2 shadow-lg"
                        >
                          <Check size={14} /> <span>Confirmar</span>
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(app.id, 'CANCELLED');
                              alert('Agendamento recusado.');
                              loadBarberAppointments();
                              setSelectedSlot(null);
                            } catch (err: any) {
                              alert('Erro: ' + err.message);
                            }
                          }}
                          className="py-4 bg-red-50 text-red-500 rounded-[24px] font-black text-xs uppercase flex items-center justify-center border border-red-100"
                        >
                          Recusar
                        </button>
                      </div>
                    )}

                    {app.status === 'PROPOSAL_SENT' && (
                      <div className="flex flex-col space-y-2">
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider text-center bg-blue-50 py-3 rounded-2xl">Proposta de R$ {app.price},00 enviada ao cliente. Aguardando aceitação.</p>
                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza de que deseja cancelar este agendamento?')) {
                              try {
                                await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                alert('Agendamento cancelado.');
                                loadBarberAppointments();
                                setSelectedSlot(null);
                              } catch (err: any) {
                                alert('Erro: ' + err.message);
                              }
                            }
                          }}
                          className="w-full py-4 bg-red-50 text-red-500 rounded-[24px] font-black text-xs uppercase flex items-center justify-center border border-red-100"
                        >
                          Cancelar Proposta
                        </button>
                      </div>
                    )}

                    {app.status === 'CONFIRMED' && (
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={async () => {
                            try {
                              const appDateObj = new Date(app.date);
                              const todayNum = today; // Use static mock today date

                              if (appDateObj.getUTCDate() !== todayNum) {
                                if (confirm(`Este atendimento está agendado para o Dia ${appDateObj.getUTCDate()} às ${app.time}. Tem certeza de que deseja iniciar o atendimento agora? Isso irá realocar o horário na sua agenda para hoje.`)) {
                                  const todayIso = new Date().toISOString();
                                  const currentHourStr = `${new Date().getHours().toString().padStart(2, '0')}:00`;
                                  await api.updateAppointmentStatus(app.id, 'IN_SERVICE', undefined, undefined, todayIso, currentHourStr);
                                  alert('Horário realocado e atendimento iniciado com sucesso!');
                                  loadBarberAppointments();
                                  setSelectedSlot(null);
                                }
                              } else {
                                await api.updateAppointmentStatus(app.id, 'IN_SERVICE');
                                alert('Atendimento iniciado com sucesso!');
                                loadBarberAppointments();
                                setSelectedSlot(null);
                              }
                            } catch (err: any) {
                              alert('Erro ao iniciar atendimento: ' + err.message);
                            }
                          }}
                          className="w-full py-6 bg-green-500 hover:bg-green-600 text-white rounded-[30px] font-black text-sm uppercase italic shadow-xl flex items-center justify-center space-x-3 transition-all active:scale-95"
                        >
                          <Zap size={20} fill="white" /> <span>Iniciar Atendimento</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza de que deseja cancelar este agendamento?')) {
                              try {
                                await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                alert('Agendamento cancelado com sucesso!');
                                loadBarberAppointments();
                                setSelectedSlot(null);
                              } catch (e: any) {
                                alert('Erro ao cancelar: ' + e.message);
                              }
                            }
                          }}
                          className="w-full py-5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-[30px] font-black text-xs uppercase flex items-center justify-center space-x-3 transition-all active:scale-95"
                        >
                          Cancelar Atendimento
                        </button>
                      </div>
                    )}

                    {app.status === 'IN_SERVICE' && (
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(app.id, 'PAYMENT');
                              alert('Serviço finalizado! O cliente agora pode ver os dados de pagamento na agenda dele.');
                              loadBarberAppointments();
                              setSelectedSlot(null);
                            } catch (err: any) {
                              alert('Erro ao finalizar serviço: ' + err.message);
                            }
                          }}
                          className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[30px] font-black text-sm uppercase italic shadow-xl flex items-center justify-center space-x-3 transition-all active:scale-95"
                        >
                          <Check size={20} /> <span>Finalizar Serviço (Cobrar)</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza de que deseja cancelar este atendimento em andamento?')) {
                              try {
                                await api.updateAppointmentStatus(app.id, 'CANCELLED');
                                alert('Atendimento cancelado.');
                                loadBarberAppointments();
                                setSelectedSlot(null);
                              } catch (e: any) {
                                alert('Erro ao cancelar: ' + e.message);
                              }
                            }
                          }}
                          className="w-full py-4 bg-red-50 text-red-500 border border-red-100 rounded-[30px] font-black text-xs uppercase flex items-center justify-center transition-all active:scale-95"
                        >
                          Cancelar Atendimento
                        </button>
                      </div>
                    )}

                    {app.status === 'PAYMENT' && (
                      <div className="flex flex-col space-y-3 text-center">
                        <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider bg-yellow-50 py-3 rounded-2xl">Aguardando o cliente realizar o pagamento Pix e confirmar.</p>
                        <button
                          onClick={async () => {
                            try {
                              await api.updateAppointmentStatus(app.id, 'COMPLETED');
                              alert('Pagamento confirmado e atendimento finalizado com sucesso!');
                              loadBarberAppointments();
                              setSelectedSlot(null);
                            } catch (err: any) {
                              alert('Erro ao confirmar pagamento: ' + err.message);
                            }
                          }}
                          className="w-full py-6 bg-green-500 hover:bg-green-600 text-white rounded-[30px] font-black text-sm uppercase italic shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
                        >
                          <Check size={20} /> <span>Confirmar Pagamento Recebido</span>
                        </button>
                      </div>
                    )}

                    {app.status === 'COMPLETED' && (
                      <div className="flex flex-col space-y-4 text-center">
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 py-3 rounded-2xl">Serviço Concluído!</p>

                        {clientRatings[app.id] ? (
                          <div className="py-2 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-[9px] text-blue-950 font-black uppercase">Você avaliou este cliente com:</p>
                            <div className="flex justify-center space-x-1 mt-1.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={14} className={i < clientRatings[app.id] ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-[9px] text-blue-950 font-black uppercase">Avalie o perfil deste Cliente:</p>
                            <div className="flex justify-center space-x-2 mt-3">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const ratingVal = i + 1;
                                return (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      setClientRatings(prev => ({ ...prev, [app.id]: ratingVal }));
                                      alert(`Obrigado! Cliente avaliado com ${ratingVal} estrelas.`);
                                    }}
                                    className="transition-transform active:scale-125"
                                  >
                                    <Star size={24} className="text-gray-300 hover:text-yellow-400 hover:fill-yellow-400" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="flex flex-col space-y-3">
                  <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-10 tracking-widest">Dia {selectedDate} • {selectedSlot.time}</h3>
                  <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'radar', client_name: 'Radar Ativo' })} className="w-full py-7 bg-blue-600 text-white rounded-[30px] font-black text-sm uppercase italic shadow-xl flex items-center justify-center space-x-3"><Zap size={22} className="text-cyan-300" /> <span>Lançar no Radar</span></button>
                  <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'occupied', client_name: 'Reserva Manual', services: ['Corte Manual'], price: 50 })} className="w-full py-6 bg-gray-900 text-white rounded-[30px] font-black text-xs uppercase flex items-center justify-center space-x-3"><Plus size={20} /> <span>Agendar Manual</span></button>
                  <button onClick={() => updateGlobalAgenda(selectedDate, selectedSlot.time, { status: 'blocked', client_name: 'Bloqueado' })} className="w-full py-6 bg-gray-100 text-gray-400 rounded-[30px] font-black text-xs uppercase flex items-center justify-center space-x-3"><ShieldOff size={20} /> <span>Bloquear Agenda</span></button>
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
                      <button onClick={() => handleAcceptRequest(n)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-50"><Check size={20} /></button>
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
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black text-sm text-blue-950 outline-none" 
                    value={hoursConfigStart}
                    onChange={(e) => setHoursConfigStart(e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Fim</p>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-black text-sm text-blue-950 outline-none" 
                    value={hoursConfigEnd}
                    onChange={(e) => setHoursConfigEnd(e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={() => { setWorkingHours(selectedDate, hoursConfigStart, hoursConfigEnd); setShowHoursConfig(false); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Salvar Turno</button>
              <button onClick={() => setShowHoursConfig(false)} className="w-full py-4 text-gray-300 font-black text-[9px] uppercase mt-2 text-center w-full">Cancelar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING POPUP TOAST ALERT */}
      <AnimatePresence>
        {activePopupNotification && (
          <motion.div 
            initial={{ y: -100, x: "-50%", opacity: 0 }} 
            animate={{ y: 24, x: "-50%", opacity: 1 }} 
            exit={{ y: -100, x: "-50%", opacity: 0 }} 
            className="fixed top-0 left-1/2 w-full max-w-sm z-[9000] px-4 cursor-pointer"
            onClick={() => handleNotificationClick(activePopupNotification)}
          >
            <div className="bg-blue-950/95 text-white p-5 rounded-[32px] border border-blue-800 shadow-2xl flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center space-x-3 text-left min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  activePopupNotification.type === 'pending' ? 'bg-yellow-400 text-white animate-pulse' :
                  activePopupNotification.type === 'confirmed' ? 'bg-green-500 text-white' :
                  activePopupNotification.type === 'cancelled' ? 'bg-red-500 text-white' :
                  activePopupNotification.type === 'inservice' ? 'bg-cyan-500 text-white' :
                  activePopupNotification.type === 'payment' ? 'bg-orange-500 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {activePopupNotification.type === 'pending' || activePopupNotification.type === 'proposal' ? (
                    <Zap size={16} fill={activePopupNotification.type === 'pending' ? 'white' : 'transparent'} />
                  ) : activePopupNotification.type === 'confirmed' ? (
                    <Check size={16} />
                  ) : activePopupNotification.type === 'cancelled' ? (
                    <X size={16} />
                  ) : activePopupNotification.type === 'inservice' ? (
                    <Clock size={16} />
                  ) : (
                    <Star size={16} fill="white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                    {activePopupNotification.title}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-200 uppercase tracking-tight truncate">
                    {activePopupNotification.message}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopupNotification(null);
                }} 
                className="p-2 text-gray-400 hover:text-white shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
