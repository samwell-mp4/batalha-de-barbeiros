import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Scissors, Mail, Lock, MapPin, ChevronRight,
  ChevronLeft, Check, Target, Rocket, ChevronDown, Clock,
  Bell, Calendar, Trophy, MessageSquare, Heart, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16);
  }, [position, map]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    }
  });

  return (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        }
      }}
    />
  );
}

type AuthStep = 'role' | 'basic' | 'location' | 'social' | 'professional' | 'success';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<AuthStep>('role');
  const [form, setForm] = useState({
    role: 'CLIENT',
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    state: '',
    address: '',
    number: '',
    neighborhood: '',
    latitude: -23.525,
    longitude: -46.522,
    instagram: '',
    whatsapp: '',
    barberShop: '',
    specialties: [] as string[],
    workingHours: '09:00 - 19:00',
    schedule: {
      'Seg': { active: true, start: '09:00', end: '19:00' },
      'Ter': { active: true, start: '09:00', end: '19:00' },
      'Qua': { active: true, start: '09:00', end: '19:00' },
      'Qui': { active: true, start: '09:00', end: '19:00' },
      'Sex': { active: true, start: '09:00', end: '19:00' },
      'Sáb': { active: true, start: '09:00', end: '16:00' },
      'Dom': { active: false, start: '09:00', end: '12:00' },
    },
    bio: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [states, setStates] = useState<{ sigla: string, nome: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; icon: any; title: string; desc: string; color: string }[]>([]);
  const [toastIdx, setToastIdx] = useState(0);

  const TOASTS = [
    { icon: Calendar, title: 'Novo Agendamento', desc: 'João Silva confirmou — Corte Degradê às 14h', color: 'text-emerald-600' },
    { icon: Trophy, title: 'Desafio Recebido', desc: 'Corte Premium te desafiou para uma batalha 1x1!', color: 'text-amber-600' },
    { icon: Heart, title: 'Novo Seguidor', desc: 'Maria Santos começou a seguir você', color: 'text-rose-600' },
    { icon: MessageSquare, title: 'Mensagem Recebida', desc: 'Pedro Alves: "Tem horário amanhã às 10h?"', color: 'text-blue-600' },
    { icon: Star, title: 'Avaliação Recebida', desc: 'Carlos Lima te avaliou com 5 estrelas ⭐', color: 'text-yellow-600' },
    { icon: Bell, title: 'Lembrete', desc: 'Você tem um agendamento em 30 minutos!', color: 'text-violet-600' },
  ];

  useEffect(() => {
    // Carregar Estados do IBGE
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data.map((s: any) => ({ sigla: s.sigla, nome: s.nome }))));
  }, []);

  useEffect(() => {
    if (form.state) {
      // Carregar Cidades do Estado selecionado
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.state}/municipios?orderBy=nome`)
        .then(res => res.json())
        .then(data => setCities(data.map((c: any) => c.nome)));
    }
  }, [form.state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const toast = TOASTS[toastIdx % TOASTS.length];
      const id = Date.now();
      setNotifications(prev => [...prev.slice(-2), { ...toast, id }]);
      setToastIdx(i => i + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [toastIdx]);

  const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const detectLocation = () => {
    if (isLocating) return;
    if ("geolocation" in navigator) {
      setIsLocating(true);
      const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setForm(prev => ({ ...prev, latitude, longitude }));

          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();

            if (data.address) {
              const detectedState = data.address.state || '';
              const detectedCity = data.address.city || data.address.town || data.address.village || '';

              // Tenta encontrar a sigla do estado pelo nome
              const stateObj = states.find(s =>
                s.nome.toLowerCase() === detectedState.toLowerCase() ||
                s.sigla.toLowerCase() === detectedState.toLowerCase()
              );

              setForm(prev => ({
                ...prev,
                state: stateObj ? stateObj.sigla : prev.state,
                city: detectedCity,
                address: data.address.road || '',
                neighborhood: data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.village || '',
              }));
              alert("Endereço localizado com sucesso!");
            }
          } catch (error) {
            console.error("Erro ao buscar endereço:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          setIsLocating(false);
          console.error("Erro GPS:", error);
          alert("Não conseguimos obter sua localização exata. Por favor, preencha manualmente.");
        },
        options
      );
    } else {
      alert("Seu navegador não suporta geolocalização.");
    }
  };

  const updateCoordsAndReverseGeocode = async (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.address) {
        const detectedState = data.address.state || '';
        const detectedCity = data.address.city || data.address.town || data.address.village || '';
        
        // Find state abbreviation if available
        const stateObj = states.find(s =>
          s.nome.toLowerCase() === detectedState.toLowerCase() ||
          s.sigla.toLowerCase() === detectedState.toLowerCase()
        );

        setForm(prev => ({
          ...prev,
          state: stateObj ? stateObj.sigla : prev.state,
          city: detectedCity || prev.city,
          address: data.address.road || prev.address,
          neighborhood: data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.village || prev.neighborhood,
        }));
      }
    } catch (e) {
      console.error("Erro no reverse geocoding do pin:", e);
    }
  };

  // Forward-geocoding debounced trigger when address changes
  useEffect(() => {
    if (!form.address && !form.city) return;
    
    const delayDebounceFn = setTimeout(async () => {
      const query = `${form.address || ''}, ${form.number || ''}, ${form.neighborhood || ''}, ${form.city || ''}, ${form.state || ''}, Brasil`;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setForm(prev => ({
            ...prev,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
          }));
        }
      } catch (error) {
        console.error("Erro no forward-geocoding:", error);
      }
    }, 1200); // 1.2s debounce to avoid spamming Nominatim API

    return () => clearTimeout(delayDebounceFn);
  }, [form.address, form.number, form.neighborhood, form.city, form.state]);

  const [activeServiceTab, setActiveServiceTab] = useState('Masculino');

  const allServices = {
    'Masculino': ['Corte Masculino Tradicional', 'Degradê (Fade)', 'Low Fade', 'Mid Fade', 'High Fade', 'Skin Fade', 'Navalhado', 'Social', 'Americano', 'Corte Militar', 'Corte Infantil', 'Corte Juvenil', 'Corte Tesoura', 'Undercut', 'Mullet', 'Buzz Cut', 'Freestyle', 'Moicano', 'Razor Part', 'Disfarçado', 'Corte Cacheado', 'Corte Afro', 'Corte Longo Masculino', 'Corte Premium', 'Corte + Lavagem'],
    'Barba': ['Barba Simples', 'Barba Completa', 'Barba Desenhada', 'Barba Navalhada', 'Acabamento Barba', 'Pigmentação Barba', 'Barba Premium', 'Hidratação Barba', 'Relaxamento Barba', 'Sobrancelha Masculina', 'Bigode', 'Bigode Modelado'],
    'Pigmentação': ['Pigmentação Capilar', 'Pigmentação Barba', 'Disfarce Branco', 'Pigmentação Freestyle', 'Contorno Pigmentado'],
    'Tratamentos': ['Hidratação', 'Nutrição', 'Reconstrução', 'Detox Capilar', 'Selagem', 'Progressiva Masculina', 'Relaxamento', 'Cauterização', 'Cronograma Capilar', 'Terapia Capilar', 'Tratamento Anticaspa', 'Tratamento Queda', 'Spa Capilar'],
    'Premium': ['Corte VIP', 'Atendimento Exclusivo', 'Corte em Domicílio', 'Corte Express', 'Corte + Bebida', 'Corte + Massagem', 'Corte Premium Experience', 'Atendimento Executivo'],
    'Sobrancelha': ['Sobrancelha Navalhada', 'Sobrancelha Masculina', 'Design Sobrancelha', 'Risquinho', 'Freestyle Sobrancelha'],
    'Artístico': ['Risco Navalhado', 'Freestyle Artístico', 'Tribal', 'Desenho Capilar', 'Corte Criativo', 'Corte Colorido', 'Corte Competição'],
    'Química': ['Platinado', 'Luzes', 'Nevou', 'Coloração', 'Descoloração', 'Matização', 'Progressiva', 'Relaxamento', 'Permanente'],
    'Feminino': ['Corte Feminino', 'Corte Longo', 'Corte Médio', 'Corte Curto', 'Corte Repicado', 'Corte Chanel', 'Corte em Camadas', 'Franja', 'Corte Infantil Feminino', 'Escova Simples', 'Escova Modelada', 'Escova Lisa', 'Escova Babyliss', 'Escova Progressiva', 'Escova Premium', 'Tintura', 'Retoque Raiz', 'Mechas', 'Luzes', 'Morena Iluminada', 'Balayage', 'Ombré Hair', 'Ruivo', 'Preto Intenso', 'Loiro Global'],
    'Estética': ['Maquiagem', 'Maquiagem Social', 'Maquiagem Noiva', 'Limpeza de Pele', 'Design Sobrancelha', 'Cílios', 'Henna', 'Depilação Facial', 'Mega Hair', 'Alongamento', 'Aplique', 'Trança Nagô', 'Box Braids', 'Lace', 'Crochet Braids'],
    'Competição': ['Melhor Fade', 'Melhor Barba', 'Melhor Transformação', 'Melhor Freestyle', 'Melhor Acabamento', 'Melhor Pigmentação', 'Melhor Técnica Tesoura', 'Melhor Corte Infantil', 'Melhor Corte Criativo', 'Melhor Degradê', 'Melhor Platinado', 'Melhor Antes/Depois', 'Melhor Vídeo Transformação', 'Melhor Corte Regional', 'Melhor Corte da Semana', 'Corte Mais Votado', 'Rei do Fade', 'Mestre da Navalha', 'Campeão da Barba', 'Lenda Regional', 'MVP da Temporada']
  };

  const handleNext = () => {
    if (step === 'basic') {
      if (form.name.length <= 3) {
        alert("Por favor, digite seu nome completo.");
        return;
      }
      if (!form.email.includes('@')) {
        alert("E-mail inválido.");
        return;
      }
      if (form.phone.length < 14) {
        alert("Telefone incompleto. Use o formato (00) 00000-0000");
        return;
      }
      if (form.password.length < 6) {
        alert("Senha muito fraca! Use no mínimo 6 caracteres.");
        return;
      }
    }

    if (step === 'location') {
      if (form.city.length < 2 || form.state.length < 2) {
        alert("Por favor, preencha sua cidade e estado.");
        return;
      }

      if (form.role === 'BARBER') {
        if (form.neighborhood.length < 2) {
          alert("O bairro é obrigatório.");
          return;
        }
        if (form.address.length < 2) {
          alert("O endereço/rua é obrigatório para profissionais.");
          return;
        }
        if (!form.number) {
          alert("O número do endereço é obrigatório para profissionais.");
          return;
        }
      } else {
        if (form.neighborhood.length < 2) {
          alert("Por favor, informe seu bairro.");
          return;
        }
      }
    }

    if (step === 'social' && form.role === 'BARBER') {
      if (form.barberShop.length < 2) {
        alert("Informe o nome da sua barbearia.");
        return;
      }
      if (form.instagram.length < 2) {
        alert("Informe seu Instagram profissional.");
        return;
      }
      if (form.whatsapp.length < 14) {
        alert("WhatsApp incompleto. Use o formato (00) 00000-0000");
        return;
      }
    }

    if (step === 'role') setStep('basic');
    else if (step === 'basic') setStep('location');
    else if (step === 'location') {
      if (form.role === 'BARBER') setStep('social');
      else handleRegister();
    }
    else if (step === 'social') setStep('professional');
    else if (step === 'professional') handleRegister();
  };

  const handleBack = () => {
    if (step === 'basic') setStep('role');
    else if (step === 'location') setStep('basic');
    else if (step === 'social') setStep('location');
    else if (step === 'professional') setStep('social');
  };

  const handleLogin = async () => {
    if (!form.email) return alert('Por favor, digite seu e-mail de acesso.');
    if (!form.password) return alert('Por favor, digite sua senha de acesso.');
    setLoading(true);
    try {
      // Limpa qualquer lixo anterior antes de tentar logar
      localStorage.removeItem('user');

      const response = await api.login(form.email, form.password);
      const userData = response.user || response;
      const token = response.token;

      if (userData && userData.id) {
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) localStorage.setItem('token', token);
        // Pequeno delay para garantir que o storage foi gravado antes do refresh
        setTimeout(() => {
          const redir = sessionStorage.getItem('redirectAfterAuth');
          if (redir) {
            sessionStorage.removeItem('redirectAfterAuth');
            navigate(redir);
          } else {
            navigate('/');
          }
          window.location.reload();
        }, 100);
      } else {
        throw new Error(response?.error || 'Resposta do servidor inválida');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      alert(error.message || 'E-mail não encontrado ou erro no servidor. Verifique os dados ou crie uma nova conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.email || !form.password) {
      alert("Por favor, preencha pelo menos e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.register({
        ...form,
        whatsapp: form.phone, // Mapeia phone para whatsapp para o banco
        schedule: JSON.stringify(form.schedule)
      });
      const userData = response.user || response;
      const token = response.token;

      if (userData && userData.id) {
        // Salva dados básicos para o guia de boas-vindas
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) localStorage.setItem('token', token);
        localStorage.setItem('justRegistered', 'true');

        // Vai direto para o mapa/home após o sucesso
        const redir = sessionStorage.getItem('redirectAfterAuth');
        if (redir) {
          sessionStorage.removeItem('redirectAfterAuth');
          navigate(redir);
        } else {
          navigate('/');
        }
        window.location.reload(); // Garante que o estado global seja limpo
      } else {
        throw new Error(response?.error || 'Resposta do servidor inválida');
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      const msg = error.message || 'Erro ao criar conta. Tente novamente.';
      alert(`ERRO NO CADASTRO: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepRole = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Escolha seu Perfil</h2>
        <p className="text-sm text-gray-500 mt-1.5">Como você deseja usar a plataforma?</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => setForm({ ...form, role: 'CLIENT' })}
          className={`group p-5 rounded-2xl border-2 transition-all flex items-center gap-5 ${form.role === 'CLIENT' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${form.role === 'CLIENT' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
            <User size={26} strokeWidth={2} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900">Cliente</h3>
            <p className="text-xs text-gray-500 mt-0.5">Encontrar profissionais e agendar serviços</p>
          </div>
        </button>
        <button
          onClick={() => setForm({ ...form, role: 'BARBER' })}
          className={`group p-5 rounded-2xl border-2 transition-all flex items-center gap-5 ${form.role === 'BARBER' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${form.role === 'BARBER' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
            <Scissors size={26} strokeWidth={2} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900">Profissional</h3>
            <p className="text-xs text-gray-500 mt-0.5">Gerenciar agenda e participar da liga</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStepBasic = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Dados Pessoais</h2>
        <p className="text-sm text-gray-500 mt-1.5">Suas informações de contato</p>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">📞</div>
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            maxLength={15}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Seu e-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="Criar senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
          {form.password.length > 0 && form.password.length < 6 && (
            <p className="text-xs text-amber-600 mt-1.5 ml-1">Mínimo de 6 caracteres</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepLocation = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Localização</h2>
        <p className="text-sm text-gray-500 mt-1.5">Onde você quer encontrar um barbeiro?</p>
      </div>
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value, city: '' })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 appearance-none"
            >
              <option value="">Estado (UF)</option>
              {states.map(s => (
                <option key={s.sigla} value={s.sigla}>{s.nome}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="relative">
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              disabled={!form.state}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Cidade</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Seu bairro"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
        </div>

        {form.role === 'BARBER' && (
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Endereço / Rua"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="col-span-2 w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Nº"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              className="col-span-1 w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
          </div>
        )}
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
        <div style={{ height: '220px', width: '100%' }} className="rounded-xl overflow-hidden z-0">
          <MapContainer 
            center={[form.latitude, form.longitude]} 
            zoom={16} 
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <LocationMarker 
              position={[form.latitude, form.longitude]} 
              setPosition={(pos) => updateCoordsAndReverseGeocode(pos[0], pos[1])} 
            />
          </MapContainer>
        </div>
        <div className="p-3 flex items-center justify-between bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col text-left">
            <span className="text-xs text-gray-400">Coordenadas</span>
            <p className="text-sm font-medium text-gray-700">
              {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
            </p>
          </div>
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
          >
            {isLocating ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <MapPin size={12} />
                <span>Minha Posição</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepSocial = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Redes Profissionais</h2>
        <p className="text-sm text-gray-500 mt-1.5">Conecte suas redes para atrair clientes</p>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Nome da sua barbearia"
            value={form.barberShop}
            onChange={(e) => setForm({ ...form, barberShop: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">@</div>
          <input
            type="text"
            placeholder="Instagram (ex: seu_nome)"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value.toLowerCase().replace('@', '') })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
          {form.instagram.length > 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-medium text-blue-600">Validando @{form.instagram}</span>
            </div>
          )}
        </div>
        {form.instagram.length > 3 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px] flex-shrink-0">
              <div className="w-full h-full bg-white rounded-full p-[2px]">
                <img src={`https://unavatar.io/instagram/${form.instagram}`} className="w-full h-full rounded-full object-cover" onError={(e: any) => e.target.src = 'https://ui-avatars.com/api/?name=' + form.instagram} alt="profile" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">@{form.instagram}</p>
              <p className="text-xs text-gray-400">Perfil detectado</p>
            </div>
          </motion.div>
        )}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">💬</div>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
            maxLength={15}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );

  const renderStepProfessional = () => (
    <div className="space-y-5">
      <div className="text-center mb-3">
        <h2 className="text-2xl font-bold text-gray-900">Especialidades</h2>
        <p className="text-sm text-gray-500 mt-1.5">Selecione suas habilidades ({form.specialties.length})</p>
      </div>

      {/* Categorias - Paginadas/Slider */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
        {Object.keys(allServices).map(category => (
          <button
            key={category}
            onClick={() => setActiveServiceTab(category)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${activeServiceTab === category ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Lista de Serviços por Categoria */}
      <div className="grid grid-cols-1 gap-1.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar border-y border-gray-100 py-3">
        {(allServices as any)[activeServiceTab].map((spec: string) => (
          <button
            key={spec}
            onClick={() => {
              if (form.specialties.includes(spec)) {
                setForm({ ...form, specialties: form.specialties.filter(s => s !== spec) });
              } else {
                setForm({ ...form, specialties: [...form.specialties, spec] });
              }
            }}
            className={`flex items-center justify-between p-3.5 rounded-xl text-sm transition-all ${form.specialties.includes(spec) ? 'bg-blue-50 border border-blue-200 text-gray-900' : 'bg-gray-50 border border-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            <span className="text-left">{spec}</span>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${form.specialties.includes(spec) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>
              {form.specialties.includes(spec) && <Check size={12} strokeWidth={3} />}
            </div>
          </button>
        ))}
      </div>

      {/* Horário de Funcionamento Semanal */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Clock size={18} /></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Horários de Atendimento</h3>
            <p className="text-xs text-gray-500">Defina sua jornada semanal</p>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(form.schedule).map(([day, data]: [string, any]) => (
            <div key={day} className={`p-3 rounded-xl border transition-all flex items-center justify-between ${data.active ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-transparent opacity-55'}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({
                    ...form,
                    schedule: { ...form.schedule, [day]: { ...data, active: !data.active } }
                  })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${data.active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-300'}`}
                >
                  <span className="text-[9px] font-semibold">{day}</span>
                </button>
                {data.active ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={data.start}
                      onChange={(e) => setForm({
                        ...form,
                        schedule: { ...form.schedule, [day]: { ...data, start: e.target.value } }
                      })}
                      className="w-14 bg-gray-50 border border-gray-200 rounded-lg py-1 px-1.5 text-xs text-center text-gray-700"
                    />
                    <span className="text-xs text-gray-300">às</span>
                    <input
                      type="text"
                      value={data.end}
                      onChange={(e) => setForm({
                        ...form,
                        schedule: { ...form.schedule, [day]: { ...data, end: e.target.value } }
                      })}
                      className="w-14 bg-gray-50 border border-gray-200 rounded-lg py-1 px-1.5 text-xs text-center text-gray-700"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Fechado</span>
                )}
              </div>
              {data.active && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Bio profissional / Slogan"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none min-h-[70px] resize-none text-gray-900 placeholder-gray-400"
      />
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-200">
        <Rocket size={40} strokeWidth={2.5} />
      </motion.div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Conta Criada!</h2>
        <p className="text-sm text-gray-500 mt-2">Sua conta foi criada com sucesso. Bem-vindo à arena!</p>
      </div>
      <button
        onClick={() => navigate('/app/profile')}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <span>Entrar no App</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* BACKGROUND — clean */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-violet-100/25 via-cyan-100/20 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-100/10 to-rose-100/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-gradient-to-br from-blue-50/30 to-transparent rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[200px] h-[200px] bg-gradient-to-tl from-emerald-50/20 to-transparent rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-6 max-w-6xl mx-auto">

        {/* LEFT COLUMN — AUTH */}
        <div className="flex flex-col items-center w-full max-w-md">
          {/* MODO TOGGLE */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl mb-6 w-full max-w-[280px] shadow-sm">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Criar Conta
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 w-full">
            {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 rounded-2xl flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /></div>}

            {mode === 'login' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <User size={22} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Bem-vindo de Volta</h2>
                  <p className="text-sm text-gray-500 mt-1">Acesse sua conta</p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Sua senha"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  <span>Entrar</span>
                  <Rocket size={16} />
                </button>
              </div>
            ) : (
              <>
                {step !== 'success' && (
                  <div className="flex items-center justify-between mb-8">
                    <button
                      onClick={handleBack}
                      disabled={step === 'role'}
                      className={`p-2.5 rounded-xl transition-all ${step === 'role' ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-gray-100 active:scale-95 text-gray-600'}`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-1.5">
                      {['role', 'basic', 'location', form.role === 'BARBER' ? 'social' : null, form.role === 'BARBER' ? 'professional' : null].filter(Boolean).map((s, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-blue-600 shadow-sm' : 'w-2 bg-gray-200'}`} />
                      ))}
                    </div>
                    <div className="w-9" />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step === 'role' && renderStepRole()}
                    {step === 'basic' && renderStepBasic()}
                    {step === 'location' && renderStepLocation()}
                    {step === 'social' && renderStepSocial()}
                    {step === 'professional' && renderStepProfessional()}
                    {step === 'success' && renderSuccess()}
                  </motion.div>
                </AnimatePresence>

                {step !== 'success' && (
                  <div className="mt-8">
                    <button
                      onClick={handleNext}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>{step === 'professional' || (step === 'location' && form.role === 'CLIENT') ? 'Finalizar Cadastro' : 'Próximo Passo'}</span>
                      <ChevronRight size={16} />
                    </button>
                    <p className="text-center mt-4 text-xs text-gray-400">Passo {step === 'role' ? 1 : step === 'basic' ? 2 : step === 'location' ? 3 : step === 'social' ? 4 : 5} de {form.role === 'BARBER' ? 5 : 3}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-300 tracking-wider font-orbitron">Battle Barber League 2026</p>
          </div>
        </div>

        {/* RIGHT COLUMN — INTERACTIVE APP PREVIEW (desktop only) */}
        <div className="hidden lg:flex flex-col w-full max-w-lg gap-6 relative">
          {/* NOTIFICATION TOASTS */}
          <div className="absolute -top-2 right-0 z-20 w-72 space-y-2">
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 60, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-start gap-3"
                  style={{ zIndex: 20 - i }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color.replace('text-', 'bg-').replace('600', '50')}`}>
                    <n.icon size={16} className={n.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{n.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* LIVE MAP — realistic city style */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-[#e3ded7] mt-10">
            <div className="h-[420px] w-full relative">
              <svg className="w-full h-full" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid meet">
                {/* Base terrain */}
                <rect width="400" height="360" fill="#e3ded7" />

                {/* Park / green area */}
                <rect x="175" y="8" width="70" height="52" rx="6" fill="#c3d5b5" />
                <rect x="18" y="200" width="50" height="40" rx="5" fill="#c8d8b8" />
                <rect x="320" y="255" width="55" height="45" rx="5" fill="#c8d8b8" />
                <rect x="230" y="290" width="38" height="30" rx="4" fill="#c8d8b8" />

                {/* River */}
                <path d="M0 310 Q60 295 120 308 T220 300 T320 312 T400 305 L400 360 L0 360 Z" fill="#bad7df" opacity="0.6" />
                <path d="M0 315 Q60 300 120 313 T220 305 T320 317 T400 310" stroke="#9bc4cc" strokeWidth="1.5" fill="none" opacity="0.5" />

                {/* Building blocks — residential */}
                {[
                  // Grid blocks — each rect is a "block" of buildings
                  { x: 8, y: 10, w: 28, h: 24 }, { x: 42, y: 10, w: 32, h: 24 }, { x: 80, y: 10, w: 40, h: 24 },
                  { x: 130, y: 10, w: 36, h: 24 }, { x: 256, y: 10, w: 34, h: 24 }, { x: 298, y: 10, w: 36, h: 24 }, { x: 342, y: 10, w: 48, h: 24 },
                  { x: 8, y: 45, w: 28, h: 28 }, { x: 42, y: 45, w: 32, h: 28 }, { x: 80, y: 45, w: 40, h: 28 },
                  { x: 130, y: 45, w: 36, h: 28 }, { x: 256, y: 45, w: 34, h: 28 }, { x: 298, y: 45, w: 36, h: 28 }, { x: 342, y: 45, w: 48, h: 28 },
                  { x: 8, y: 88, w: 28, h: 30 }, { x: 42, y: 88, w: 32, h: 30 }, { x: 80, y: 88, w: 40, h: 30 },
                  { x: 130, y: 88, w: 36, h: 30 }, { x: 256, y: 88, w: 34, h: 30 }, { x: 298, y: 88, w: 36, h: 30 }, { x: 342, y: 88, w: 48, h: 30 },
                  { x: 8, y: 135, w: 28, h: 28 }, { x: 42, y: 135, w: 32, h: 28 },
                  { x: 130, y: 135, w: 36, h: 28 }, { x: 256, y: 135, w: 34, h: 28 }, { x: 298, y: 135, w: 36, h: 28 },
                  { x: 8, y: 175, w: 28, h: 24 }, { x: 42, y: 175, w: 32, h: 24 },
                  { x: 130, y: 175, w: 36, h: 24 }, { x: 256, y: 175, w: 34, h: 24 }, { x: 298, y: 175, w: 36, h: 24 },
                  { x: 342, y: 135, w: 48, h: 64 },
                  { x: 8, y: 250, w: 28, h: 28 }, { x: 42, y: 250, w: 32, h: 28 }, { x: 80, y: 250, w: 40, h: 28 },
                  { x: 130, y: 250, w: 36, h: 28 }, { x: 256, y: 250, w: 34, h: 28 }, { x: 298, y: 250, w: 36, h: 28 },
                  { x: 80, y: 288, w: 40, h: 24 }, { x: 130, y: 288, w: 36, h: 24 },
                  { x: 8, y: 288, w: 28, h: 24 }, { x: 42, y: 288, w: 32, h: 24 },
                  { x: 298, y: 288, w: 36, h: 24 },
                  { x: 342, y: 288, w: 48, h: 24 },
                ].map((b, i) => (
                  <rect key={`block${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="#dbd6cd" stroke="#d1ccc3" strokeWidth="0.5" />
                ))}

                {/* Major avenues - wide */}
                <rect x="0" y="78" width="400" height="3" fill="#e8e4dc" />
                <rect x="0" y="128" width="400" height="2.5" fill="#e8e4dc" />
                <rect x="0" y="170" width="400" height="3" fill="#e8e4dc" />
                <rect x="0" y="246" width="400" height="2.5" fill="#e8e4dc" />
                <rect x="76" y="0" width="2.5" height="360" fill="#e8e4dc" />
                <rect x="174" y="0" width="3" height="360" fill="#e8e4dc" />
                <rect x="252" y="0" width="2.5" height="360" fill="#e8e4dc" />
                <rect x="342" y="0" width="2" height="360" fill="#e8e4dc" />

                {/* Minor streets - thin */}

                {/* Horizontal minor streets */}
                {[38, 120, 158, 210, 240, 280, 320, 335].map(y => (
                  <rect key={`hstr${y}`} x="0" y={y} width="400" height="1" fill="rgba(255,255,255,0.35)" />
                ))}

                {/* Vertical minor streets */}
                {[38, 120, 220, 295, 370].map(x => (
                  <rect key={`vstr${x}`} x={x} y="0" width="1" height="360" fill="rgba(255,255,255,0.35)" />
                ))}

                {/* Diagonal road */}
                <path d="M252 0 L400 130" stroke="#e8e4dc" strokeWidth="2" fill="none" />
                <path d="M252 0 L400 130" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />

                {/* Smaller inner blocks details */}
                {[
                  { x: 12, y: 14, w: 20, h: 6 }, { x: 12, y: 22, w: 7, h: 8 },
                  { x: 48, y: 14, w: 22, h: 16 },
                  { x: 86, y: 14, w: 10, h: 6 }, { x: 86, y: 22, w: 14, h: 8 }, { x: 104, y: 14, w: 12, h: 16 },
                  { x: 136, y: 14, w: 14, h: 7 }, { x: 136, y: 23, w: 8, h: 7 },
                  { x: 260, y: 14, w: 18, h: 6 }, { x: 260, y: 22, w: 10, h: 8 },
                  { x: 304, y: 14, w: 12, h: 6 }, { x: 304, y: 22, w: 12, h: 8 },
                  { x: 348, y: 14, w: 16, h: 8 }, { x: 368, y: 14, w: 12, h: 16 },
                  // more building fills for realism
                  { x: 12, y: 50, w: 8, h: 8 }, { x: 24, y: 50, w: 8, h: 12 },
                  { x: 48, y: 50, w: 10, h: 6 }, { x: 62, y: 50, w: 8, h: 10 },
                  { x: 86, y: 50, w: 12, h: 8 }, { x: 102, y: 50, w: 14, h: 6 },
                  { x: 136, y: 50, w: 10, h: 6 }, { x: 136, y: 58, w: 10, h: 8 },
                  { x: 260, y: 50, w: 12, h: 10 }, { x: 276, y: 50, w: 10, h: 6 },
                  { x: 304, y: 50, w: 14, h: 8 }, { x: 348, y: 50, w: 14, h: 10 },
                  { x: 12, y: 92, w: 10, h: 8 }, { x: 26, y: 92, w: 6, h: 12 },
                  { x: 48, y: 92, w: 12, h: 6 }, { x: 64, y: 92, w: 8, h: 10 },
                  { x: 86, y: 92, w: 14, h: 8 }, { x: 104, y: 92, w: 12, h: 6 },
                  { x: 136, y: 92, w: 10, h: 8 }, { x: 150, y: 92, w: 10, h: 6 },
                  { x: 260, y: 92, w: 14, h: 8 }, { x: 278, y: 92, w: 8, h: 10 },
                  { x: 304, y: 92, w: 12, h: 8 }, { x: 320, y: 92, w: 8, h: 6 },
                  { x: 348, y: 92, w: 16, h: 8 }, { x: 368, y: 92, w: 12, h: 10 },
                  { x: 12, y: 140, w: 20, h: 8 }, { x: 48, y: 140, w: 14, h: 10 },
                  { x: 136, y: 140, w: 12, h: 8 }, { x: 152, y: 140, w: 8, h: 10 },
                  { x: 260, y: 140, w: 16, h: 8 }, { x: 304, y: 140, w: 12, h: 10 },
                  { x: 12, y: 180, w: 12, h: 8 }, { x: 28, y: 180, w: 8, h: 6 },
                  { x: 48, y: 180, w: 14, h: 8 }, { x: 66, y: 180, w: 6, h: 10 },
                  { x: 136, y: 180, w: 14, h: 8 }, { x: 154, y: 180, w: 8, h: 6 },
                  { x: 260, y: 180, w: 12, h: 8 }, { x: 276, y: 180, w: 10, h: 6 },
                  { x: 304, y: 180, w: 14, h: 8 }, { x: 348, y: 180, w: 14, h: 10 },
                  { x: 12, y: 255, w: 10, h: 8 }, { x: 26, y: 255, w: 6, h: 12 },
                  { x: 48, y: 255, w: 12, h: 8 }, { x: 64, y: 255, w: 8, h: 10 },
                  { x: 86, y: 255, w: 14, h: 8 }, { x: 104, y: 255, w: 12, h: 6 },
                  { x: 136, y: 255, w: 10, h: 8 }, { x: 150, y: 255, w: 10, h: 6 },
                  { x: 260, y: 255, w: 14, h: 8 }, { x: 278, y: 255, w: 8, h: 10 },
                  { x: 304, y: 255, w: 12, h: 8 }, { x: 320, y: 255, w: 8, h: 6 },
                ].map((b, i) => (
                  <rect key={`bldg${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="1.5" fill="#cdc8bf" stroke="#c5c0b7" strokeWidth="0.3" />
                ))}

                {/* Labels */}
                <rect x="112" y="82" width="56" height="14" rx="4" fill="white" stroke="#d1d5db" strokeWidth="0.5" />
                <text x="140" y="93" fill="#374151" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Centro</text>
                <rect x="280" y="132" width="44" height="10" rx="3" fill="white" stroke="#d1d5db" strokeWidth="0.5" />
                <text x="302" y="140" fill="#374151" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Asa Sul</text>
                <rect x="20" y="230" width="36" height="10" rx="3" fill="white" stroke="#d1d5db" strokeWidth="0.5" />
                <text x="38" y="238" fill="#374151" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Taguá</text>

                {/* Barber pins - main */}
                <circle cx="195" cy="105" r="34" fill="rgba(59,130,246,0.11)" stroke="rgba(59,130,246,0.35)" strokeWidth="2.5">
                  <animate attributeName="r" values="34;42;34" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="195" cy="105" r="9" fill="#3b82f6" stroke="white" strokeWidth="3">
                  <animate attributeName="r" values="9;10;9" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect x="158" y="138" width="74" height="22" rx="5" fill="#3b82f6" />
                <text x="195" y="154" fill="white" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">BK ★ 4.9</text>

                <circle cx="100" cy="195" r="28" fill="rgba(16,185,129,0.11)" stroke="rgba(16,185,129,0.35)" strokeWidth="2.5">
                  <animate attributeName="r" values="28;35;28" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="195" r="7" fill="#10b981" stroke="white" strokeWidth="3" />
                <rect x="66" y="224" width="68" height="22" rx="5" fill="#10b981" />
                <text x="100" y="239" fill="white" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Corte P ★ 5.0</text>

                <circle cx="300" cy="155" r="26" fill="rgba(250,204,21,0.11)" stroke="rgba(250,204,21,0.35)" strokeWidth="2.5">
                  <animate attributeName="r" values="26;32;26" dur="3.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="155" r="7" fill="#facc15" stroke="white" strokeWidth="3" />
                <rect x="266" y="180" width="68" height="22" rx="5" fill="#facc15" />
                <text x="300" y="195" fill="#374151" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Estilo ★ 4.7</text>

                {/* Secondary pins */}
                <circle cx="45" cy="60" r="20" fill="rgba(59,130,246,0.10)" stroke="rgba(59,130,246,0.3)" strokeWidth="2" />
                <circle cx="45" cy="60" r="5" fill="#3b82f6" stroke="white" strokeWidth="2.5" />
                <circle cx="350" cy="215" r="20" fill="rgba(59,130,246,0.10)" stroke="rgba(59,130,246,0.3)" strokeWidth="2" />
                <circle cx="350" cy="215" r="5" fill="#3b82f6" stroke="white" strokeWidth="2.5" />
                <circle cx="340" cy="285" r="20" fill="rgba(168,85,247,0.10)" stroke="rgba(168,85,247,0.3)" strokeWidth="2" />
                <circle cx="340" cy="285" r="5" fill="#a855f7" stroke="white" strokeWidth="2.5" />
              </svg>

              {/* Overlay badges */}
              <div className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 rounded-lg text-xs text-white font-bold shadow-md">EXPRESS</div>
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-xs font-bold text-emerald-600">12 ONLINE</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-600"><span className="text-gray-900 font-bold">5 barbeiros</span> disponíveis próximo a você</span>
                </div>
              </div>
            </div>
          </div>

          {/* DOWNLOAD */}
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-all active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.523 12.065c.012 2.42 2.127 3.226 2.15 3.237-.017.058-.336 1.154-1.11 2.285-.668.982-1.364 1.96-2.456 1.98-1.075.02-1.42-.637-2.647-.637s-1.603.617-2.614.657c-1.08.04-1.903-1.062-2.574-2.04-1.402-2.027-2.474-5.728-1.035-8.228.714-1.24 1.992-2.023 3.38-2.043 1.055-.02 2.05.708 2.695.708.643 0 1.85-.875 3.118-.746.531.021 2.02.214 2.977 1.614-.077.046-1.777 1.038-1.758 3.095m-2.007-5.927c.56-.677.937-1.618.834-2.555-.807.032-1.784.537-2.364 1.215-.52.604-.974 1.567-.851 2.492.9.07 1.82-.457 2.38-1.152"/>
                  <path d="M11.645 0c.43.007 1.628.05 2.46.7.48.377.868.881 1.1 1.451.24.578.293 1.2.2 1.798h-.003a3.35 3.35 0 0 0-.03.12c-.63-.04-1.575-.25-2.256-.82-.65-.547-1.073-1.29-1.128-2.116a2.53 2.53 0 0 1 .133-.9c.158-.12.32-.23.523-.232z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] text-gray-400 leading-tight">Baixar para</div>
                  <div className="text-sm font-semibold leading-tight">Android</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-all active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[9px] text-gray-400 leading-tight">Baixar para</div>
                  <div className="text-sm font-semibold leading-tight">iOS</div>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">PWA — Instalação direta pelo navegador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
