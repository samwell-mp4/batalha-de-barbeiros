import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, CreditCard, Download } from 'lucide-react';

export default function Financeiro() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Faturamento do Mês', value: 'R$ 4.280,00', change: '+12%', positive: true },
    { label: 'Agendamentos', value: '32', change: '+8%', positive: true },
    { label: 'Taxa de Conversão', value: '78%', change: '-3%', positive: false },
    { label: 'Ticket Médio', value: 'R$ 89,90', change: '+5%', positive: true },
  ];

  const history = [
    { date: '15 Mai', desc: 'Corte Degradê - João S.', value: 'R$ 55,00', type: 'income' },
    { date: '15 Mai', desc: 'Barba Completa - Pedro A.', value: 'R$ 35,00', type: 'income' },
    { date: '14 Mai', desc: 'Hidratação - Maria C.', value: 'R$ 45,00', type: 'income' },
    { date: '12 Mai', desc: 'Saques Realizados', value: 'R$ 200,00', type: 'outcome' },
    { date: '10 Mai', desc: 'Corte + Barba - Lucas F.', value: 'R$ 70,00', type: 'income' },
  ];

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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-blue-100 text-xs font-medium">Saldo Disponível</span>
          <CreditCard size={16} className="text-blue-200" />
        </div>
        <div className="text-3xl font-bold mb-3">R$ 1.280,00</div>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-white/20 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors">Sacar</button>
          <button className="flex-1 py-2.5 bg-white/20 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors">Extrato</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {s.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{s.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Histórico</h3>
          <button className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <Download size={12} />
            Exportar
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <DollarSign size={14} className={h.type === 'income' ? 'text-emerald-600' : 'text-red-500'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.desc}</p>
                  <p className="text-[10px] text-gray-400">{h.date}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${h.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                {h.type === 'income' ? '+' : '-'}{h.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
