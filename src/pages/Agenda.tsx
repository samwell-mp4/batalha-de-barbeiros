import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, ChevronLeft, Plus, X, Zap, Bell, ShieldOff, Check, Scissors as ScissorsIcon, Star, Settings, Calendar, CalendarDays, Clock, Navigation, Trash2, Filter, Share2, QrCode, Copy, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const getDatesRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const end = new Date(Date.UTC(2026, 11, 31)); // Dec 31, 2026
  const arr = [];
  const dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setUTCDate(dt.getUTCDate() + 1);
  }
  return arr;
};

const getUTCDateString = (d: Date) => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthLabel = (d: Date) => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const getWeekRangeLabel = (d: Date) => {
  const current = new Date(d);
  const day = current.getUTCDay();
  const diffToSunday = current.getUTCDate() - day;
  const sunday = new Date(current);
  sunday.setUTCDate(diffToSunday);
  
  const saturday = new Date(sunday);
  saturday.setUTCDate(sunday.getUTCDate() + 6);
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const format = (date: Date) => `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}`;
  return `Semana de ${format(sunday)} a ${format(saturday)}`;
};

export default function Agenda() {
  const context = useOutletContext<{ isBarberView: boolean, matchSession: any, setMatchSession: (s: any) => void }>() || { isBarberView: true, matchSession: {}, setMatchSession: () => { } };
  const { isBarberView, matchSession, setMatchSession } = context;
  const navigate = useNavigate(); console.log(navigate);

  const today = getUTCDateString(new Date());
  const currentHour = new Date().getHours();

  const [selectedDate, setSelectedDate] = useState(() => getUTCDateString(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthLabel(new Date()));
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

  // Estados para Paginação e Filtros Inteligentes
  const [financeiroSearch, setFinanceiroSearch] = useState('');
  const [financeiroStatus, setFinanceiroStatus] = useState('ALL');
  const [financeiroDate, setFinanceiroDate] = useState('ALL');
  const [financeiroSort, setFinanceiroSort] = useState('date-desc');
  const [financeiroPage, setFinanceiroPage] = useState(1);
  const pageSizeFinanceiro = 5;

  const [financeiroPeriod, setFinanceiroPeriod] = useState('ALL');
  const [financeiroService, setFinanceiroService] = useState('ALL');
  const [financeiroPrice, setFinanceiroPrice] = useState('ALL');
  const [financeiroType, setFinanceiroType] = useState('ALL');

  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'OCCUPIED' | 'FREE' | 'RADAR' | 'BLOCKED'>('ALL');

  const [clientActiveSearch, setClientActiveSearch] = useState('');
  const [clientActivePage, setClientActivePage] = useState(1);
  const pageSizeClientActive = 3;

  const [clientHistorySearch, setClientHistorySearch] = useState('');
  const [clientHistoryPage, setClientHistoryPage] = useState(1);
  const pageSizeClientHistory = 3;

  const globalAgenda = matchSession.globalAgenda || {};
  const barberKeyPrefix = user?.barberProfile?.id || user?.id || 'default';
  const notifications = matchSession.notifications || [];

  const allApps = useMemo(() => {
    return isBarberView
      ? [...barberAppointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [barberAppointments, appointments, isBarberView]);

  // Filtros inteligentes e ordenação para a aba Financeiro
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    allApps.forEach(app => {
      (app.services || []).forEach((s: string) => services.add(s));
    });
    return Array.from(services).sort();
  }, [allApps]);

  // Filtros inteligentes e ordenação para a aba Financeiro
  const filteredAllApps = useMemo(() => {
    let result = [...allApps];

    // 1. Busca por texto (Cliente, Barbeiro ou Serviços)
    if (financeiroSearch.trim()) {
      const query = financeiroSearch.toLowerCase();
      result = result.filter(app => {
        const clientName = (app.client?.name || '').toLowerCase();
        const barberName = (app.barber?.user?.name || app.barber?.name || '').toLowerCase();
        const services = (app.services || []).join(' ').toLowerCase();
        return clientName.includes(query) || barberName.includes(query) || services.includes(query);
      });
    }

    // 2. Filtro de Status
    if (financeiroStatus !== 'ALL') {
      result = result.filter(app => app.status === financeiroStatus);
    }

    // 3. Filtro de Data
    if (financeiroDate !== 'ALL') {
      result = result.filter(app => {
        const appDate = new Date(app.date);
        return getUTCDateString(appDate) === financeiroDate;
      });
    }

    // 4. Filtro de Período (Hoje, Essa Semana, Esse Mês)
    if (financeiroPeriod !== 'ALL') {
      const now = new Date();
      const todayStr = getUTCDateString(now);
      result = result.filter(app => {
        const appDate = new Date(app.date);
        const appDateStr = getUTCDateString(appDate);
        if (financeiroPeriod === 'TODAY') {
          return appDateStr === todayStr;
        }
        if (financeiroPeriod === 'WEEK') {
          return getWeekRangeLabel(appDate) === getWeekRangeLabel(now);
        }
        if (financeiroPeriod === 'MONTH') {
          return appDate.getUTCMonth() === now.getUTCMonth() && appDate.getUTCFullYear() === now.getUTCFullYear();
        }
        return true;
      });
    }

    // 5. Filtro de Serviço
    if (financeiroService !== 'ALL') {
      result = result.filter(app => {
        const services = (app.services || []).map((s: string) => s.toLowerCase());
        return services.includes(financeiroService.toLowerCase());
      });
    }

    // 6. Filtro de Faixa de Preço
    if (financeiroPrice !== 'ALL') {
      result = result.filter(app => {
        const price = app.price || 0;
        if (financeiroPrice === 'UP_TO_50') return price <= 50;
        if (financeiroPrice === '50_TO_100') return price > 50 && price <= 100;
        if (financeiroPrice === 'ABOVE_100') return price > 100;
        return true;
      });
    }

    // 7. Filtro de Tipo de Chamada (Padrão, Express, Fila)
    if (financeiroType !== 'ALL') {
      result = result.filter(app => {
        const isQueue = app.barber?.name === 'Arena Aberta' || app.barber?.name === 'Abrir Minha Agenda' || app.barberName === 'Arena Aberta' || app.barberName === 'Abrir Minha Agenda';
        const isRadar = app.status === 'RADAR' || app.client_name === 'Radar Ativo';
        if (financeiroType === 'QUEUE') return isQueue;
        if (financeiroType === 'EXPRESS') return isRadar;
        if (financeiroType === 'STANDARD') return !isQueue && !isRadar;
        return true;
      });
    }

    // 8. Ordenação
    result.sort((a, b) => {
      if (financeiroSort === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (financeiroSort === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (financeiroSort === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      } else if (financeiroSort === 'price-asc') {
        return (a.price || 0) - (b.price || 0);
      }
      return 0;
    });

    return result;
  }, [allApps, financeiroSearch, financeiroStatus, financeiroDate, financeiroPeriod, financeiroService, financeiroPrice, financeiroType, financeiroSort]);

  const paginatedAllApps = useMemo(() => {
    const startIndex = (financeiroPage - 1) * pageSizeFinanceiro;
    return filteredAllApps.slice(startIndex, startIndex + pageSizeFinanceiro);
  }, [filteredAllApps, financeiroPage]);

  const totalPagesFinanceiro = useMemo(() => {
    return Math.ceil(filteredAllApps.length / pageSizeFinanceiro) || 1;
  }, [filteredAllApps.length]);

  // Lista dinâmica de datas únicas dos agendamentos
  const uniqueDates = useMemo(() => {
    const dates = allApps.map(app => {
      const appDate = new Date(app.date);
      return getUTCDateString(appDate);
    });
    return Array.from(new Set(dates)).sort((a, b) => a.localeCompare(b));
  }, [allApps]);

  // Resetar página do financeiro ao mudar os filtros
  useEffect(() => {
    setFinanceiroPage(1);
  }, [financeiroSearch, financeiroStatus, financeiroDate, financeiroPeriod, financeiroService, financeiroPrice, financeiroType, financeiroSort]);

  // Filtragem e paginação das Batalhas Próximas (Cliente)
  const clientActiveAppsFiltered = useMemo(() => {
    let result = appointments.filter((a: any) => ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'].includes(a.status));
    
    if (clientActiveSearch.trim()) {
      const query = clientActiveSearch.toLowerCase();
      result = result.filter(app => {
        const barberName = (app.barber?.user?.name || app.barber?.name || '').toLowerCase();
        const services = (app.services || []).join(' ').toLowerCase();
        return barberName.includes(query) || services.includes(query);
      });
    }
    
    return result;
  }, [appointments, clientActiveSearch]);

  const paginatedClientActiveApps = useMemo(() => {
    const startIndex = (clientActivePage - 1) * pageSizeClientActive;
    return clientActiveAppsFiltered.slice(startIndex, startIndex + pageSizeClientActive);
  }, [clientActiveAppsFiltered, clientActivePage]);

  const totalPagesClientActive = useMemo(() => {
    return Math.ceil(clientActiveAppsFiltered.length / pageSizeClientActive) || 1;
  }, [clientActiveAppsFiltered.length]);

  useEffect(() => {
    setClientActivePage(1);
  }, [clientActiveSearch]);

  // Filtragem e paginação do Histórico de Batalhas (Cliente)
  const clientHistoryAppsFiltered = useMemo(() => {
    let result = appointments.filter((a: any) => a.status === 'COMPLETED' || a.status === 'CANCELLED');
    
    if (clientHistorySearch.trim()) {
      const query = clientHistorySearch.toLowerCase();
      result = result.filter(app => {
        const barberName = (app.barber?.user?.name || app.barber?.name || '').toLowerCase();
        const services = (app.services || []).join(' ').toLowerCase();
        return barberName.includes(query) || services.includes(query);
      });
    }
    
    return result;
  }, [appointments, clientHistorySearch]);

  const paginatedClientHistoryApps = useMemo(() => {
    const startIndex = (clientHistoryPage - 1) * pageSizeClientHistory;
    return clientHistoryAppsFiltered.slice(startIndex, startIndex + pageSizeClientHistory);
  }, [clientHistoryAppsFiltered, clientHistoryPage]);

  const totalPagesClientHistory = useMemo(() => {
    return Math.ceil(clientHistoryAppsFiltered.length / pageSizeClientHistory) || 1;
  }, [clientHistoryAppsFiltered.length]);

  useEffect(() => {
    setClientHistoryPage(1);
  }, [clientHistorySearch]);

  // Log derivado em tempo real de todas as notificações de status para ambos (Cliente e Barbeiro)
  const notificationsList = useMemo(() => {
    const list: any[] = [];
    const sourceApps = isBarberView ? barberAppointments : appointments;

    sourceApps.forEach((app: any) => {
      const appDate = new Date(app.date);
      const dayStr = `${String(appDate.getUTCDate()).padStart(2, '0')}/${String(appDate.getUTCMonth() + 1).padStart(2, '0')}/${appDate.getUTCFullYear()}`;
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
      const dayStr = getUTCDateString(appDate);
      
      // 1. Alterna para a aba de Agenda
      setActiveTab('agenda');
      
      // 2. Seleciona o dia correto
      setSelectedDate(dayStr);
      setSelectedMonth(getMonthLabel(appDate));
      
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

  const handleClearHistory = async () => {
    if (confirm('Deseja limpar todos os agendamentos concluídos e cancelados do histórico? Esta ação é irreversível.')) {
      try {
        await api.clearHistory(user.id);
        alert('Histórico de agendamentos limpo com sucesso!');
        loadClientAppointments();
        loadBarberAppointments();
      } catch (e: any) {
        alert('Erro ao limpar histórico: ' + e.message);
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

  const updateGlobalAgenda = (date: string, time: string, data: any) => {
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
    const todayStr = getUTCDateString(new Date());

    return hours24.filter((_, i) => i >= startIdx && i <= endIdx).map(time => {
      const h = parseInt(time.split(':')[0]);
      if (selectedDate === todayStr && h < currentHour) return null;

      // Find DB Appointment matching this specific day & hour slot
      const dbApp = barberAppointments.find((a: any) => {
        const appDate = new Date(a.date);
        const appDateStr = getUTCDateString(appDate);
        return appDateStr === selectedDate && a.time === time && ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'].includes(a.status);
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
    }).filter(Boolean).filter((slot: any) => {
      if (!slot) return false;
      if (timelineFilter === 'ALL') return true;
      if (timelineFilter === 'OCCUPIED') return slot.status === 'occupied';
      if (timelineFilter === 'FREE') return slot.status === 'empty';
      if (timelineFilter === 'RADAR') return slot.status === 'radar';
      if (timelineFilter === 'BLOCKED') return slot.status === 'blocked';
      return true;
    });
  }, [selectedDate, globalAgenda, hours24, currentHour, barberAppointments, user?.id, timelineFilter]);

  const handleAcceptRequest = (notif: any) => {
    updateGlobalAgenda(notif.date, notif.time, { status: 'occupied', client_name: notif.client, services: notif.services, price: notif.price, isMyBooking: true });
    setShowNotifications(false);
    setSelectedSlot(null);
  };

  const setWorkingHours = (date: string, start: string, end: string) => {
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
              {isBarberView && user?.barberProfile?.id && (
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/profile/${user.barberProfile.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link da sua agenda copiado para a área de transferência!');
                  }}
                  className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl border border-blue-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                  title="Compartilhar Link da Agenda"
                >
                  <Share2 size={20} />
                </button>
              )}
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
            <div className="flex flex-col space-y-3 mb-6">
              {/* MONTH SELECTION DROPDOWN WITH CALENDAR ICON */}
              <div className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-[25px] border border-gray-100 relative">
                <div className="flex items-center space-x-2 pl-3">
                  <CalendarDays size={14} className="text-blue-600" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mês</span>
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    const firstDayInMonth = getDatesRange().find(d => getMonthLabel(d) === e.target.value);
                    if (firstDayInMonth) {
                      setSelectedDate(getUTCDateString(firstDayInMonth));
                    }
                  }}
                  className="bg-transparent font-black text-xs text-blue-950 outline-none uppercase text-right pr-6 appearance-none cursor-pointer"
                >
                  {Array.from(new Set(getDatesRange().map(d => getMonthLabel(d)))).map(monthLabel => (
                    <option key={monthLabel} value={monthLabel}>{monthLabel}</option>
                  ))}
                </select>
                <div className="absolute right-4 pointer-events-none text-gray-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {/* HORIZONTAL DATE SLIDER */}
              <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-[30px] border border-gray-100">
                <button className="p-2 text-gray-300"><ChevronLeft size={20} /></button>
                <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
                  {getDatesRange()
                    .filter(d => getMonthLabel(d) === selectedMonth)
                    .map(dayObj => {
                      const dayStr = getUTCDateString(dayObj);
                      const isToday = dayStr === getUTCDateString(new Date());
                      const weekdaysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      const weekdayLabel = weekdaysMap[dayObj.getUTCDay()];
                      const monthName = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][dayObj.getUTCMonth()];
                      const dayNum = dayObj.getUTCDate();
                      const key = `${barberKeyPrefix}_${dayStr}`;

                      return (
                        <button key={dayStr} onClick={() => setSelectedDate(dayStr)} className={`min-w-[50px] py-4 rounded-[22px] flex flex-col items-center transition-all relative ${selectedDate === dayStr ? 'bg-blue-600 text-white shadow-xl scale-110' : 'text-gray-400'}`}>
                          <span className="text-[7px] font-black uppercase mb-1">{isToday ? 'Hoje' : weekdayLabel}</span>
                          <span className="text-sm font-black">{dayNum}</span>
                          <span className="text-[6px] font-bold uppercase opacity-80 mt-0.5">{monthName}</span>
                          {(globalAgenda[key]?.slots?.length > 0) && <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${selectedDate === dayStr ? 'bg-white' : 'bg-blue-600'}`} />}
                        </button>
                      );
                    })}
                </div>
                <button className="p-2 text-gray-300"><ChevronRight size={20} /></button>
              </div>

              {/* TIMELINE SLOTS FILTER */}
              <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-[25px] border border-gray-100">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-3 flex items-center"><Filter size={10} className="mr-1.5 text-blue-500" /> Filtrar Slots</span>
                <select
                  value={timelineFilter}
                  onChange={(e) => setTimelineFilter(e.target.value as any)}
                  className="bg-transparent font-black text-xs text-blue-950 outline-none uppercase text-right pr-3"
                >
                  <option value="ALL">Todos os slots</option>
                  <option value="OCCUPIED">Apenas Ocupados</option>
                  <option value="FREE">Apenas Livres</option>
                  <option value="RADAR">Apenas Radar</option>
                  <option value="BLOCKED">Apenas Bloqueados</option>
                </select>
              </div>
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
              {/* SMART FILTERS SECTION */}
              <div className="bg-white border border-gray-150 p-5 rounded-[28px] shadow-sm mb-4 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isBarberView ? "Buscar cliente ou serviço..." : "Buscar barbeiro ou serviço..."}
                    value={financeiroSearch}
                    onChange={(e) => setFinanceiroSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950 placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Filtrar por Status</label>
                    <select
                      value={financeiroStatus}
                      onChange={(e) => setFinanceiroStatus(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="ALL">Todos os Status</option>
                      <option value="PENDING">Pendente</option>
                      <option value="PROPOSAL_SENT">Proposta</option>
                      <option value="CONFIRMED">Confirmado</option>
                      <option value="IN_SERVICE">Em Andamento</option>
                      <option value="PAYMENT">Pagamento</option>
                      <option value="COMPLETED">Finalizado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Filtrar por Data</label>
                    <select
                      value={financeiroDate}
                      onChange={(e) => setFinanceiroDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="ALL">Todas as Datas</option>
                      {uniqueDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(`${date}T00:00:00.000Z`).toLocaleDateString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Período</label>
                    <select
                      value={financeiroPeriod}
                      onChange={(e) => setFinanceiroPeriod(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="ALL">Qualquer Período</option>
                      <option value="TODAY">Hoje</option>
                      <option value="WEEK">Esta Semana</option>
                      <option value="MONTH">Este Mês</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Serviço</label>
                    <select
                      value={financeiroService}
                      onChange={(e) => setFinanceiroService(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="ALL">Todos os Serviços</option>
                      {uniqueServices.map(srv => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Faixa de Preço</label>
                    <select
                      value={financeiroPrice}
                      onChange={(e) => setFinanceiroPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="ALL">Qualquer Preço</option>
                      <option value="UP_TO_50">Até R$ 50</option>
                      <option value="50_TO_100">R$ 51 a R$ 100</option>
                      <option value="ABOVE_100">Acima de R$ 100</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Tipo de Chamada</label>
                    <select
                      value={financeiroType}
                      onChange={(e) => setFinanceiroType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="ALL">Todos os Tipos</option>
                      <option value="STANDARD">Padrão (Agenda)</option>
                      <option value="EXPRESS">Express (Radar)</option>
                      <option value="QUEUE">Fila (Arena Aberta)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Ordenar por</label>
                    <select
                      value={financeiroSort}
                      onChange={(e) => setFinanceiroSort(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-[9px] font-bold text-blue-950 focus:outline-none"
                    >
                      <option value="date-desc">Mais Recentes</option>
                      <option value="date-asc">Mais Antigos</option>
                      <option value="price-desc">Preço: Maior</option>
                      <option value="price-asc">Preço: Menor</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleClearHistory}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[9px] font-black uppercase border border-red-100 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                    >
                      <Trash2 size={12} />
                      <span>Limpar Histórico</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white border border-gray-150 p-5 rounded-[28px] shadow-sm text-left">
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-1">
                    {isBarberView ? 'Faturamento Real' : 'Despesas Totais'}
                  </span>
                  <p className="text-xl font-black italic text-blue-950">R$ {isBarberView ? faturamentoRealizado : totalGasto},00</p>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest block mt-2">
                    ✓ {completedApps.length} Atendimentos
                  </span>
                </div>
                <div className="bg-white border border-gray-150 p-5 rounded-[28px] shadow-sm text-left">
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-1">
                    {isBarberView ? 'Previsão / Agendado' : 'Agendamentos Pendentes'}
                  </span>
                  <p className="text-xl font-black italic text-blue-950">R$ {isBarberView ? faturamentoPrevisto : totalAgendado},00</p>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest block mt-2">
                    ⧗ {pendingOrConfirmedApps.length} Reservas
                  </span>
                </div>
              </div>

              {/* HISTORICO LIST */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 text-left">Lista de Agendamentos ({filteredAllApps.length})</p>
                {paginatedAllApps.length > 0 ? (
                  paginatedAllApps.map((app: any) => {
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
                      <div key={app.id} className="bg-white border border-gray-100 p-5 rounded-[28px] flex flex-col space-y-4 shadow-sm text-left hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <img
                              src={displayUser?.avatar || 'https://i.pravatar.cc/150'}
                              className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md"
                            />
                            <div>
                              <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{displayUser?.name || 'Luis'}</h4>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 block">
                                Dia {getUTCDateString(appDate).split('-').reverse().join('/')} às {app.time}
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

                {/* PAGINATION CONTROLS */}
                {totalPagesFinanceiro > 1 && (
                  <div className="flex items-center justify-between mt-6 bg-white border border-gray-100 p-3 rounded-[24px] shadow-sm">
                    <button
                      disabled={financeiroPage === 1}
                      onClick={() => setFinanceiroPage(prev => Math.max(prev - 1, 1))}
                      className="px-4 py-2 text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                    >
                      Anterior
                    </button>
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Pág. {financeiroPage} de {totalPagesFinanceiro}
                    </span>
                    <button
                      disabled={financeiroPage === totalPagesFinanceiro}
                      onClick={() => setFinanceiroPage(prev => Math.min(prev + 1, totalPagesFinanceiro))}
                      className="px-4 py-2 text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                    >
                      Próximo
                    </button>
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
                  <div className="mb-8">
                    <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Minhas Próximas Batalhas ({clientActiveAppsFiltered.length})</h2>
                    
                    {/* Active search filter */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Buscar batalhas por barbeiro ou serviço..."
                        value={clientActiveSearch}
                        onChange={(e) => setClientActiveSearch(e.target.value)}
                        className="w-full bg-white border border-gray-150 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950 placeholder-gray-400 shadow-sm"
                      />
                    </div>

                    {paginatedClientActiveApps.length > 0 ? (
                      <div className="space-y-4">
                        {paginatedClientActiveApps.map((app: any) => {
                          const steps = ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'];
                          const stepLabels = ['Solicitado', 'Proposta', 'Confirmado', 'Ativo', 'Pagamento', 'Avaliado'];
                          const currentStepIdx = steps.indexOf(app.status);

                          return (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={app.id} className="bg-white text-blue-950 p-6 rounded-[35px] shadow-md relative overflow-hidden border border-gray-150">
                              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none text-blue-600"><Zap size={100} /></div>

                              {/* HEADER INFO */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-4">
                                  <img src={app.barber?.user?.avatar || `https://i.pravatar.cc/150?u=${app.barber?.id}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />
                                  <div>
                                    <h3 className="text-sm font-black uppercase italic leading-none text-blue-950">{app.barber?.user?.name || 'Arena Barber'}</h3>
                                    <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-2 tracking-widest ${app.status === 'CONFIRMED' || app.status === 'IN_SERVICE' ? 'bg-green-500 text-white animate-pulse' : 'bg-yellow-500 text-white'}`}>
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
                                  <p className="text-[14px] font-black text-blue-600 italic">R$ {app.price},00</p>
                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{app.paymentMethod || 'Pix'}</p>
                                </div>
                              </div>

                              {/* SERVICES & SCHEDULE INFO */}
                              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl mb-4 flex items-center space-x-2">
                                <ScissorsIcon size={14} className="text-blue-500" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-blue-950">{(app.services || []).join(' + ')}</span>
                              </div>

                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-blue-900 mb-6 bg-gray-50/70 border border-gray-100 px-4 py-3 rounded-xl">
                                <div className="flex items-center space-x-1.5"><Calendar size={12} className="text-blue-500" /><span>Dia {new Date(app.date).getUTCDate() || 16}</span></div>
                                <div className="flex items-center space-x-1.5"><Clock size={12} className="text-blue-500" /><span>Às {app.time}</span></div>
                              </div>

                              {/* NEON STEPPER */}
                              <div className="flex items-center justify-between mt-2 mb-6 px-1 relative w-full">
                                {steps.map((st, idx) => {
                                  const isCompleted = idx < currentStepIdx;
                                  const isActive = idx === currentStepIdx;
                                  return (
                                    <div key={st} className="flex flex-col items-center relative z-10">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${isCompleted ? 'bg-blue-600 text-white' : isActive ? 'bg-green-500 text-white ring-4 ring-green-100 scale-110 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                        {idx + 1}
                                      </div>
                                      <span className={`text-[6px] font-black uppercase mt-1 tracking-tighter ${isActive ? 'text-green-600 font-bold' : 'text-gray-400'}`}>{stepLabels[idx]}</span>
                                    </div>
                                  );
                                })}
                                <div className="absolute top-[11px] left-3 right-3 h-[2px] bg-gray-100 z-0" />
                                <div className="absolute top-[11px] left-3 right-3 h-[2px] bg-blue-600 z-0 transition-all" style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 90}%` }} />
                              </div>

                              {/* STATE ACTIONS */}
                              {app.status === 'PENDING' && (
                                <div className="flex flex-col space-y-2">
                                  <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider text-center">Aguardando aceite do barbeiro na timeline dele.</p>
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
                                    className="w-full py-4 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
                                  >
                                    Cancelar Serviço
                                  </button>
                                </div>
                              )}

                              {app.status === 'PROPOSAL_SENT' && (
                                <div className="flex flex-col space-y-3 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider text-center">Preço customizado proposto pelo barbeiro: R$ {app.price},00</p>
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
                                      className="py-4 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
                                    >
                                      Recusar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {app.status === 'CONFIRMED' && (
                                <div className="flex flex-col space-y-2">
                                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider text-center mb-1">Você está a caminho! Dirija-se até a Arena.</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      onClick={() => {
                                        const lat = app.barber?.latitude || -23.525;
                                        const lng = app.barber?.longitude || -46.522;
                                        alert(`Traçando rota até a Arena de ${app.barber?.user?.name || 'Gustavo'}.\nCoordenadas: [${lat}, ${lng}]`);
                                      }}
                                      className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[9px] uppercase italic tracking-widest shadow-md flex items-center justify-center space-x-1.5 active:scale-95 transition-transform"
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
                                      className="py-4 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
                                    >
                                      Cancelar Batalha
                                    </button>
                                  </div>
                                </div>
                              )}

                              {app.status === 'IN_SERVICE' && (
                                <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                  <div className="text-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-ping mr-2" />
                                    <p className="text-[10px] text-green-600 font-black uppercase tracking-wider inline-block">Atendimento em Andamento</p>
                                  </div>
                                  <div className="bg-white border border-gray-100 p-3 rounded-2xl">
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Comanda de Serviços Ativa</p>
                                    <ul className="space-y-1">
                                      {(app.services || []).map((srv: string, i: number) => (
                                        <li key={i} className="text-[9px] font-bold text-blue-950 flex items-center space-x-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                          <span>{srv}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                                      <span className="text-[8px] font-black text-gray-400 uppercase">Total Consolidado</span>
                                      <span className="text-xs font-black text-blue-600">R$ {app.price},00</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      onClick={async () => {
                                        if (confirm('Deseja reportar um problema? Nossa equipe de suporte será notificada.')) {
                                          alert('Problema reportado! Entraremos em contato.');
                                        }
                                      }}
                                      className="py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-xl font-black text-[9px] uppercase tracking-wider border border-yellow-100"
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
                                      className="py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-wider border border-red-100"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {app.status === 'PAYMENT' && (
                                <PaymentPixView appId={app.id} appPrice={app.price} />
                              )}

                              {app.status === 'COMPLETED' && (
                                <div className="flex flex-col space-y-4 bg-gray-50 p-5 rounded-3xl border border-gray-100 text-center">
                                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Atendimento Concluído com Sucesso!</p>

                                  {barberRatings[app.id] ? (
                                    <div className="py-2">
                                      <p className="text-[9px] text-green-600 font-black uppercase font-bold">Avaliação enviada com sucesso!</p>
                                      <div className="flex justify-center space-x-1 mt-1.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star key={i} size={14} className={i < barberRatings[app.id] ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-2">
                                      <p className="text-[9px] text-blue-950 font-black uppercase">Avalie o atendimento do Barbeiro:</p>
                                      <div className="flex justify-center space-x-2 mt-3">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                          const ratingValue = i + 1;
                                          return (
                                            <button
                                              key={i}
                                              onClick={async () => {
                                                setBarberRatings(prev => ({ ...prev, [app.id]: ratingValue }));
                                                if (app.barberId || app?.barber?.id) {
                                                  try {
                                                    await api.rateBarber(app.barberId || app.barber.id, ratingValue);
                                                  } catch(e) { console.error('Failed to submit rating', e); }
                                                }
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

                    {/* Active battles pagination */}
                    {totalPagesClientActive > 1 && (
                      <div className="flex items-center justify-between mt-4 bg-white border border-gray-100 p-2.5 rounded-[20px] shadow-sm">
                        <button
                          disabled={clientActivePage === 1}
                          onClick={() => setClientActivePage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 text-[8px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-lg disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                        >
                          Anterior
                        </button>
                        <span className="text-[9px] font-black uppercase text-gray-400 font-bold">
                          Pág. {clientActivePage} de {totalPagesClientActive}
                        </span>
                        <button
                          disabled={clientActivePage === totalPagesClientActive}
                          onClick={() => setClientActivePage(prev => Math.min(prev + 1, totalPagesClientActive))}
                          className="px-3 py-1.5 text-[8px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-lg disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                        >
                          Próximo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PAST/COMPLETED BOOKINGS */}
                  <div>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Histórico de Batalhas ({clientHistoryAppsFiltered.length})</h2>
                    
                    {/* History search filter */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Buscar histórico por barbeiro ou serviço..."
                        value={clientHistorySearch}
                        onChange={(e) => setClientHistorySearch(e.target.value)}
                        className="w-full bg-white border border-gray-150 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950 placeholder-gray-400 shadow-sm"
                      />
                    </div>

                    {paginatedClientHistoryApps.length > 0 ? (
                      <div className="space-y-3">
                        {paginatedClientHistoryApps.map((app: any) => (
                          <div key={app.id} className="bg-white border border-gray-150 p-5 rounded-[28px] flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3 text-left">
                              <img src={app.barber?.user?.avatar || `https://i.pravatar.cc/150?u=${app.barber?.id}`} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                              <div>
                                <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{app.barber?.user?.name || 'Gustavo'}</h4>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{(app.services || []).join(' + ')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-blue-950">R$ {app.price},00</p>
                              <span className={`inline-block text-[7px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 ${app.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
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

                    {/* History pagination */}
                    {totalPagesClientHistory > 1 && (
                      <div className="flex items-center justify-between mt-4 bg-white border border-gray-100 p-2.5 rounded-[20px] shadow-sm">
                        <button
                          disabled={clientHistoryPage === 1}
                          onClick={() => setClientHistoryPage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 text-[8px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-lg disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                        >
                          Anterior
                        </button>
                        <span className="text-[9px] font-black uppercase text-gray-400 font-bold">
                          Pág. {clientHistoryPage} de {totalPagesClientHistory}
                        </span>
                        <button
                          disabled={clientHistoryPage === totalPagesClientHistory}
                          onClick={() => setClientHistoryPage(prev => Math.min(prev + 1, totalPagesClientHistory))}
                          className="px-3 py-1.5 text-[8px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-lg disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform"
                        >
                          Próximo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* BARBER VIEW TIMELINE */
                <div className="space-y-3 relative pb-20">
                  <div className="absolute left-9 top-0 bottom-0 w-px bg-gray-50 z-0" />
                  {currentTimeSlots.map((slot: any) => {
                    const pendingRequests = notifications.filter((n: any) => n.time === slot.time && n.date === selectedDate && n.status === 'pending' && n.barberName !== 'Arena Aberta' && n.barberName !== 'Abrir Minha Agenda');
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
                  date: new Date(`${selectedDate}T00:00:00.000Z`).toISOString(),
                  time: selectedSlot.time
                };

                const steps = ['PENDING', 'PROPOSAL_SENT', 'CONFIRMED', 'IN_SERVICE', 'PAYMENT', 'COMPLETED'];
                const stepLabels = ['Solicitado', 'Proposta', 'Confirmado', 'Ativo', 'Pagamento', 'Avaliado'];
                const currentStepIdx = steps.indexOf(app.status);

                return (
                  <div className="flex flex-col space-y-4 text-left">
                    <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-1 tracking-widest">Painel do Atendimento</h3>
                    <p className="text-[9px] text-gray-400 font-black uppercase text-center mb-3 tracking-widest">Dia {new Date(`${selectedDate}T00:00:00.000Z`).toLocaleDateString('pt-BR')} às {selectedSlot.time}</p>

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
                              const appDateStr = getUTCDateString(appDateObj);

                              if (appDateStr !== today) {
                                if (confirm(`Este atendimento está agendado para o Dia ${appDateStr.split('-').reverse().join('/')} às ${app.time}. Tem certeza de que deseja iniciar o atendimento agora? Isso irá realocar o horário na sua agenda para hoje.`)) {
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
                        <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider bg-yellow-50 py-3 rounded-2xl">Aguardando pagamento via PIX</p>
                        <p className="text-xs text-gray-500">Valor: R$ {app.price},00 | Taxa: R$ 1,00 | Você recebe: R$ {Math.max(0, (app.price || 0) - 1)},00</p>
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
                  <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-10 tracking-widest">Dia {new Date(`${selectedDate}T00:00:00.000Z`).toLocaleDateString('pt-BR')} • {selectedSlot.time}</h3>
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

function PaymentPixView({ appId, appPrice }: { appId: string; appPrice: number }) {
  const [pixData, setPixData] = useState<{ qrCodeBase64: string; copiaECola: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const generatePix = async () => {
    setLoading(true);
    try {
      const result = await api.createPixPayment(appId);
      if (result.error) {
        alert('Erro ao gerar PIX: ' + result.error);
      } else {
        setPixData({ qrCodeBase64: result.mpQrCodeBase64, copiaECola: result.mpCopiaECola });
      }
    } catch (e: any) {
      alert('Erro ao gerar PIX: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPix = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Código PIX copiado!');
    } catch {
      alert('Clique no código para copiar manualmente');
    }
  };

  return (
    <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider text-center">
        Fase de Pagamento Ativa
      </p>

      {!pixData ? (
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900 mb-1">Total: R$ {appPrice},00</p>
          <p className="text-[9px] text-gray-400 mb-4">Taxa de R$ 1,00 — Barbeiro recebe R$ {Math.max(0, appPrice - 1)},00</p>
          <button
            onClick={generatePix}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-transform"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> <span>Gerando...</span></>
            ) : (
              <><QrCode size={14} /> <span>Pagar com PIX</span></>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white text-blue-950 p-4 rounded-2xl text-center flex flex-col items-center border border-gray-100">
          {pixData.qrCodeBase64 ? (
            <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="w-40 h-40 mb-2" />
          ) : (
            <div className="w-40 h-40 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-2">
              <QrCode size={48} className="text-blue-600 animate-pulse" />
            </div>
          )}
          <p className="text-[9px] font-black uppercase text-blue-950">PIX Copia e Cola</p>
          <code
            onClick={() => copyPix(pixData.copiaECola)}
            className="text-[7px] font-mono bg-gray-50 p-1.5 rounded border border-gray-100 block w-full select-all overflow-x-auto whitespace-nowrap mt-1 text-gray-500 cursor-pointer hover:bg-gray-100"
          >
            {pixData.copiaECola}
          </code>
          <span className="text-[7px] font-bold text-gray-400 mt-1 flex items-center gap-1">
            <Copy size={8} /> Clique para copiar
          </span>
        </div>
      )}

      {pixData && !paid && (
        <button
          onClick={() => {
            setPaid(true);
            alert('Pagamento enviado! Assim que o Mercado Pago confirmar, o status será atualizado automaticamente.');
          }}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-transform"
        >
          <Check size={14} /> <span>Já realizei o pagamento</span>
        </button>
      )}

      {paid && (
        <p className="text-[9px] text-green-600 font-bold text-center">
          ✅ Pagamento enviado! Aguardando confirmação...
        </p>
      )}
    </div>
  );
}
