import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Trophy, MessageSquare, Star, Calendar, User, Check } from 'lucide-react';

export default function Notificacoes() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'todas' | 'naolidas'>('todas');

  const [notifications, setNotifications] = useState([
    { id: 1, icon: Heart, title: 'Novo Seguidor', desc: 'Maria Santos começou a seguir você', time: '2 min atrás', color: 'text-rose-600', bg: 'bg-rose-50', read: false },
    { id: 2, icon: Trophy, title: 'Desafio Recebido', desc: 'Corte Premium te desafiou para uma batalha!', time: '15 min atrás', color: 'text-amber-600', bg: 'bg-amber-50', read: false },
    { id: 3, icon: Star, title: 'Avaliação 5 Estrelas', desc: 'Carlos Lima te avaliou ⭐⭐⭐⭐⭐', time: '1 hora atrás', color: 'text-yellow-600', bg: 'bg-yellow-50', read: false },
    { id: 4, icon: Calendar, title: 'Novo Agendamento', desc: 'João Silva — Corte Degradê às 14h', time: '2 horas atrás', color: 'text-emerald-600', bg: 'bg-emerald-50', read: true },
    { id: 5, icon: MessageSquare, title: 'Mensagem Recebida', desc: 'Pedro Alves: "Tem horário amanhã?"', time: '3 horas atrás', color: 'text-blue-600', bg: 'bg-blue-50', read: true },
    { id: 6, icon: User, title: 'Novo Cliente', desc: 'Ana Costa se cadastrou na plataforma', time: '5 horas atrás', color: 'text-violet-600', bg: 'bg-violet-50', read: true },
  ]);

  const filtered = filter === 'naolidas' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Notificações</h1>
            <p className="text-xs text-gray-500">{unreadCount} não lidas</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-blue-600 font-medium flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Check size={12} />
            Marcar tudo
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('todas')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'todas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('naolidas')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'naolidas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
        >
          Não lidas {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => toggleRead(n.id)}
              className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex items-start gap-3 ${n.read ? 'border-gray-100' : 'border-blue-200 shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                <n.icon size={18} className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm ${n.read ? 'text-gray-900' : 'text-gray-900 font-bold'}`}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500">{n.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
