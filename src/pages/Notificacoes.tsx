import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Trophy, MessageSquare, Star, Calendar, Check, Loader2, Zap, DollarSign } from 'lucide-react';
import { api } from '../services/api';

const iconMap: Record<string, any> = {
  heart: Heart, trophy: Trophy, message: MessageSquare, star: Star, calendar: Calendar, zap: Zap, dollar: DollarSign, check: Star,
};

const colorMap: Record<string, string> = {
  heart: 'text-rose-600', trophy: 'text-amber-600', message: 'text-blue-600', star: 'text-yellow-600', calendar: 'text-emerald-600', zap: 'text-violet-600', dollar: 'text-emerald-600', check: 'text-green-600',
};

const bgMap: Record<string, string> = {
  heart: 'bg-rose-50', trophy: 'bg-amber-50', message: 'bg-blue-50', star: 'bg-yellow-50', calendar: 'bg-emerald-50', zap: 'bg-violet-50', dollar: 'bg-emerald-50', check: 'bg-green-50',
};

export default function Notificacoes() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'todas' | 'naolidas'>('todas');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readMap, setReadMap] = useState<Record<number, boolean>>({});

  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try { const p = JSON.parse(saved); return p?.id ? p : null; } catch { return null; }
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const data = await api.getNotifications(user.id);
        setNotifications(data.map((n: any, i: number) => ({ ...n, _id: i })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const notifList = notifications.map((n, i) => ({
    ...n,
    id: i,
    icon: iconMap[n.type] || Bell,
    color: colorMap[n.type] || 'text-gray-600',
    bg: bgMap[n.type] || 'bg-gray-50',
    read: readMap[i] !== undefined ? readMap[i] : !n.read,
  }));

  const filtered = filter === 'naolidas' ? notifList.filter(n => !n.read) : notifList;
  const unreadCount = notifList.filter(n => !n.read).length;

  const markAllRead = () => {
    const all: Record<number, boolean> = {};
    notifList.forEach(n => { all[n.id] = true; });
    setReadMap(all);
  };

  const toggleRead = (id: number) => {
    setReadMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="p-5 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

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
        >Todas</button>
        <button
          onClick={() => setFilter('naolidas')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'naolidas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
        >Não lidas {unreadCount > 0 && `(${unreadCount})`}</button>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n: any) => (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Nenhuma notificação encontrada</p>
        </div>
      )}
    </div>
  );
}

function Bell(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
}