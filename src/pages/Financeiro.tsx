import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, CreditCard, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Financeiro() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try { const p = JSON.parse(saved); return p?.id ? p : null; } catch { return null; }
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const result = await api.getFinanceiro(user.id);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="p-5 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = data ? [
    { label: 'Faturamento do Mês', value: `R$ ${(data.monthlyRevenue || 0).toFixed(2)}`, change: `${data.growth >= 0 ? '+' : ''}${data.growth}%`, positive: data.growth >= 0 },
    { label: 'Agendamentos', value: String(data.completedAppointments || 0), change: `${data.growth >= 0 ? '+' : ''}${data.growth}%`, positive: data.growth >= 0 },
    { label: 'Ticket Médio', value: `R$ ${(data.averageTicket || 0).toFixed(2)}`, change: '-', positive: true },
    { label: 'Pendentes', value: String(data.pendingPayments || 0), change: '', positive: false },
  ] : [];

  const history = data?.history || [];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Financeiro</h1>
          <p className="text-xs text-gray-500">Gestão financeira</p>
        </div>
      </div>

      {data ? (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-100 text-xs font-medium">Saldo Disponível</span>
              <CreditCard size={16} className="text-blue-200" />
            </div>
            <div className="text-3xl font-bold mb-3">R$ {data.balance.toFixed(2)}</div>
            <p className="text-xs text-blue-200">Receita total: R$ {data.totalRevenue.toFixed(2)} · Taxas: R$ {data.totalFees.toFixed(2)}</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                {s.change && s.change !== '-' && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{s.change}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Histórico</h3>
              <span className="text-[10px] text-gray-400">{history.length} registros</span>
            </div>
            {history.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {history.map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.type === 'income' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <DollarSign size={14} className={h.type === 'income' ? 'text-emerald-600' : 'text-amber-600'} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{h.desc}</p>
                        <p className="text-[10px] text-gray-400">{h.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${h.type === 'income' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {h.type === 'income' ? '+' : ''}R$ {h.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <DollarSign size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum atendimento concluído ainda</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <DollarSign size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Faça login como barbeiro para ver seus dados financeiros</p>
        </div>
      )}
    </div>
  );
}
