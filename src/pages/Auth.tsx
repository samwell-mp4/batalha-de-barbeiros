import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Scissors, Mail, Lock, MapPin, ChevronRight,
  ChevronLeft, Check, Target, Rocket, ChevronDown, Clock
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
    setLoading(true);
    try {
      // Limpa qualquer lixo anterior antes de tentar logar
      localStorage.removeItem('user');

      const response = await api.login(form.email, form.password);

      if (response && response.id) {
        localStorage.setItem('user', JSON.stringify(response));
        // Pequeno delay para garantir que o storage foi gravado antes do refresh
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 100);
      } else {
        throw new Error('Resposta do servidor inválida');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      alert(error.response?.data?.error || 'E-mail não encontrado ou erro no servidor. Verifique os dados ou crie uma nova conta.');
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

      // Salva dados básicos para o guia de boas-vindas
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('justRegistered', 'true');

      // Vai direto para o mapa/home após o sucesso
      navigate('/');
      window.location.reload(); // Garante que o estado global seja limpo
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      const msg = error.response?.data?.error || error.message || 'Erro ao criar conta. Tente novamente.';
      alert(`ERRO NO CADASTRO: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepRole = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-950 font-orbitron uppercase tracking-tighter">Escolha seu Perfil</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Como você deseja utilizar a plataforma?</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setForm({ ...form, role: 'CLIENT' })}
          className={`p-8 rounded-[40px] border-4 transition-all flex items-center space-x-6 ${form.role === 'CLIENT' ? 'border-blue-600 bg-blue-50 shadow-2xl' : 'border-gray-100 bg-white opacity-60'}`}
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${form.role === 'CLIENT' ? 'bg-blue-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}>
            <User size={40} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-black text-blue-950 font-orbitron uppercase">Cliente</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Encontrar profissionais e agendar serviços</p>
          </div>
        </button>
        <button
          onClick={() => setForm({ ...form, role: 'BARBER' })}
          className={`p-8 rounded-[40px] border-4 transition-all flex items-center space-x-6 ${form.role === 'BARBER' ? 'border-blue-600 bg-blue-50 shadow-2xl' : 'border-gray-100 bg-white opacity-60'}`}
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${form.role === 'BARBER' ? 'bg-blue-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}>
            <Scissors size={40} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-black text-blue-950 font-orbitron uppercase">Profissional</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Gerenciar agenda e participar da liga</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStepBasic = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-950 font-orbitron uppercase tracking-tighter">Dados Pessoais</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Suas informações básicas de contato</p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
          <input
            type="text"
            placeholder="NOME COMPLETO"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm">TEL</div>
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            maxLength={15}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
          <input
            type="email"
            placeholder="EMAIL DE CONTATO"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
          <input
            type="password"
            placeholder="CRIAR SENHA"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );

  const renderStepLocation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-950 font-orbitron uppercase tracking-tighter">Localização</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Onde você quer encontrar um barbeiro? </p>
      </div>
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value, city: '' })}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-4 px-6 font-black uppercase text-[10px] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 appearance-none"
            >
              <option value="">ESTADO (UF)</option>
              {states.map(s => (
                <option key={s.sigla} value={s.sigla}>{s.nome}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="relative">
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              disabled={!form.state}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-4 px-6 font-black uppercase text-[10px] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 appearance-none disabled:opacity-50"
            >
              <option value="">CIDADE</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="SEU BAIRRO"
            value={form.neighborhood}
            onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-4 px-6 font-black uppercase text-xs focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>

        {form.role === 'BARBER' && (
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="ENDEREÇO / RUA"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="col-span-2 w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-4 px-6 font-black uppercase text-xs focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Nº"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              className="col-span-1 w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-4 px-6 font-black uppercase text-xs focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
            />
          </div>
        )}
      </div>
      <div className="relative rounded-[32px] overflow-hidden border border-gray-100 shadow-xl bg-white p-2">
        <div style={{ height: '240px', width: '100%' }} className="rounded-[24px] overflow-hidden z-0">
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
        <div className="p-4 flex items-center justify-between bg-gray-50/50 rounded-b-[24px] border-t border-gray-100">
          <div className="flex flex-col text-left">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Coordenadas QG</span>
            <p className="text-[9px] font-black text-blue-950 uppercase tracking-wider">
              {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
            </p>
          </div>
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center space-x-1 active:scale-95 transition-transform shadow-md shadow-blue-100"
          >
            {isLocating ? (
              <>
                <div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <MapPin size={10} />
                <span>Minha Posição</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepSocial = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-950 font-orbitron italic uppercase tracking-tighter">Conexões de Elite</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Suas redes para atrair novos desafios</p>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
          <input
            type="text"
            placeholder="NOME DA SUA BARBEARIA"
            value={form.barberShop}
            onChange={(e) => setForm({ ...form, barberShop: e.target.value })}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-lg">@</div>
          <input
            type="text"
            placeholder="INSTAGRAM (EX: SEUNOME)"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value.toLowerCase().replace('@', '') })}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
          {form.instagram.length > 2 && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 animate-pulse">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-spin border-2 border-white border-t-transparent" />
              <span className="text-[8px] font-black text-blue-600 uppercase">Validando @{form.instagram}</span>
            </div>
          )}
        </div>
        {form.instagram.length > 3 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-3xl border border-blue-50 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-0.5">
              <div className="w-full h-full bg-white rounded-full p-0.5">
                <img src={`https://unavatar.io/instagram/${form.instagram}`} className="w-full h-full rounded-full object-cover" onError={(e: any) => e.target.src = 'https://ui-avatars.com/api/?name=' + form.instagram} alt="profile" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-950 uppercase tracking-tighter">@{form.instagram}</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase">Perfil Detectado na Rede</p>
            </div>
          </motion.div>
        )}
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm">WPP</div>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
            maxLength={15}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 font-black uppercase text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );

  const renderStepProfessional = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-black text-blue-950 font-orbitron uppercase tracking-tighter">Especialidades</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Selecione suas habilidades ({form.specialties.length})</p>
      </div>

      {/* Categorias - Paginadas/Slider */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
        <div className="flex space-x-2 min-w-max px-1">
          {Object.keys(allServices).map(category => (
            <button
              key={category}
              onClick={() => setActiveServiceTab(category)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeServiceTab === category ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Serviços por Categoria */}
      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar border-y border-gray-50 py-4">
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
            className={`flex items-center justify-between p-5 rounded-[25px] font-bold text-xs uppercase transition-all ${form.specialties.includes(spec) ? 'bg-blue-50 border-2 border-blue-600 text-blue-950' : 'bg-gray-50 border-2 border-transparent text-gray-400'}`}
          >
            <span className="text-left leading-tight">{spec}</span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${form.specialties.includes(spec) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>
              {form.specialties.includes(spec) && <Check size={14} strokeWidth={4} />}
            </div>
          </button>
        ))}
      </div>

      {/* Horário de Funcionamento Semanal */}
      <div className="mt-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock size={20} /></div>
          <div>
            <h3 className="text-sm font-black text-blue-950 uppercase italic tracking-tight">Horários de Atendimento</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Defina sua jornada semanal</p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(form.schedule).map(([day, data]: [string, any]) => (
            <div key={day} className={`p-4 rounded-[25px] border-2 transition-all flex items-center justify-between ${data.active ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setForm({
                    ...form,
                    schedule: { ...form.schedule, [day]: { ...data, active: !data.active } }
                  })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${data.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-gray-200 text-gray-300'}`}
                >
                  <span className="text-[10px] font-black">{day}</span>
                </button>
                {data.active ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={data.start}
                      onChange={(e) => setForm({
                        ...form,
                        schedule: { ...form.schedule, [day]: { ...data, start: e.target.value } }
                      })}
                      className="w-16 bg-gray-50 border-none rounded-lg py-1 px-2 text-[10px] font-black text-center text-blue-950"
                    />
                    <span className="text-[10px] font-bold text-gray-300">às</span>
                    <input
                      type="text"
                      value={data.end}
                      onChange={(e) => setForm({
                        ...form,
                        schedule: { ...form.schedule, [day]: { ...data, end: e.target.value } }
                      })}
                      className="w-16 bg-gray-50 border-none rounded-lg py-1 px-2 text-[10px] font-black text-center text-blue-950"
                    />
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-gray-300 uppercase italic">Fechado</span>
                )}
              </div>
              {data.active && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>

      <textarea
        placeholder="BIO PROFISSIONAL / SLOGAN"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 px-6 font-black uppercase text-[10px] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none min-h-[80px] resize-none text-blue-950 placeholder-gray-400 mt-6"
      />
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl shadow-green-200">
        <Rocket size={60} strokeWidth={3} />
      </motion.div>
      <div>
        <h2 className="text-4xl font-black text-blue-950 font-orbitron italic uppercase tracking-tighter">PRONTO PARA A GUERRA!</h2>
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-4">Sua conta foi criada com sucesso na elite dos barbeiros.</p>
      </div>
      <button
        onClick={() => navigate('/profile')}
        className="w-full py-6 bg-blue-600 text-white rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3"
      >
        <span>ENTRAR NA ARENA</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* MODO TOGGLE */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-8 relative z-10 w-full max-w-[300px]">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
        >
          Entrar
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
        >
          Criar Conta
        </button>
      </div>

      <div className="bg-white rounded-[60px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.08)] relative z-10 border border-gray-100 w-full max-w-md">
        {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 rounded-[60px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>}

        {mode === 'login' ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-blue-950 font-orbitron uppercase tracking-tighter">Bem-vindo de Volta</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Acesse sua conta na Arena</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1 mb-2 block text-center">Digite seu E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                  <input
                    type="email"
                    placeholder="EXEMPLO@EMAIL.COM"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[30px] py-6 pl-16 pr-6 font-black uppercase text-[12px] focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-blue-950 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-6 bg-blue-600 text-white rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3"
            >
              <span>Acessar Arena</span>
              <Rocket size={20} />
            </button>
          </div>
        ) : (
          <>
            {step !== 'success' && (
              <div className="flex items-center justify-between mb-12">
                <button
                  onClick={handleBack}
                  disabled={step === 'role'}
                  className={`p-4 rounded-2xl bg-gray-50 text-blue-950 transition-all ${step === 'role' ? 'opacity-0' : 'opacity-100 active:scale-95'}`}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex space-x-2">
                  {['role', 'basic', 'location', form.role === 'BARBER' ? 'social' : null, form.role === 'BARBER' ? 'professional' : null].filter(Boolean).map((s, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-blue-600 shadow-lg shadow-blue-100' : 'w-2 bg-gray-100'}`} />
                  ))}
                </div>
                <div className="w-12" />
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
              <div className="mt-12">
                <button
                  onClick={handleNext}
                  className="w-full py-6 bg-blue-600 text-white rounded-[30px] font-black uppercase italic tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3"
                >
                  <span>{step === 'professional' || (step === 'location' && form.role === 'CLIENT') ? 'Finalizar Cadastro' : 'Próximo Passo'}</span>
                  <ChevronRight size={20} />
                </button>
                <p className="text-center mt-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Passo {step === 'role' ? 1 : step === 'basic' ? 2 : step === 'location' ? 3 : step === 'social' ? 4 : 5} de {form.role === 'BARBER' ? 5 : 3}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-blue-950/20 uppercase tracking-[0.4em] italic font-orbitron">Battle Barber League 2026</p>
      </div>
    </div>
  );
}
