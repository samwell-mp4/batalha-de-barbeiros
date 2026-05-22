import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, User, Bell, Lock, Palette, Globe, Camera, ChevronRight } from 'lucide-react';

export default function Configuracoes() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Conta',
      items: [
        { icon: User, label: 'Editar Perfil', desc: 'Nome, foto, bio', to: '/app/profile' },
        { icon: Lock, label: 'Privacidade', desc: 'Quem pode ver seu perfil', to: '/app/seguranca' },
        { icon: Bell, label: 'Notificações', desc: 'Gerenciar alertas', to: '/app/notificacoes' },
      ]
    },
    {
      title: 'Aparência',
      items: [
        { icon: Palette, label: 'Tema', desc: 'Claro, escuro, automático', to: '/app/aparencia' },
        { icon: Globe, label: 'Idioma', desc: 'Português (Brasil)', to: '/app/configuracoes' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { icon: Camera, label: 'Galeria & Mídia', desc: 'Gerenciar fotos e vídeos', to: '/app/configuracoes' },
        { icon: Settings, label: 'Preferências', desc: 'Configurações avançadas', to: '/app/configuracoes' },
      ]
    },
  ];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Configurações</h1>
          <p className="text-xs text-gray-500">Personalize sua experiência</p>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 font-orbitron">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <item.icon size={15} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-300 font-orbitron tracking-wider">Battle Barber League 2026</p>
      </div>
    </div>
  );
}
