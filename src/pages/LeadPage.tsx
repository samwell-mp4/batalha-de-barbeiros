import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, ChevronRight, Shield, CheckCircle, Clock,
  ExternalLink, Award, Scissors, Calendar, Sparkles,
  ArrowRight, Store, Navigation, Users
} from 'lucide-react';

const COMMON_SERVICES = [
  { name: 'Corte Masculino', icon: Scissors },
  { name: 'Corte Degradê', icon: Scissors },
  { name: 'Barba', icon: Scissors },
  { name: 'Corte Infantil', icon: Scissors },
  { name: 'Hot Towel', icon: Sparkles },
  { name: 'Barboterapia', icon: Sparkles },
  { name: 'Design Capilar', icon: Scissors },
  { name: 'Hidratação', icon: Sparkles },
  { name: 'Corte Navalhado', icon: Scissors },
  { name: 'Sobrancelha', icon: Scissors },
];

const WEEK_SCHEDULE = [
  { day: 'Segunda-feira', hours: '09:00 - 19:00' },
  { day: 'Terça-feira', hours: '09:00 - 19:00' },
  { day: 'Quarta-feira', hours: '09:00 - 19:00' },
  { day: 'Quinta-feira', hours: '09:00 - 19:00' },
  { day: 'Sexta-feira', hours: '09:00 - 19:00' },
  { day: 'Sábado', hours: '09:00 - 16:00' },
  { day: 'Domingo', hours: 'Fechado' },
];

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-+/g, '-');
}

