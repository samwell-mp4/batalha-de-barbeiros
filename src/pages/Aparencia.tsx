import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, Check } from 'lucide-react';

export default function Aparencia() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState('blue');

  const themes = [
    { id: 'light' as const, icon: Sun, label: 'Claro', desc: 'Tema claro padrão' },
    { id: 'dark' as const, icon: Moon, label: 'Escuro', desc: 'Tema escuro' },
    { id: 'system' as const, icon: Monitor, label: 'Sistema', desc: 'Acompanha o sistema' },
  ];

  const colors = [
    { id: 'blue', bg: 'bg-blue-600' },
    { id: 'violet', bg: 'bg-violet-600' },
    { id: 'emerald', bg: 'bg-emerald-600' },
    { id: 'amber', bg: 'bg-amber-500' },
    { id: 'rose', bg: 'bg-rose-600' },
    { id: 'cyan', bg: 'bg-cyan-600' },
  ];

  const fontSize = 16;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Aparência</h1>
          <p className="text-xs text-gray-500">Personalize o visual do app</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Tema</h3>
        </div>
        <div className="p-4 space-y-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                theme === t.id ? 'border-blue-200 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <t.icon size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </div>
              {theme === t.id && <Check size={18} className="text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Cor de Destaque</h3>
        </div>
        <div className="p-5">
          <div className="flex gap-3 justify-center">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setAccentColor(c.id)}
                className={`w-10 h-10 rounded-xl ${c.bg} transition-all ${
                  accentColor === c.id ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Fonte</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tamanho da fonte: {fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">A</span>
            <input type="range" min="12" max="24" defaultValue="16" className="flex-1 accent-blue-600" />
            <span className="text-lg text-gray-400">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
