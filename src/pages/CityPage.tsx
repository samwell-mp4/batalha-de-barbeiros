import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Scissors, ChevronRight, Users, TrendingUp, Sparkles, ArrowRight, Shield, Clock } from 'lucide-react';

const SERVICES = [
  { slug: 'corte-masculino', label: 'Corte Masculino', desc: 'Corte social ou degradê' },
  { slug: 'corte-degrade', label: 'Corte Degradê', desc: 'Fade e degraded profissional' },
  { slug: 'barba', label: 'Barba', desc: 'Barba completa e desenho' },
  { slug: 'corte-infantil', label: 'Corte Infantil', desc: 'Corte para crianças' },
  { slug: 'hot-towel', label: 'Hot Towel', desc: 'Toalha quente e barboterapia' },
];

function getSeoDescription(cityName: string, stateSigla: string, hasBarbers: boolean): string {
  if (hasBarbers) {
    return `Encontre as melhores barbearias em ${cityName}, ${stateSigla}. Compare avaliações, preços e agende seu horário online. Corte masculino, degradê, barba e mais.`;
  }
  return `Procura por barbearias em ${cityName}, ${stateSigla}? O Battle Barber conecta você com os melhores barbeiros da região. Agende seu corte online em poucos cliques.`;
}

export default function CityPage() {
  const { stateSlug, citySlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [stateSlug, citySlug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seo/city/${stateSlug}/${citySlug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `Barbearias em ${json.city.name} - ${json.state.sigla} | Battle Barber`;
        const desc = getSeoDescription(json.city.name, json.state.sigla, (json.barbers?.length || 0) > 0);
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', desc);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 space-y-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <MapPin size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p className="text-gray-500">Esta cidade ainda não está disponível no Battle Barber.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">
          Voltar ao início
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const { city, state, barbers, neighborhoods, highlighted, nearbyCities, leads } = data;
  const hasBarbers = barbers?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}`} className="hover:text-white transition-colors">{state.nome}</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{city.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-[0.95]">
                Barbearias em{' '}
                <span className="text-white/90">
                  {city.name}
                </span>
              </h1>
              <p className="text-lg text-blue-100 max-w-xl mb-6 leading-relaxed">
                {hasBarbers
                  ? `Encontre os melhores barbeiros em ${city.name}, ${state.sigla}. ${city.barbers_count || 0} profissionais disponíveis${city.avg_price ? ` com preço médio de R$ ${city.avg_price.toFixed(2).replace('.', ',')}` : ''}. Agende online e sem fila.`
                  : `Procura por barbeiros em ${city.name}, ${state.sigla}? O Battle Barber conecta você com os melhores profissionais. Agende seu corte em casa ou vá até o barbeiro.`}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group shadow-lg"
                >
                  {hasBarbers ? 'Agendar agora' : 'Encontrar barbeiros'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={`/barbearias/${state.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  Ver todas cidades de {state.sigla}
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                    <Scissors size={20} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{city.barbers_count || 0}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider font-bold">Barbearias</div>
                </div>
                {city.avg_price && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                      <TrendingUp size={20} className="text-emerald-300" />
                    </div>
                    <div className="text-2xl font-bold text-white">R$ {city.avg_price.toFixed(2).replace('.', ',')}</div>
                    <div className="text-xs text-blue-200 uppercase tracking-wider font-bold">Preço médio</div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                    <Star size={20} className="text-amber-300" />
                  </div>
                  <div className="text-2xl font-bold text-white">4.9</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider font-bold">Avaliações</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                    <Clock size={20} className="text-purple-300" />
                  </div>
                  <div className="text-2xl font-bold text-white">30s</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider font-bold">Agendamento</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Highlighted Barbers */}
        {highlighted?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star size={16} className="text-amber-600 fill-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Destaques em {city.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlighted.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-300 transition-all" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{b.name}</h3>
                      <p className="text-sm text-gray-500">{b.shop}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-gray-700">{b.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Leads - Unclaimed barbers */}
        {leads?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Sparkles size={16} className="text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Barbearias em destaque em {city.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((l: any) => (
                <Link
                  key={l.id}
                  to={`/perfil/${l.slug}`}
                  className="group bg-white border border-gray-200 hover:border-amber-300 hover:shadow-md rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-lg font-bold text-amber-700">
                      {l.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{l.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{l.neighborhood || l.city}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-gray-600">{l.rating?.toFixed(1)}</span>
                        {l.reviewCount > 0 && <span className="text-xs text-gray-400">({l.reviewCount})</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Barbers */}
        {hasBarbers && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Todos os barbeiros em {city.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{b.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{b.shop}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span className="text-xs font-semibold text-gray-700">{b.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-400">({b.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                  {b.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {b.specialties.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* No barbers - attractive CTA */}
        {!hasBarbers && (
          <section>
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl border border-gray-200 p-10 md:p-14 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={32} className="text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Barbearias em {city.name}
                </h2>
                <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
                  Ainda não temos barbeiros cadastrados em {city.name}. 
                  Seja o primeiro ou encontre profissionais nas cidades próximas.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 group shadow-lg"
                  >
                    Começar agora
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={`/barbearias/${state.slug}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <MapPin size={16} />
                    Cidades em {state.nome}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services Grid */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Scissors size={16} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Serviços em {city.name}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={`/servicos/${s.slug}/${state.slug}/${city.slug}`}
                className="group bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-xl p-5 text-center transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Scissors size={18} className="text-blue-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900 block">{s.label}</span>
                <span className="text-xs text-gray-500 mt-1 block">{s.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Neighborhoods */}
        {neighborhoods?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <MapPin size={16} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bairros em {city.name}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {neighborhoods.map((n: any) => (
                <Link
                  key={n.slug}
                  to={`/barbearias/${state.slug}/${city.slug}/${n.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{n.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{n.barbers_count} barbearias</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Why Battle Barber */}
        <section>
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Por que usar o Battle Barber em {city.name}?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: 'Geolocalização', desc: 'Veja barbeiros disponíveis perto de você no mapa em tempo real.' },
                { icon: Shield, title: 'Avaliações Reais', desc: 'Barbeiros avaliados por clientes reais com fotos dos cortes.' },
                { icon: Clock, title: 'Agende em 30s', desc: 'Sem precisar ligar ou mandar mensagem. Agende direto pelo app.' },
              ].map((item, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <item.icon size={22} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        {nearbyCities?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <MapPin size={16} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cidades próximas a {city.name}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {nearbyCities.map((c: any) => (
                <Link
                  key={c.slug}
                  to={`/barbearias/${state.slug}/${c.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{c.nome}</h3>
                  <p className="text-xs text-gray-500 mt-1">{state.nome}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Footer Text */}
        <section className="border-t border-gray-200 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Barbearias em {city.name} - {state.sigla}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              O Battle Barber é a plataforma que conecta clientes aos melhores barbeiros de {city.name}, {state.sigla}. 
              Com nosso sistema de geolocalização em tempo real, você encontra profissionais disponíveis perto de você, 
              vê avaliações reais, compara preços e agenda seu horário em segundos. 
              {hasBarbers ? ` São ${city.barbers_count} barbearias disponíveis em ${city.name}${city.avg_price ? ` com preço médio de R$ ${city.avg_price.toFixed(2).replace('.', ',')}` : ''}.` : ''} 
              Cadastre-se gratuitamente e descubra o jeito mais moderno de cuidar do visual.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