export default function LeadPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/leads/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `${json.name} - ${json.city || ''} | Battle Barber`;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = () => {
    const token = localStorage.getItem('token');
    if (token) navigate(`/perfil/${slug}/reivindicar`);
    else navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
  };

  const handleSchedule = () => {
    const token = localStorage.getItem('token');
    if (token) navigate('/app/agenda');
    else navigate('/auth?redirect=/app/agenda');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center text-gray-900 space-y-4 p-8">
        <Store size={48} className="text-gray-300" />
        <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
        <p className="text-gray-500">Este link pode estar expirado ou inválido.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Voltar ao início</Link>
      </div>
    );
  }

  const { name, address, rating, reviewCount, website, claimed, verified, neighborhood, city, state, citySlug, nearbyCities } = data;
  const stateSlug = slugify(state || 'mg');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 pt-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-gray-500 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" itemProp="item" className="hover:text-blue-600 transition-colors"><span itemProp="name">Início</span></Link>
            <meta itemProp="position" content="1" />
          </li>
          <ChevronRight size={14} className="shrink-0" />
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to={`/barbearias/${stateSlug}`} itemProp="item" className="hover:text-blue-600 transition-colors"><span itemProp="name">{state || 'MG'}</span></Link>
            <meta itemProp="position" content="2" />
          </li>
          {city && (
            <>
              <ChevronRight size={14} className="shrink-0" />
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to={`/barbearias/${stateSlug}/${citySlug || slugify(city)}`} itemProp="item" className="hover:text-blue-600 transition-colors">
                  <span itemProp="name">{city}</span>
                </Link>
                <meta itemProp="position" content="3" />
              </li>
            </>
          )}
          <ChevronRight size={14} className="shrink-0" />
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name" className="text-blue-600 font-semibold">{name}</span>
            <meta itemProp="position" content={String(city ? 4 : 3)} />
          </li>
        </ol>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] bg-white rounded-full blur-[100px]" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[400px] h-[400px] bg-purple-400 rounded-full blur-[100px]" />
          </div>
          <div className="relative px-6 sm:px-10 py-10 sm:py-14">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {claimed ? (verified ? 'Verificado' : 'Pendente') : 'Perfil Gratuito'}
                  </span>
                  {!claimed && (
                    <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-400/30">
                      <Award size={12} />
                      Destaque
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
                  {name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm sm:text-base mb-6">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{rating?.toFixed(1)}</span>
                    <span className="text-white/60">({reviewCount || 0})</span>
                  </div>
                  {city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-200" />
                      <span>{city}{state ? `, ${state}` : ''}</span>
                    </div>
                  )}
                  {neighborhood && (
                    <span className="text-white/50">• {neighborhood}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSchedule}
                    className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all shadow-md"
                  >
                    <Calendar size={18} />
                    Agendar horário
                  </button>
                  {!claimed && (
                    <button
                      onClick={handleClaim}
                      className="inline-flex items-center gap-2 bg-blue-500/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-blue-500/30 hover:border-white/30 transition-all"
                    >
                      <Shield size={18} />
                      Verificar Perfil
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                {[
                  { label: 'Avaliação', value: rating?.toFixed(1), icon: Star, color: 'text-yellow-400' },
                  { label: 'Clientes', value: reviewCount || 0, icon: Users, color: 'text-blue-300' },
                  { label: 'Serviços', value: `${COMMON_SERVICES.length}+`, icon: Scissors, color: 'text-green-300' },
                  { label: 'Anos', value: '3+', icon: Calendar, color: 'text-purple-300' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center min-w-[100px]">
                    <stat.icon size={20} className={`${stat.color} mx-auto mb-1`} />
                    <div className="text-xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid: Info + Schedule */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Info Cards */}
          <div className="lg:col-span-2 space-y-8">

            {/* Address + Rating Row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  Endereço
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{address}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {neighborhood ? `${neighborhood} - ` : ''}{city}{state ? `, ${state}` : ''}
                </p>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium mt-3 hover:text-blue-800 transition-colors"
                >
                  <Navigation size={14} />
                  Abrir no Google Maps
                </a>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                  <Star size={18} className="text-yellow-500" />
                  Avaliação
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-gray-900">{rating?.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} className={i <= Math.round(rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{reviewCount || 0} avaliações</span>
                    <div className="text-xs text-gray-400 mt-0.5">Google Maps</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Website */}
            {website && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                  <ExternalLink size={18} className="text-blue-600" />
                  Site / Redes Sociais
                </h2>
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium break-all transition-colors"
                >
                  {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <ExternalLink size={12} className="inline ml-1" />
                </a>
              </div>
            )}

            {/* Services */}
            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Serviços</h2>
              <p className="text-sm text-gray-500 mb-5">Principais serviços oferecidos por esta barbearia</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COMMON_SERVICES.map(s => (
                  <div key={s.name} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <s.icon size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{s.name}</span>
                  </div>
                ))}
              </div>
              {!claimed && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Reivindique o perfil para personalizar seus serviços
                </p>
              )}
            </section>

            {/* Schedule */}
            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={18} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Horários de Funcionamento</h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">Horários de atendimento disponíveis para agendamento</p>
              <div className="space-y-1">
                {WEEK_SCHEDULE.map(w => (
                  <div key={w.day} className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{w.day}</span>
                    <span className={`text-sm font-semibold ${w.hours === 'Fechado' ? 'text-red-500' : 'text-emerald-600'}`}>
                      {w.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <button
                  onClick={handleSchedule}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  <Calendar size={18} />
                  Agendar Horário
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">

            {/* Status Card */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-gray-900 font-bold mb-4">
                <Shield size={18} className="text-emerald-600" />
                Status do Perfil
              </h2>
              {verified ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl p-4">
                  <CheckCircle size={20} />
                  <div>
                    <p className="font-bold">Verificado</p>
                    <p className="text-sm text-emerald-600">Perfil oficial confirmado</p>
                  </div>
                </div>
              ) : claimed ? (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl p-4">
                  <Clock size={20} />
                  <div>
                    <p className="font-bold">Pendente</p>
                    <p className="text-sm text-amber-600">Aguardando aprovação</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Award size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-900">Disponível para você!</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Reivindique e gerencie seu perfil, receba agendamentos e apareça para centenas de clientes.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleClaim}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all shadow-md"
                  >
                    <Shield size={18} />
                    Verificar meu Perfil
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-2">Gratuito • 2 minutos</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-gray-900 font-bold mb-4">Estatísticas</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avaliação Geral</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900">{rating?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Avaliações</span>
                  <span className="font-bold text-gray-900">{reviewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cidade</span>
                  <span className="font-bold text-gray-900 text-sm">{city || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="font-bold text-gray-900">{state || 'MG'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Localização</h2>
            <p className="text-sm text-gray-500">{address}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-72 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-blue-600" />
              </div>
              <p className="text-gray-700 font-semibold">Mapa Interativo</p>
              <p className="text-sm text-gray-500 mt-1">
                {neighborhood ? `${neighborhood} - ` : ''}{city}{state ? `, ${state}` : ''}
              </p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(address || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium mt-3 hover:text-blue-800 transition-colors"
              >
                <Navigation size={14} />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        {nearbyCities && nearbyCities.length > 0 && (
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={18} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Cidades próximas</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">Encontre barbearias em cidades próximas a {city}</p>
            <div className="flex flex-wrap gap-2">
              {nearbyCities.map((c: any) => (
                <Link
                  key={c.slug}
                  to={`/barbearias/${stateSlug}/${c.slug}`}
                  className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-700 transition-all"
                >
                  <MapPin size={12} />
                  {c.nome}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Breakdown */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Distribuição de Avaliações</h2>
          <p className="text-sm text-gray-500 mb-6">Baseado em {reviewCount || 0} avaliações no Google Maps</p>
          <div className="flex items-center gap-8">
            <div className="text-center shrink-0">
              <div className="text-5xl font-black text-gray-900">{rating?.toFixed(1)}</div>
              <div className="flex gap-0.5 mt-2 justify-center">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} className={i <= Math.round(rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                ))}
              </div>
              <div className="text-sm text-gray-500 font-medium mt-1">{reviewCount || 0} avaliações</div>
            </div>
            <div className="flex-1 space-y-2.5">
              {[5,4,3,2,1].map(nota => {
                const pct = nota === 5 ? 60 : nota === 4 ? 25 : nota === 3 ? 10 : nota === 2 ? 3 : 2;
                return (
                  <div key={nota} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-6">{nota}</span>
                    <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right font-medium">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{name} — Barbearia em {city}</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3">
            <p>{name} está localizada em {address}, no bairro {neighborhood || city} em {city}{state ? `, ${state}` : ''}. Com {rating?.toFixed(1)} estrelas de avaliação{reviewCount > 0 ? ` (${reviewCount} avaliações)` : ''}, é uma das barbearias em destaque na região. Agende seu horário pelo Battle Barber, a plataforma que conecta clientes aos melhores barbeiros.</p>

            <h3 className="text-base font-semibold text-gray-900 pt-2">Serviços disponíveis em {name}</h3>
            <p>Corte masculino, degradê, barba, hot towel, barboterapia, design capilar, hidratação, corte navalhado, pigmentação capilar, sobrancelha e depilação.</p>

            <h3 className="text-base font-semibold text-gray-900 pt-2">Horário de funcionamento</h3>
            <p>Segunda a sexta das 09:00 às 19:00, sábado das 09:00 às 16:00. Agende seu horário online pelo Battle Barber.</p>

            {neighborhood && (
              <>
                <h3 className="text-base font-semibold text-gray-900 pt-2">Bairro {neighborhood} em {city}</h3>
                <p>{name} está localizada no bairro {neighborhood} em {city}{state ? `, ${state}` : ''}, facilitando o acesso para clientes da região.</p>
              </>
            )}

            <h3 className="text-base font-semibold text-gray-900 pt-2">Agende online pelo Battle Barber</h3>
            <p>O Battle Barber conecta você aos melhores barbeiros. Agende seu horário online, veja avaliações reais e encontre o profissional ideal perto de você. Cadastre-se gratuitamente.</p>
          </div>
        </section>

        {/* Final CTA */}
        {!claimed && (
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-30%] left-[-10%] w-[300px] h-[300px] bg-white rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <Award size={48} className="mx-auto mb-4 text-yellow-300" />
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Este é seu estabelecimento?
              </h2>
              <p className="text-blue-100 max-w-lg mx-auto mb-8 leading-relaxed">
                Reivindique seu perfil gratuitamente e apareça para centenas de clientes em {city}.
                Agendamento online, fotos, avaliações e muito mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleClaim}
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 hover:shadow-xl transition-all text-lg"
                >
                  <Shield size={20} />
                  Verificar meu Perfil
                </button>
                <button
                  onClick={handleSchedule}
                  className="inline-flex items-center justify-center gap-2 bg-blue-500/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-500/30 transition-all text-lg"
                >
                  <Calendar size={20} />
                  Agendar horário
                </button>
              </div>
              <p className="text-blue-200/60 text-sm mt-4">Gratuito • 2 minutos • Sem compromisso</p>
            </div>
          </section>
        )}

        {/* Claimed CTA */}
        {claimed && (
          <section className="bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-100 rounded-2xl p-8 text-center">
            <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Perfil gerenciado pelo proprietário</h2>
            <p className="text-sm text-gray-500">Agende seu horário diretamente com a barbearia</p>
            <button
              onClick={handleSchedule}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all mt-4 shadow-md"
            >
              <Calendar size={18} />
              Agendar horário
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
