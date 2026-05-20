import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
   Settings, Play, ChevronDown, CheckCircle2, Zap, Flame, Clock, Heart,
   Star, MapPin, Calendar, ChevronRight, X, Shield,
   Navigation, UserPlus, Bookmark, Target, Plus, Camera, Send,
   MessageSquare, MessageCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateLevel } from '@/constants/xpSystem';
import { api } from '../services/api';

export default function Profile() {
   const navigate = useNavigate();
   const { id } = useParams();

   // Pega o usuário logado
   const loggedUser = useMemo(() => {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      try {
         const parsed = JSON.parse(saved);
         return parsed?.id ? parsed : null;
      } catch (e) {
         return null;
      }
   }, []);

   useEffect(() => {
      // Se estiver no perfil principal sem ID na URL e não tiver usuário logado, expulsa
      if (!id && !loggedUser) {
         navigate('/auth');
      }
   }, [id, loggedUser, navigate]);

   const isOwnProfile = !id || (loggedUser && loggedUser.id.toString() === id);

   // Dados do Barbeiro (do banco/URL ou do usuário logado)
   const [barber, setBarber] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [followersCount, setFollowersCount] = useState(0);
   const [appointmentsCount, setAppointmentsCount] = useState(0);
   const [reviewsCount, setReviewsCount] = useState(0);

   useEffect(() => {
      async function loadProfile() {
         setLoading(true);
         try {
            const targetId = id || loggedUser?.id;
            if (!targetId) return;

            // Busca dados reais do barbeiro ou usuário
            const response = await api.getBarber(targetId.toString());
            if (response) {
               setBarber({
                  ...response,
                  name: response.user?.name || response.name,
                  avatar: response.user?.avatar || response.avatar || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
                  xp: response.user?.xp || response.xp || 0,
                  status: { id: 's1', icon: '⚡', color: '#22c55e' },
                  waitTime: 0
               });
               setFollowersCount(response.followersCount ?? 0);
               setAppointmentsCount(response._count?.appointments ?? response.appointmentsCount ?? 0);
               setReviewsCount(response.reviewsCount ?? 0);
            } else if (isOwnProfile && loggedUser) {
               // Fallback para perfil de usuário comum se não for barbeiro
               setBarber({
                  id: loggedUser.id,
                  name: loggedUser.name || 'Usuário da Arena',
                  username: (loggedUser.name || 'arena_user').toLowerCase().replace(/\s/g, '_'),
                  avatar: loggedUser.avatar || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
                  xp: loggedUser.xp || 0,
                  status: { id: 's1', icon: '⚡', color: '#22c55e' },
                  waitTime: 0,
                  isClientOnly: true
               });
               setFollowersCount(0);
               setAppointmentsCount(0);
               setReviewsCount(0);
            }
         } catch (e) {
            console.error('Erro ao carregar perfil do banco:', e);
         } finally {
            setLoading(false);
         }
      }

      loadProfile();
   }, [id, loggedUser?.id]);

   const [isFavorited, setIsFavorited] = useState(false);
   const [isFollowing, setIsFollowing] = useState(false);
   const handleFollowToggle = () => {
      if (isFollowing) {
         setIsFollowing(false);
         setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
         setIsFollowing(true);
         setFollowersCount(prev => prev + 1);
      }
   };
   const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
   const [storyIndex, setStoryIndex] = useState(0);
   const [showRouteOptions, setShowRouteOptions] = useState(false);
   const [showSettings, setShowSettings] = useState(false);
   const [showNewPost, setShowNewPost] = useState(false);
   const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
   const [newPostData, setNewPostData] = useState({ imageUrl: '', description: '', category: 'Fade' });
   const [isLoading, setIsLoading] = useState(false);

   const [showServicesConfig, setShowServicesConfig] = useState(false);
   const [editableServices, setEditableServices] = useState<any[]>([]);

   // Premium Social Interactions
   const [selectedPost, setSelectedPost] = useState<any>(null);
   const [commentText, setCommentText] = useState('');
   const [doubleTapHeart, setDoubleTapHeart] = useState(false);
   const [showFullPortfolio, setShowFullPortfolio] = useState(false);

   // Messenger State
   const [showMessenger, setShowMessenger] = useState(false);
   const [conversations, setConversations] = useState<any[]>([]);
   const [activeChatUser, setActiveChatUser] = useState<any>(null);
   const [chatMessages, setChatMessages] = useState<any[]>([]);
   const [chatMessageText, setChatMessageText] = useState('');
   const [searchUserText, setSearchUserText] = useState('');
   const [allBarbers, setAllBarbers] = useState<any[]>([]);

   // Booking State
   const [bookingDate, setBookingDate] = useState<string>(() => {
      const today = new Date();
      today.setHours(12, 0, 0, 0); // prevent UTC offset shift
      return today.toISOString().split('T')[0];
   });
   const [selectedBookingServices, setSelectedBookingServices] = useState<any[]>([]);
   const [bookingTime, setBookingTime] = useState<string>('');
   const [barberAppointments, setBarberAppointments] = useState<any[]>([]);

   // Fetch appointments of the barber to block occupied slots (polled every 3s for real-time updates)
   useEffect(() => {
       if (!barber?.id) return;

       const pollData = async () => {
          try {
             const freshBarber = await api.getBarber(barber.id.toString());
             if (freshBarber) {
                setBarber((prev: any) => {
                   if (!prev) return freshBarber;
                   return {
                      ...prev,
                      schedule: freshBarber.schedule,
                      servicesConfig: freshBarber.servicesConfig,
                      latitude: freshBarber.latitude,
                      longitude: freshBarber.longitude,
                      isOnline: freshBarber.isOnline
                   };
                });
             }
             const freshApps = await api.getBarberAppointments(barber.id.toString());
             setBarberAppointments(freshApps || []);
          } catch (err) {
             console.error('Error polling barber data:', err);
          }
       };

       pollData();
       const interval = setInterval(pollData, 3000);
       return () => clearInterval(interval);
    }, [barber?.id]);

   // Restore pending booking if returning from login redirect
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('resumeBooking') === 'true' && loggedUser && barber?.id) {
         const savedBooking = sessionStorage.getItem('pendingBooking');
         if (savedBooking) {
            try {
               const parsed = JSON.parse(savedBooking);
               if (parsed.barberId === barber.id) {
                  setBookingDate(parsed.date);
                  setBookingTime(parsed.time);
                  setSelectedBookingServices(parsed.services);
                  
                  // Clear sessionStorage and query param
                  sessionStorage.removeItem('pendingBooking');
                  window.history.replaceState({}, '', window.location.pathname);
                  alert('Dados do agendamento restaurados! Clique em "Confirmar Agendamento" para finalizar.');
               }
            } catch (e) {
               console.error('Failed to restore pending booking:', e);
            }
         }
      }
   }, [barber?.id, loggedUser]);

   // Fetch all barbers for chat search
   useEffect(() => {
      api.getBarbers()
         .then(res => {
            setAllBarbers(res || []);
         })
         .catch(err => console.error('Error fetching barbers for search list:', err));
   }, []);

   const bookingDates = useMemo(() => {
      const arr = [];
      const today = new Date();
      today.setHours(12, 0, 0, 0); // prevent UTC offset shift
      for (let i = 0; i < 14; i++) {
         const d = new Date(today);
         d.setDate(today.getDate() + i);
         arr.push(d);
      }
      return arr;
   }, []);

   const barberSchedule = useMemo(() => {
       if (!barber?.schedule) return {};
       try {
          return JSON.parse(barber.schedule);
       } catch (e) {
          console.error('Error parsing barber schedule:', e);
          return {};
       }
    }, [barber?.schedule]);

    const timeSlots = useMemo(() => {
       const key = `${barber?.id}_${bookingDate}`;
       const dayData = barberSchedule[key] || {};
       const workingHours = dayData.workingHours || { start: '08:00', end: '20:00' };
       
       const startHour = parseInt(workingHours.start.split(':')[0]);
       const endHour = parseInt(workingHours.end.split(':')[0]);
       
       const arr = [];
       for (let h = startHour; h <= endHour; h++) {
          arr.push(`${h.toString().padStart(2, '0')}:00`);
       }
       return arr;
    }, [barber?.id, bookingDate, barberSchedule]);

   const getSlotStatus = (time: string) => {
       const app = barberAppointments.find(a => {
          if (!a.date) return false;
          const appDate = a.date.split('T')[0];
          return appDate === bookingDate && a.time === time && a.status !== 'CANCELLED';
       });
       if (app) return 'occupied';

       const key = `${barber?.id}_${bookingDate}`;
       const dayData = barberSchedule[key] || {};
       const slots = dayData.slots || [];
       const localSlot = slots.find((s: any) => s.time === time);
       if (localSlot && (localSlot.status === 'blocked' || localSlot.status === 'occupied')) {
          return 'occupied';
       }

       return 'free';
    };

   const handleCreateBooking = async () => {
      if (selectedBookingServices.length === 0) {
         alert('Selecione pelo menos um serviço!');
         return;
      }
      if (!bookingTime) {
         alert('Selecione um horário!');
         return;
      }

      if (!loggedUser) {
         sessionStorage.setItem('pendingBooking', JSON.stringify({
            date: bookingDate,
            time: bookingTime,
            services: selectedBookingServices,
            barberId: barber.id
         }));
         sessionStorage.setItem('redirectAfterAuth', `/profile/${barber.id}?resumeBooking=true`);
         alert('Você precisa estar logado para agendar. Redirecionando para login/registro.');
         navigate('/auth');
         return;
      }

      try {
         setIsLoading(true);
         const total = selectedBookingServices.reduce((acc, s) => acc + s.price, 0);
         const sNames = selectedBookingServices.map(s => s.name);
         
         const newBooking = await api.createAppointment({
            clientId: loggedUser.id,
            barberId: barber.id,
            date: bookingDate,
            time: bookingTime,
            services: sNames,
            price: total,
            paymentMethod: 'Pix'
         });

         if (newBooking && !newBooking.error) {
            alert('Agendamento solicitado com sucesso! Aguarde a confirmação do barbeiro.');
            const updatedApps = await api.getBarberAppointments(barber.id.toString());
            setBarberAppointments(updatedApps || []);
            setBookingTime('');
            setSelectedBookingServices([]);
         } else {
            alert('Erro ao agendar: ' + (newBooking?.error || 'Erro desconhecido'));
         }
      } catch (e: any) {
         alert('Erro na solicitação: ' + e.message);
      } finally {
         setIsLoading(false);
      }
   };

   // Chat Handlers
   const loadConversations = async () => {
      if (!loggedUser) return;
      try {
         const res = await api.getConversations(loggedUser.id);
         setConversations(res || []);
      } catch (err) {
         console.error('Error loading conversations:', err);
      }
   };

   const loadMessages = async (otherUserId: string) => {
      if (!loggedUser) return;
      try {
         const res = await api.getMessages(loggedUser.id, otherUserId);
         setChatMessages(res || []);
      } catch (err) {
         console.error('Error loading messages:', err);
      }
   };

   const handleSendMessage = async () => {
      if (!loggedUser || !activeChatUser || !chatMessageText.trim()) return;
      try {
         const content = chatMessageText;
         setChatMessageText('');
         await api.sendMessage(loggedUser.id, activeChatUser.id, content);
         await loadMessages(activeChatUser.id);
         await loadConversations();
      } catch (err) {
         console.error('Error sending message:', err);
      }
   };

   const handleStartChatFromProfile = () => {
      if (!loggedUser) {
         alert('Faça login para enviar mensagens!');
         navigate('/auth');
         return;
      }
      if (isOwnProfile) return;
      
      const otherUser = barber.user || { id: barber.id, name: barber.name, avatar: barber.avatar };
      setActiveChatUser(otherUser);
      setShowMessenger(true);
   };

   const handleOpenMessenger = () => {
      if (!loggedUser) {
         alert('Faça login para acessar o mensageiro!');
         navigate('/auth');
         return;
      }
      setShowMessenger(true);
      loadConversations();
   };

   // Polling active chat messages
   useEffect(() => {
      let interval: any;
      if (showMessenger && activeChatUser) {
         loadMessages(activeChatUser.id);
         interval = setInterval(() => {
            loadMessages(activeChatUser.id);
         }, 3000);
      }
      return () => {
         if (interval) clearInterval(interval);
      };
   }, [showMessenger, activeChatUser]);

   // Polling conversations list
   useEffect(() => {
      let interval: any;
      if (showMessenger && !activeChatUser) {
         loadConversations();
         interval = setInterval(loadConversations, 5000);
      }
      return () => {
         if (interval) clearInterval(interval);
      };
   }, [showMessenger, activeChatUser]);

   const filteredSearchResults = useMemo(() => {
      if (!searchUserText.trim()) return [];
      const query = searchUserText.toLowerCase();
      return allBarbers
         .filter(b => b.user?.id !== loggedUser?.id && (
            b.user?.name?.toLowerCase().includes(query) ||
            b.barberShop?.toLowerCase().includes(query)
         ))
         .map(b => b.user);
   }, [searchUserText, allBarbers, loggedUser?.id]);

   const handleLikePost = async (postId: string) => {
      if (!loggedUser) {
         alert('Faça login para interagir com as postagens!');
         navigate('/auth');
         return;
      }
      try {
         setDoubleTapHeart(true);
         setTimeout(() => setDoubleTapHeart(false), 800);

         await api.likePost(postId, loggedUser.id);
         
         const targetId = id || loggedUser?.id;
         if (targetId) {
            const fresh = await api.getBarber(targetId.toString());
            if (fresh) {
               setBarber((prev: any) => ({ ...prev, posts: fresh.posts || [] }));
               if (selectedPost && selectedPost.id === postId) {
                  const updatedPost = fresh.posts?.find((p: any) => p.id === postId);
                  if (updatedPost) setSelectedPost(updatedPost);
               }
            }
         }
      } catch (err) {
         console.error('Failed to like post:', err);
      }
   };

   const hasLikedPost = (post: any) => {
      if (!loggedUser || !post?.likes) return false;
      return post.likes.some((l: any) => l.userId === loggedUser.id);
   };

   const handleCommentPost = async (postId: string) => {
      if (!loggedUser) {
         alert('Faça login para comentar!');
         navigate('/auth');
         return;
      }
      if (!commentText.trim()) return;

      try {
         const content = commentText;
         setCommentText('');
         await api.commentPost(postId, loggedUser.id, content);
         
         const targetId = id || loggedUser?.id;
         if (targetId) {
            const fresh = await api.getBarber(targetId.toString());
            if (fresh) {
               setBarber((prev: any) => ({ ...prev, posts: fresh.posts || [] }));
               if (selectedPost && selectedPost.id === postId) {
                  const updatedPost = fresh.posts?.find((p: any) => p.id === postId);
                  if (updatedPost) setSelectedPost(updatedPost);
               }
            }
         }
      } catch (err) {
         console.error('Failed to comment on post:', err);
      }
   };

   const currentServices = useMemo(() => {
      if (!barber?.servicesConfig) {
         return [
            { id: 'fade', name: 'Corte Fade', price: 45, time: '30-40 min' },
            { id: 'navalhado', name: 'Corte Navalhado', price: 50, time: '45-50 min' },
            { id: 'degrade', name: 'Degradê Pro', price: 40, time: '30 min' },
            { id: 'barba', name: 'Barba & Toalha', price: 30, time: '20 min' },
            { id: 'freestyle', name: 'Freestyle Art', price: 70, time: '60 min' },
            { id: 'pigmentacao', name: 'Pigmentação', price: 25, time: '15 min' }
         ];
      }
      try {
         const parsed = JSON.parse(barber.servicesConfig);
         if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
         console.error('Error parsing servicesConfig:', e);
      }
      return [];
   }, [barber?.servicesConfig]);

   const openServicesModal = () => {
      setEditableServices(JSON.parse(JSON.stringify(currentServices)));
      setShowServicesConfig(true);
   };

   const handleSaveServices = async () => {
      try {
         setIsLoading(true);
         await api.updateBarberProfile(barber.id, {
            servicesConfig: JSON.stringify(editableServices)
         });
         setBarber((prev: any) => ({
            ...prev,
            servicesConfig: JSON.stringify(editableServices)
         }));
         setShowServicesConfig(false);
         alert('Grade de serviços salva com sucesso!');
      } catch (e: any) {
         console.error('Failed to save services config:', e);
         alert('Erro ao salvar serviços: ' + e.message);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      if (isOwnProfile) {
         const justRegistered = localStorage.getItem('justRegistered');
         if (justRegistered) {
            setShowWelcomeGuide(true);
            localStorage.removeItem('justRegistered');
         }
      }
   }, [isOwnProfile]);

   if (loading) {
      return (
         <div className="min-h-screen bg-blue-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
         </div>
      );
   }

   if (!barber) {
      return (
         <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-black text-white uppercase italic mb-4">Perfil Não Encontrado</h2>
            <button onClick={() => navigate('/')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Voltar ao Mapa</button>
         </div>
      );
   }



   // Highlights Dinâmicos (Vazio para novos)
   const highlights = barber.highlights || [];

   // Feed Dinâmico (Vazio para novos)
   const feedImages = barber.posts || [];

   const latitude = barber.latitude ?? -23.525;
    const longitude = barber.longitude ?? -46.522;

   const openExternalMap = (type: 'google' | 'waze') => {
      const url = type === 'google'
         ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
         : `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      window.open(url, '_blank');
      setShowRouteOptions(false);
   };

   return (
      <div className="flex flex-col bg-[#fcfcfd] min-h-full font-inter text-blue-950 overflow-y-auto no-scrollbar pb-32">
         <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-50">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-2xl text-blue-950 transition-transform active:scale-90"><ChevronDown size={24} className="rotate-90" /></button>
            <div className="flex flex-col items-center">
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Profissional de Elite</span>
               <div className="flex items-center space-x-1">
                  <h1 className="text-sm font-black text-blue-950">{barber.username}</h1>
                  <CheckCircle2 size={14} className="text-blue-600 fill-blue-600" />
               </div>
            </div>
            <div className="flex items-center space-x-3">
               {isOwnProfile && (
                  <button onClick={() => setShowNewPost(true)} className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg active:scale-95 flex items-center space-x-1 px-3">
                     <Plus size={18} />
                     <span className="text-[10px] font-black uppercase italic">Postar</span>
                  </button>
               )}
               <button onClick={handleOpenMessenger} className="p-2 bg-gray-50 rounded-2xl text-blue-950 transition-transform active:scale-95 relative" title="Mensagens">
                  <MessageSquare size={20} />
               </button>
               <button onClick={() => setIsFavorited(!isFavorited)} className={`p-2 rounded-2xl transition-all ${isFavorited ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-blue-950'}`}>
                  <Heart size={20} className={isFavorited ? 'fill-red-500' : ''} />
               </button>
               <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-50 rounded-2xl text-blue-950 transition-transform active:rotate-90">
                  <Settings size={20} />
               </button>
            </div>
         </div>

         {/* IDENTIDADE CENTRAL */}
         <div className="px-6 pt-8 flex flex-col items-center text-center">
            <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={() => { setSelectedHighlight(highlights[0]); setStoryIndex(0); }}
               className="relative mb-6"
            >
               <div className="w-28 h-28 rounded-[40px] p-1.5 bg-gradient-to-tr from-blue-600 via-cyan-400 to-blue-900 shadow-2xl">
                  <img src={barber.avatar} className="w-full h-full rounded-[35px] object-cover border-4 border-white" />
               </div>
               <div className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-lg border border-gray-50 flex items-center justify-center animate-bounce">
                  <Play size={12} className="text-blue-600 fill-blue-600" />
               </div>
            </motion.button>

            <h2 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter mb-1">{barber.name}</h2>

            {/* STATUS EM TEMPO REAL DISCRETO */}
            <div className="flex items-center justify-center space-x-2 mb-2">
               <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: barber.status?.color || '#22c55e' }}></div>
               <span className="text-[10px] font-black text-blue-950 uppercase tracking-widest italic">
                  {barber.status?.id === 's1' ? 'Disponível Agora' : (barber.waitTime <= 10 ? 'Finalizando Serviço' : 'Em Atendimento')}
               </span>
            </div>

            <div className="flex flex-col items-center space-y-2.5 mb-8">
               {/* Estrelas de Avaliação Premium */}
               <div className="flex items-center space-x-1 bg-yellow-50/60 border border-yellow-100/50 px-3.5 py-1.5 rounded-full shadow-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                     <Star 
                        key={star} 
                        size={11} 
                        className={star <= Math.floor(parseFloat(barber.rating || '4.9')) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                     />
                  ))}
                  <span className="text-[10px] font-black text-yellow-600 font-orbitron pl-1.5">{barber.rating || '4.9'}</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest pl-1">({barber.reviewsCount || 128} avaliações)</span>
               </div>
               
               <div className="flex items-center space-x-1.5 text-gray-400">
                  <Clock size={11} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Seg - Sáb: 09h às 20h</span>
               </div>
            </div>

            {/* EXIBIR XP APENAS NO PERFIL PESSOAL */}
            {isOwnProfile && (
               <div className="w-full px-6 mb-8">
                  <div className="bg-white p-4 rounded-[30px] border border-gray-50 shadow-sm">
                     <div className="flex justify-between items-end mb-3">
                        <div className="text-left">
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{calculateLevel(barber.xp || 4500, true).title}</p>
                           <h4 className="text-lg font-black text-blue-950 uppercase italic tracking-tighter">Nível {calculateLevel(barber.xp || 4500, true).level}</h4>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-gray-300 uppercase italic">Próximo: {calculateLevel(barber.xp || 4500, true).nextTitle}</p>
                        </div>
                     </div>

                     <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden mb-3 border border-gray-100/50">
                        <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${calculateLevel(barber.xp || 4500, true).progress}%` }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        />
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400">
                           <span className="text-blue-600 font-black">{(barber.xp || 4500).toLocaleString()}</span> / {calculateLevel(barber.xp || 4500, true).nextLevelXp.toLocaleString()} XP
                        </span>
                        <div className="flex items-center space-x-1 text-blue-600 animate-pulse">
                           <Zap size={10} fill="currentColor" />
                           <span className="text-[9px] font-black uppercase italic">Faltam {calculateLevel(barber.xp || 4500, true).remainingXp.toLocaleString()} XP</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* EXIBIR MISSÕES APENAS NO PERFIL PESSOAL */}
            {isOwnProfile && (
               <div className="w-full px-6 mb-8">
                  <div className="flex items-center justify-between mb-4 px-1">
                     <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em]">Meus Desafios</h3>
                     <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">3/5 Concluídos</span>
                  </div>

                  <div className="space-y-3">
                     {[
                        { task: 'Vote em 20 Batalhas', progress: 12, total: 20, reward: 100 },
                        { task: 'Finalize 5 Cortes', progress: 3, total: 5, reward: 250 },
                        { task: 'Ganhe 10 Seguidores', progress: 8, total: 10, reward: 100 }
                     ].map((m, i) => (
                        <div key={i} className="bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                           <div className="flex-1 mr-4">
                              <div className="flex justify-between items-center mb-2">
                                 <p className="text-[11px] font-black text-blue-950 uppercase italic">{m.task}</p>
                                 <span className="text-[9px] font-bold text-gray-400">{m.progress}/{m.total}</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                 <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(m.progress / m.total) * 100}%` }} />
                              </div>
                           </div>
                           <div className="flex flex-col items-center min-w-[50px] bg-blue-50/50 p-2 rounded-2xl border border-blue-100/20">
                              <span className="text-[10px] font-black text-blue-600">+{m.reward}</span>
                              <span className="text-[7px] font-black text-blue-400 uppercase">XP</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* STATS DE MÉRITO (3 COLUNAS) */}
            <div className="w-full grid grid-cols-3 gap-2 px-2 mb-8">
               {[
                  { l: 'Atendimentos', v: appointmentsCount },
                  { l: 'Avaliações', v: reviewsCount },
                  { l: 'Seguidores', v: followersCount }
               ].map(s => (
                  <div key={s.l} className="bg-white py-3 rounded-2xl border border-gray-50 shadow-sm">
                     <p className="text-base font-black text-blue-950">{s.v}</p>
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{s.l}</p>
                  </div>
               ))}
            </div>

            {/* BOTÕES SOCIAIS */}
            <div className="flex space-x-3 mb-8 w-full max-w-[280px]">
               <button
                  onClick={handleFollowToggle}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isFollowing ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-50'}`}
               >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
               </button>
               <button 
                  onClick={handleStartChatFromProfile}
                  className="flex-1 py-3.5 bg-white text-blue-950 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
               >
                  Mensagem
               </button>
            </div>
         </div>

         {/* GALERIA / PORTFÓLIO CAROUSEL (Substituindo Conquistas) */}
         <div className="px-6 mb-10 text-left">
            <div className="flex items-center justify-between mb-4 px-1">
               <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em]">Portfólio de Cortes</h3>
               <button
                  onClick={() => setShowFullPortfolio(true)}
                  className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center space-x-1 hover:bg-blue-100/50 transition-colors"
               >
                  <span>Ver Todos</span>
               </button>
            </div>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
               {feedImages.map((img: any) => (
                  <div
                     key={img.id}
                     onClick={() => setSelectedPost(img)}
                     className="min-w-[140px] w-[140px] aspect-square rounded-[24px] overflow-hidden bg-gray-100 shadow-sm border border-gray-50 flex-shrink-0 relative group cursor-pointer"
                  >
                     <img src={img.imageUrl || img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                     <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 flex justify-between items-center text-white">
                        <span className="flex items-center space-x-1 text-[9px] font-black font-orbitron">
                           <Heart size={10} className="fill-white" />
                           <span>{img.likes?.length || img.likesCount || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-[9px] font-black font-orbitron">
                           <MessageSquare size={10} className="fill-white" />
                           <span>{img.comments?.length || 0}</span>
                        </span>
                     </div>
                  </div>
               ))}
               {feedImages.length === 0 && (
                  <p className="text-[10px] text-gray-300 italic py-6 pl-2">Nenhum corte no portfólio ainda.</p>
               )}
            </div>
         </div>

         {/* GRADE DE SERVIÇOS & VALORES */}
         {!barber.isClientOnly && (
            <div className="px-6 mb-10 text-left">
               <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em]">Tabela de Serviços & Preços</h3>
                  {isOwnProfile && (
                     <button
                        onClick={openServicesModal}
                        className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center space-x-1"
                     >
                        <Settings size={12} />
                        <span>Configurar</span>
                     </button>
                  )}
               </div>

               <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
                  {currentServices.map((srv: any) => {
                     const isBarba = srv.name.toLowerCase().includes('barba');
                     const isFade = srv.name.toLowerCase().includes('fade') || srv.name.toLowerCase().includes('degradê') || srv.name.toLowerCase().includes('degrade');
                     const isFreestyle = srv.name.toLowerCase().includes('free') || srv.name.toLowerCase().includes('art') || srv.name.toLowerCase().includes('design');
                     const isPigment = srv.name.toLowerCase().includes('pigment');
                     return (
                        <div 
                           key={srv.id} 
                           className="min-w-[155px] w-[155px] bg-white p-5 rounded-[30px] border border-gray-50 shadow-sm flex flex-col justify-between hover:border-blue-500/20 hover:shadow-md transition-all duration-300 flex-shrink-0 text-center relative overflow-hidden group"
                        >
                           <div className="absolute inset-0 bg-gradient-to-b from-blue-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                           
                           <div className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center text-2xl font-orbitron font-black shadow-inner mb-4">
                                 {isBarba ? '🪒' : isFade ? '✂️' : isFreestyle ? '🎨' : isPigment ? '🖍️' : '💈'}
                              </div>
                              <p className="text-xs font-black text-blue-950 uppercase italic tracking-tight line-clamp-1 mb-1">{srv.name}</p>
                              <div className="flex items-center justify-center space-x-1">
                                 <Clock size={9} className="text-gray-400" />
                                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{srv.time || '35 min'}</span>
                              </div>
                           </div>
                           <div className="mt-5 border-t border-gray-50/80 pt-3">
                              <span className="text-[7px] font-black text-gray-300 uppercase block tracking-widest leading-none mb-1">Preço</span>
                              <p className="text-sm font-black text-blue-600 font-orbitron">R$ {srv.price},00</p>
                           </div>
                        </div>
                     );
                  })}
               </div>

                {/* INLINE AGENDA SCHEDULER */}
                <div className="mt-8 bg-white p-6 rounded-[35px] border border-gray-50 shadow-sm text-left">
                   <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em] mb-4">
                      {isOwnProfile ? 'Sua Agenda de Horários' : 'Escolha a Data do Desafio'}
                   </h3>
                   
                   <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2 mb-6">
                      {bookingDates.map((date) => {
                         const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                         const dayNum = date.getDate();
                         const dateISO = date.toISOString().split('T')[0];
                         const isSelected = bookingDate === dateISO;

                         return (
                            <button
                               key={dateISO}
                               type="button"
                               onClick={() => {
                                  setBookingDate(dateISO);
                                  setBookingTime('');
                               }}
                               className={`flex flex-col items-center min-w-[65px] p-4 rounded-[24px] border transition-all ${isSelected ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-none text-white shadow-lg shadow-blue-200' : 'bg-gray-50 border-gray-100 text-blue-950 hover:bg-gray-100/50'}`}
                            >
                               <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{dayName}</span>
                               <span className="text-base font-black font-orbitron mt-1">{dayNum}</span>
                            </button>
                         );
                      })}
                   </div>

                   <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em] mb-4">
                      {isOwnProfile ? 'Status dos Horários' : 'Horários Disponíveis'}
                   </h3>
                   <div className="grid grid-cols-4 gap-2 mb-6">
                      {timeSlots.map((time) => {
                         const status = getSlotStatus(time);
                         const isSelected = bookingTime === time;
                         const isOccupied = status === 'occupied';

                         return (
                            <button
                               key={time}
                               type="button"
                               disabled={isOccupied && !isOwnProfile}
                               onClick={() => {
                                  if (!isOwnProfile) setBookingTime(time);
                               }}
                               className={`py-3 rounded-xl font-orbitron text-xs font-black transition-all ${
                                  isOccupied 
                                     ? 'bg-red-50 text-red-500 border border-red-150 cursor-default' 
                                     : isSelected 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-gray-50 text-blue-950 border border-gray-100 hover:bg-gray-100'
                               }`}
                            >
                               {time}
                            </button>
                         );
                      })}
                   </div>

                   {!isOwnProfile && (
                      <>
                         <h3 className="text-[10px] font-black text-blue-950 uppercase tracking-[0.2em] mb-4">Selecione os Serviços</h3>
                         <div className="grid grid-cols-1 gap-2 mb-6">
                            {currentServices.map((srv: any) => {
                               const isSelected = selectedBookingServices.some(s => s.id === srv.id);
                               return (
                                  <button
                                     key={srv.id}
                                     type="button"
                                     onClick={() => {
                                        if (isSelected) {
                                           setSelectedBookingServices(prev => prev.filter(s => s.id !== srv.id));
                                        } else {
                                           setSelectedBookingServices(prev => [...prev, srv]);
                                        }
                                     }}
                                     className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                                  >
                                     <div className="flex items-center space-x-3">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200'}`}>
                                           {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span className="text-xs font-bold text-blue-950 uppercase tracking-tight">{srv.name}</span>
                                     </div>
                                     <span className="text-xs font-black text-blue-600 font-orbitron">R$ {srv.price},00</span>
                                  </button>
                               );
                            })}
                         </div>

                         {selectedBookingServices.length > 0 && (
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/20 mb-6 flex justify-between items-center">
                               <div>
                                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Total do Desafio</span>
                                  <p className="text-xs font-bold text-blue-950 uppercase mt-0.5">{selectedBookingServices.length} {selectedBookingServices.length === 1 ? 'Serviço' : 'Serviços'}</p>
                               </div>
                               <p className="text-xl font-black text-blue-600 font-orbitron">R$ {selectedBookingServices.reduce((acc, s) => acc + s.price, 0)},00</p>
                            </div>
                         )}

                         <button
                            type="button"
                            onClick={handleCreateBooking}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all animate-pulse"
                         >
                            <Calendar size={14} />
                            <span>Confirmar Agendamento</span>
                         </button>
                      </>
                   )}
                </div>
             </div>
          )}

         {/* LOCALIZAÇÃO E ROTA */}
         <div className="px-6 mb-10">
            <div className="bg-white p-6 rounded-[35px] border border-gray-50 shadow-sm flex flex-col space-y-4 text-left">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><MapPin size={20} /></div>
                     <div>
                        <h4 className="text-[10px] font-black text-blue-950 uppercase mb-0.5">{barber.city || 'Sua Cidade'}, {barber.state || 'UF'}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Endereço Privado</p>
                     </div>
                  </div>
                  <button onClick={() => setShowRouteOptions(true)} className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
                     <Navigation size={14} className="fill-white" /> <span>Traçar Rota</span>
                  </button>
               </div>

               {/* Premium Styled Map Preview */}
               <div className="w-full h-[180px] rounded-[24px] overflow-hidden border border-gray-150/50 shadow-inner relative">
                  <iframe 
                     title="Localização do Barbeiro"
                     width="100%" 
                     height="100%" 
                     frameBorder="0" 
                     scrolling="no" 
                     marginHeight={0} 
                     marginWidth={0} 
                     src={`https://maps.google.com/maps?q=${latitude || -23.525},${longitude || -46.522}&z=15&output=embed`}
                     className="grayscale opacity-90 contrast-[1.1] saturate-[0.9]"
                  />
               </div>
            </div>
         </div>

         {/* DESTAQUES (GEOMÉTRICOS) */}
         <div className="px-6 mb-10 flex space-x-5 overflow-x-auto no-scrollbar">
            {highlights.map((h: any) => (
               <button key={h.id} onClick={() => { setSelectedHighlight(h); setStoryIndex(0); }} className="flex flex-col items-center space-y-2 flex-shrink-0">
                  <div className="w-16 h-16 rounded-[24px] p-0.5 border-2 border-blue-50 bg-white shadow-sm overflow-hidden">
                     <img src={h.img} className="w-full h-full rounded-[20px] object-cover hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-black text-blue-950 uppercase tracking-tighter">{h.label}</span>
               </button>
            ))}
         </div>


         {/* STORY VIEWER (MULTI-SLIDE & TOQUE) */}
         <AnimatePresence>
            {selectedHighlight && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black flex flex-col p-4">
                  <div className="flex items-center justify-between mt-8 mb-4">
                     <div className="flex items-center space-x-3 text-white">
                        <img src={barber.avatar} className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-lg" />
                        <div>
                           <h4 className="text-2xl font-black text-blue-950 uppercase italic leading-tight">{barber.name}</h4>
                           <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 uppercase tracking-widest">
                                 RANK {typeof barber.id === 'number' ? (barber.id % 5 + 1) : (barber.id ? (barber.id.length % 5 + 1) : 1)}º
                              </span>
                              <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                 <Star size={10} className="fill-yellow-500 mr-1" />
                                 <span className="text-[10px] font-black">{barber.rating || '4.9'}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setSelectedHighlight(null)} className="text-white bg-white/10 p-2 rounded-full backdrop-blur-md"><X size={24} /></button>
                  </div>
                  <div className="flex-1 rounded-[45px] overflow-hidden relative shadow-2xl flex items-center border border-white/5">
                     <img src={selectedHighlight.content[storyIndex]} className="w-full h-full object-cover" />

                     {/* ZONAS DE TOQUE PARA NAVEGAÇÃO */}
                     <div className="absolute inset-0 flex">
                        <div className="flex-[1] h-full cursor-pointer" onClick={() => setStoryIndex(Math.max(0, storyIndex - 1))} title="Anterior" />
                        <div className="flex-[2] h-full cursor-pointer" onClick={() => {
                           if (storyIndex < selectedHighlight.content.length - 1) {
                              setStoryIndex(storyIndex + 1);
                           } else {
                              setSelectedHighlight(null);
                           }
                        }} title="Próximo" />
                     </div>

                     {/* INDICADORES DE PROGRESSO SUPERIOR */}
                     <div className="absolute top-4 left-6 right-6 flex space-x-1.5">
                        {selectedHighlight.content.map((_: any, idx: number) => (
                           <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ width: 0 }}
                                 animate={{ width: idx <= storyIndex ? '100%' : '0%' }}
                                 transition={{ duration: 0.3 }}
                                 className="h-full bg-white shadow-[0_0_10px_white]"
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* MENU DE ROTAS (WAZE / GOOGLE MAPS) */}
         <AnimatePresence>
            {showRouteOptions && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-blue-950/40 backdrop-blur-md flex items-end justify-center">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[45px] p-8 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
                     <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                     <h3 className="text-xl font-black text-blue-950 uppercase italic text-center mb-8 tracking-tighter">Escolher Navegador</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => openExternalMap('google')} className="flex flex-col items-center p-6 bg-gray-50 rounded-[35px] border border-gray-100 hover:bg-blue-50 transition-colors active:scale-95">
                           <img src="https://www.google.com/images/branding/product/2x/maps_96in128dp.png" className="w-12 h-12 mb-3 shadow-md rounded-xl" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Google Maps</span>
                        </button>
                        <button onClick={() => openExternalMap('waze')} className="flex flex-col items-center p-6 bg-gray-50 rounded-[35px] border border-gray-100 hover:bg-blue-50 transition-colors active:scale-95">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Waze_Logo.png" className="w-12 h-12 mb-3 shadow-md rounded-xl" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Waze</span>
                        </button>
                     </div>
                     <button onClick={() => setShowRouteOptions(false)} className="w-full mt-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">Voltar ao Perfil</button>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* MENU DE CONFIGURAÇÕES (ESTILO INSTAGRAM) */}
         <AnimatePresence>
            {showSettings && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7000] bg-blue-950/60 backdrop-blur-md flex items-end justify-center">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[45px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                     <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto my-6" />

                     <div className="px-8 pb-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-blue-950 uppercase italic tracking-tighter">Configurações</h3>
                        <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-12">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Conta</p>
                           <div className="bg-gray-50 rounded-[30px] p-2 space-y-1">
                              {[
                                 { label: 'Editar Perfil', icon: <UserPlus size={18} /> },
                                 { label: 'Trocar Senha', icon: <Shield size={18} /> },
                                 { label: 'Privacidade', icon: <Bookmark size={18} /> },
                                 { label: 'Segurança', icon: <Target size={18} /> }
                              ].map((item, idx) => (
                                 <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-[22px] hover:bg-blue-50 transition-colors group">
                                    <div className="flex items-center space-x-3">
                                       <div className="text-blue-600">{item.icon}</div>
                                       <span className="text-sm font-bold text-blue-950">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Notificações</p>
                           <div className="bg-gray-50 rounded-[30px] p-2 space-y-1">
                              {[
                                 { label: 'Push & Alertas', icon: <Zap size={18} /> },
                                 { label: 'Sons de Batalha', icon: <Flame size={18} /> }
                              ].map((item, idx) => (
                                 <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-[22px] hover:bg-blue-50 transition-colors group">
                                    <div className="flex items-center space-x-3">
                                       <div className="text-blue-600">{item.icon}</div>
                                       <span className="text-sm font-bold text-blue-950">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                                 </button>
                              ))}
                           </div>
                        </div>

                        <button
                           onClick={() => {
                              localStorage.removeItem('user');
                              localStorage.removeItem('token');
                              window.location.href = '/auth';
                           }}
                           className="w-full py-5 bg-red-50 text-red-500 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all"
                        >
                           Sair da Conta
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* MODAL NOVA POSTAGEM */}
         <AnimatePresence>
            {showNewPost && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[8000] bg-blue-950/40 backdrop-blur-md flex items-end justify-center">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full bg-white rounded-t-[45px] p-8 pb-12 shadow-2xl flex flex-col">
                     <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter">Nova Publicação</h3>
                        <button onClick={() => setShowNewPost(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                     </div>

                     <div className="space-y-6">
                        <div className="aspect-video bg-gray-50 rounded-[30px] border-2 border-dashed border-blue-100 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-blue-50 transition-colors overflow-hidden relative">
                           {newPostData.imageUrl ? (
                              <img src={newPostData.imageUrl} className="w-full h-full object-cover" />
                           ) : (
                              <>
                                 <Camera size={32} className="mb-2" />
                                 <span className="text-[10px] font-black uppercase">Subir Foto ou Vídeo</span>
                              </>
                           )}
                           <input type="text" placeholder="URL da Imagem (Ex: Unsplash)" value={newPostData.imageUrl} onChange={e => setNewPostData({ ...newPostData, imageUrl: e.target.value })} className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded-xl text-[10px] border-none outline-none font-bold" />
                        </div>

                        <textarea
                           placeholder="Escreva uma descrição..."
                           value={newPostData.description}
                           onChange={e => setNewPostData({ ...newPostData, description: e.target.value })}
                           className="w-full bg-gray-50 border-none rounded-[25px] py-4 px-6 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[100px] resize-none"
                        />

                        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                           {['Fade', 'Navalhado', 'Freestyle', 'Barba', 'Social'].map(cat => (
                              <button key={cat} onClick={() => setNewPostData({ ...newPostData, category: cat })} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${newPostData.category === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400'}`}>{cat}</button>
                           ))}
                        </div>

                        <button
                           onClick={async () => {
                              setIsLoading(true);
                              const newPost = await api.createPost({ ...newPostData, barberId: barber.id });
                              setIsLoading(false);
                              setShowNewPost(false);
                              if (newPost && !newPost.error) {
                                 setBarber((prev: any) => ({
                                    ...prev,
                                    posts: [newPost, ...(prev.posts || [])]
                                 }));
                              }
                              alert('Postagem realizada com sucesso na Arena!');
                           }}
                           disabled={isLoading || !newPostData.imageUrl}
                           className="w-full py-5 bg-blue-600 text-white rounded-[25px] font-black uppercase italic tracking-widest shadow-xl flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                           {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> <span>Publicar na Arena</span></>}
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* GUIA DE BOAS-VINDAS */}
         <AnimatePresence>
            {showWelcomeGuide && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9000] bg-blue-600/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center text-white">
                  <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="space-y-8">
                     <div className="w-24 h-24 bg-white rounded-[35px] flex items-center justify-center mx-auto text-blue-600 shadow-2xl">
                        <Target size={48} strokeWidth={3} />
                     </div>
                     <div>
                        <h2 className="text-4xl font-black font-orbitron italic uppercase tracking-tighter">BEM-VINDO AO TOPO!</h2>
                        <p className="text-[12px] font-bold text-blue-100 uppercase tracking-widest mt-4 leading-relaxed">Você agora é um Atleta de Elite. Comece postando seu melhor trabalho para subir no ranking e ser descoberto!</p>
                     </div>
                     <div className="bg-white/10 p-6 rounded-[40px] border border-white/20">
                        <div className="flex items-center space-x-4 text-left">
                           <div className="p-3 bg-white text-blue-600 rounded-2xl"><Plus size={24} /></div>
                           <p className="text-[10px] font-black uppercase italic">Toque no botão "+" ali em cima para fazer seu primeiro post.</p>
                        </div>
                     </div>
                     <button onClick={() => setShowWelcomeGuide(false)} className="w-full py-5 bg-white text-blue-600 rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all">COMEÇAR AGORA</button>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* MODAL CONFIGURAR SERVIÇOS */}
         <AnimatePresence>
            {showServicesConfig && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm p-4">
                  <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white w-full max-w-md rounded-[40px] p-6 shadow-2xl flex flex-col max-h-[85vh]">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-blue-950 uppercase italic">Grade de Serviços</h3>
                        <button onClick={() => setShowServicesConfig(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar mb-6">
                        {editableServices.map((srv, idx) => (
                           <div key={srv.id} className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 flex flex-col space-y-3">
                              <p className="text-xs font-black text-blue-950 uppercase tracking-wide text-left">{srv.name}</p>
                              <div className="grid grid-cols-2 gap-3 text-left">
                                 <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Preço (R$)</label>
                                    <input
                                       type="number"
                                       value={srv.price}
                                       onChange={(e) => {
                                          const updated = [...editableServices];
                                          updated[idx].price = parseFloat(e.target.value) || 0;
                                          setEditableServices(updated);
                                       }}
                                       className="w-full bg-white border border-gray-100 px-4 py-3 rounded-2xl text-xs font-bold text-blue-950 focus:outline-none focus:border-blue-600"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Duração</label>
                                    <input
                                       type="text"
                                       value={srv.time}
                                       onChange={(e) => {
                                          const updated = [...editableServices];
                                          updated[idx].time = e.target.value;
                                          setEditableServices(updated);
                                       }}
                                       placeholder="Ex: 30 min"
                                       className="w-full bg-white border border-gray-100 px-4 py-3 rounded-2xl text-xs font-bold text-blue-950 focus:outline-none focus:border-blue-600"
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     <button
                        onClick={handleSaveServices}
                        className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2"
                     >
                        <span>Salvar Tabela</span>
                     </button>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* INSTAGRAM POST DETAILS MODAL */}
         <AnimatePresence>
            {selectedPost && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                     {/* Header */}
                     <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-left">
                           <img src={barber.avatar} className="w-9 h-9 rounded-xl object-cover border border-gray-100" />
                           <div>
                              <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{barber.name}</h4>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{selectedPost.category || 'Trabalho de Elite'}</p>
                           </div>
                        </div>
                        <button onClick={() => setSelectedPost(null)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                     </div>

                     {/* Image Body with Double Tap Area */}
                     <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
                        <img 
                           src={selectedPost.imageUrl || selectedPost.url} 
                           className="w-full h-full object-cover select-none" 
                           onDoubleClick={() => handleLikePost(selectedPost.id)}
                        />
                        <AnimatePresence>
                           {doubleTapHeart && (
                              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 1.2, 1], opacity: [1, 1, 0] }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute text-white pointer-events-none">
                                 <Heart size={80} className="fill-red-500 text-red-500 drop-shadow-2xl" />
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Actions & Caption */}
                     <div className="p-5 flex-1 flex flex-col overflow-y-auto no-scrollbar text-left">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex space-x-4">
                              <button onClick={() => handleLikePost(selectedPost.id)} className="transition-transform active:scale-125">
                                 <Heart size={22} className={hasLikedPost(selectedPost) ? 'fill-red-500 text-red-500' : 'text-blue-950'} />
                              </button>
                              <button className="transition-transform active:scale-125">
                                 <MessageCircle size={22} className="text-blue-950" />
                              </button>
                           </div>
                           <span className="text-[10px] font-black text-blue-950 uppercase tracking-widest">
                              {selectedPost.likes?.length || selectedPost.likesCount || 0} Likes
                           </span>
                        </div>

                        {selectedPost.description && (
                           <div className="mb-4">
                              <p className="text-xs text-blue-950 leading-relaxed">
                                 <span className="font-black mr-2 uppercase italic">{barber.username}</span>
                                 {selectedPost.description}
                              </p>
                           </div>
                        )}

                        {/* Comments List */}
                        <div className="border-t border-gray-50 pt-4 flex-1">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">Comentários ({selectedPost.comments?.length || 0})</p>
                           <div className="space-y-3 max-h-[150px] overflow-y-auto no-scrollbar">
                              {(selectedPost.comments || []).map((c: any) => (
                                 <div key={c.id} className="flex items-start space-x-2 text-xs">
                                    <img src={c.user?.avatar || `https://i.pravatar.cc/100?u=${c.userId}`} className="w-6 h-6 rounded-lg object-cover" />
                                    <div className="bg-gray-50 p-2.5 rounded-2xl flex-1 text-left">
                                       <span className="font-black uppercase tracking-wider text-[9px] text-blue-950 block mb-0.5">{c.user?.name || 'Cliente'}</span>
                                       <p className="text-[11px] text-blue-900 leading-normal">{c.content}</p>
                                    </div>
                                 </div>
                              ))}
                              {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                                 <p className="text-[10px] text-gray-300 italic text-center py-4">Seja o primeiro a comentar!</p>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Comment Input */}
                     <div className="p-4 border-t border-gray-150 bg-gray-50 flex items-center space-x-2">
                        <input
                           type="text"
                           placeholder="Deixe um comentário..."
                           value={commentText}
                           onChange={e => setCommentText(e.target.value)}
                           onKeyDown={e => { if (e.key === 'Enter') handleCommentPost(selectedPost.id); }}
                           className="flex-1 bg-white border border-gray-150 rounded-2xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950"
                        />
                        <button onClick={() => handleCommentPost(selectedPost.id)} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                           <Send size={14} />
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* MODAL MENSAGEIRO (CHAT) */}
         <AnimatePresence>
            {showMessenger && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7500] bg-blue-950/60 backdrop-blur-md flex items-end justify-center">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-white rounded-t-[45px] h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                     <div className="w-12 h-1.5 bg-gray-150 rounded-full mx-auto my-4" />

                     {activeChatUser ? (
                        /* TELA DE CHAT ATIVO */
                        <div className="flex-1 flex flex-col overflow-hidden h-full">
                           {/* Chat Header */}
                           <div className="px-6 pb-4 border-b border-gray-150 flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-left">
                                 <button 
                                    onClick={() => {
                                       setActiveChatUser(null);
                                       setChatMessages([]);
                                    }} 
                                    className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                                 >
                                    <ChevronDown size={20} className="rotate-90" />
                                 </button>
                                 <img src={activeChatUser.avatar || `https://i.pravatar.cc/100?u=${activeChatUser.id}`} className="w-10 h-10 rounded-xl object-cover" />
                                 <div>
                                    <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{activeChatUser.name}</h4>
                                    <span className="text-[7px] font-black text-green-500 uppercase tracking-widest block mt-1 animate-pulse">Online</span>
                                 </div>
                              </div>
                              <button onClick={() => setShowMessenger(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                           </div>

                           {/* Messages List */}
                           <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50/30">
                              {chatMessages.map((msg: any) => {
                                 const isMe = msg.senderId === loggedUser?.id;
                                 return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[75%] p-4 rounded-[24px] text-xs leading-relaxed text-left ${isMe ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' : 'bg-white border border-gray-150 text-blue-950 rounded-tl-sm shadow-sm'}`}>
                                          <p>{msg.content}</p>
                                          <span className={`block text-[6px] font-black uppercase mt-1.5 ${isMe ? 'text-blue-100 text-right' : 'text-gray-300'}`}>
                                             {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                       </div>
                                    </div>
                                 );
                              })}
                              {chatMessages.length === 0 && (
                                 <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                                    <MessageSquare size={36} className="mb-3 text-blue-950" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-950">Nenhuma mensagem. Comece a conversa!</p>
                                 </div>
                              )}
                           </div>

                           {/* Chat Input */}
                           <div className="p-4 border-t border-gray-150 bg-white flex items-center space-x-2">
                              <input
                                 type="text"
                                 placeholder="Digite sua mensagem..."
                                 value={chatMessageText}
                                 onChange={e => setChatMessageText(e.target.value)}
                                 onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                                 className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950"
                              />
                              <button onClick={handleSendMessage} className="p-3.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                                 <Send size={14} />
                              </button>
                           </div>
                        </div>
                     ) : (
                        /* LISTA DE CONVERSAS ATIVAS */
                        <div className="flex-1 flex flex-col overflow-hidden h-full">
                           <div className="px-6 pb-4 border-b border-gray-150 flex items-center justify-between">
                              <h3 className="text-xl font-black text-blue-950 uppercase italic tracking-tighter">Minhas Conversas</h3>
                              <button onClick={() => setShowMessenger(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20} /></button>
                           </div>

                           {/* Search Box */}
                           <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                              <input
                                 type="text"
                                 placeholder="Buscar barbeiro ou usuário para conversar..."
                                 value={searchUserText}
                                 onChange={e => setSearchUserText(e.target.value)}
                                 className="w-full bg-white border border-gray-150 rounded-2xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950"
                              />
                           </div>

                           {/* List Container */}
                           <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                              {searchUserText.trim() ? (
                                 /* SEARCH RESULTS */
                                 <div>
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">Resultados da busca ({filteredSearchResults.length})</p>
                                    {filteredSearchResults.map((usr: any) => (
                                       <button
                                          key={usr.id}
                                          onClick={() => {
                                             setActiveChatUser(usr);
                                             setSearchUserText('');
                                          }}
                                          className="w-full bg-white p-3 rounded-2xl border border-gray-100 flex items-center space-x-3 hover:bg-blue-50/30 transition-colors"
                                       >
                                          <img src={usr.avatar || `https://i.pravatar.cc/100?u=${usr.id}`} className="w-10 h-10 rounded-xl object-cover" />
                                          <div className="text-left flex-1">
                                             <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{usr.name}</h4>
                                             <span className="text-[8px] font-bold text-gray-400 mt-1 block">Clique para iniciar conversa</span>
                                          </div>
                                       </button>
                                    ))}
                                    {filteredSearchResults.length === 0 && (
                                       <p className="text-center py-6 text-xs text-gray-300">Nenhum barbeiro ou usuário encontrado</p>
                                    )}
                                 </div>
                              ) : (
                                 /* ACTIVE CONVERSATIONS LIST */
                                 <div>
                                    {conversations.map((conv: any) => (
                                       <button
                                          key={conv.otherUser.id}
                                          onClick={() => setActiveChatUser(conv.otherUser)}
                                          className="w-full bg-white p-4 rounded-3xl border border-gray-50 flex items-center justify-between hover:bg-blue-50/20 transition-all duration-300 shadow-sm mb-2"
                                       >
                                          <div className="flex items-center space-x-3 text-left">
                                             <img src={conv.otherUser.avatar || `https://i.pravatar.cc/100?u=${conv.otherUser.id}`} className="w-11 h-11 rounded-2xl object-cover" />
                                             <div>
                                                <h4 className="text-xs font-black text-blue-950 uppercase italic leading-none">{conv.otherUser.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold truncate max-w-[200px] mt-1.5">
                                                   {conv.lastMessage.senderId === loggedUser?.id ? 'Você: ' : ''}
                                                   {conv.lastMessage.content}
                                                </p>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <span className="text-[6px] font-black text-gray-300 uppercase">
                                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                             </span>
                                          </div>
                                       </button>
                                    ))}
                                    {conversations.length === 0 && (
                                       <div className="py-20 text-center opacity-30">
                                          <MessageSquare size={36} className="mx-auto mb-3 text-blue-950" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-950">Nenhuma conversa ativa</p>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* PORTFOLIO COMPLETO ESTILO INSTAGRAM */}
         <AnimatePresence>
            {showFullPortfolio && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-blue-950/60 backdrop-blur-md flex items-end justify-center">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md bg-[#fcfcfd] rounded-t-[45px] h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                     <div className="w-12 h-1.5 bg-gray-150 rounded-full mx-auto my-4" />

                     {/* Header */}
                     <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center space-x-3 text-left">
                           <img src={barber.avatar} className="w-9 h-9 rounded-xl object-cover border border-gray-100" />
                           <div>
                              <h3 className="text-xs font-black text-blue-950 uppercase italic leading-none">{barber.username}</h3>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Portfólio Completo</p>
                           </div>
                        </div>
                        <button onClick={() => setShowFullPortfolio(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={20} /></button>
                     </div>

                     {/* Gallery Grid */}
                     <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                        <div className="grid grid-cols-3 gap-2">
                           {feedImages.map((img: any) => (
                              <motion.div
                                 key={img.id}
                                 whileTap={{ scale: 0.98 }}
                                 onClick={() => setSelectedPost(img)}
                                 className="aspect-square rounded-[18px] overflow-hidden bg-gray-100 relative group cursor-pointer border border-gray-100/50 shadow-sm"
                              >
                                 <img src={img.imageUrl || img.url} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1 text-white">
                                    <span className="flex items-center space-x-1 font-black font-orbitron text-[10px]">
                                       <Heart size={12} className="fill-white" />
                                       <span>{img.likes?.length || img.likesCount || 0}</span>
                                    </span>
                                    <span className="flex items-center space-x-1 font-black font-orbitron text-[10px]">
                                       <MessageSquare size={12} className="fill-white" />
                                       <span>{img.comments?.length || 0}</span>
                                    </span>
                                 </div>
                              </motion.div>
                           ))}
                        </div>

                        {feedImages.length === 0 && (
                           <div className="py-20 text-center opacity-30">
                              <MessageSquare size={36} className="mx-auto mb-3 text-blue-950" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-950">Nenhum post publicado</p>
                           </div>
                        )}
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
