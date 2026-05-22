import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, MessageSquare, BookOpen, Mail, Search } from 'lucide-react';

export default function Ajuda() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'Como funciona o agendamento?', a: 'Você pode agendar cortes diretamente com barbeiros próximos através do mapa. Selecione o barbeiro, escolha o horário e confirme.' },
    { q: 'O que são batalhas (duelos)?', a: 'Duelos são competições ao vivo entre barbeiros. Cada um corta em tempo real e os usuários votam no melhor resultado.' },
    { q: 'Como funciona o sistema de pontos?', a: 'Você ganha XP ao agendar cortes, participar de duelos e avaliar barbeiros. Quanto mais XP, maior seu nível e ranking.' },
    { q: 'Posso cancelar um agendamento?', a: 'Sim, você pode cancelar até 1 hora antes do horário marcado sem custos. Cancelamentos em cima da hora podem gerar penalidades.' },
    { q: 'Como me tornar um barbeiro na plataforma?', a: 'Cadastre-se como barbeiro, preencha suas especialidades e horários, e aguarde a aprovação da moderação.' },
    { q: 'O Battle Barber é gratuito?', a: 'Sim, o cadastro e uso básico são gratuitos. Recursos premium como destaques no mapa podem ser adquiridos separadamente.' },
  ];

  const contacts = [
    { icon: MessageSquare, label: 'Chat ao Vivo', desc: 'Seg-Sex, 9h às 18h', available: true },
    { icon: Mail, label: 'E-mail', desc: 'Respondemos em até 24h', available: true },
    { icon: BookOpen, label: 'Central de Ajuda', desc: 'Documentação completa', available: true },
  ];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Ajuda & Suporte</h1>
          <p className="text-xs text-gray-500">Tire suas dúvidas</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar ajuda..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {contacts.map((c) => (
          <button key={c.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-gray-200 transition-colors text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <c.icon size={16} className="text-blue-600" />
            </div>
            <p className="text-[11px] font-semibold text-gray-900">{c.label}</p>
            <p className="text-[8px] text-gray-400 mt-0.5">{c.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <HelpCircle size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Perguntas Frequentes</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-4">
        <p className="text-[10px] text-gray-300 font-orbitron tracking-wider">Battle Barber League 2026</p>
      </div>
    </div>
  );
}
