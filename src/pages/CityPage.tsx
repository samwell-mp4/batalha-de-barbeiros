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
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-[#00AEEF] border-gray-700 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white space-y-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <MapPin size={32} className="text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p className="text-gray-400">Esta cidade ainda não está disponível no Battle Barber.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-6 py-3 rounded-full hover:shadow-[0_0_25px_rgba(0,174,239,0.4)] transition-all">
          Voltar ao início
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const { city, state, barbers, neighborhoods, highlighted, nearbyCities } = data;
  const hasBarbers = barbers?.length > 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00AEEF]/10 via-[#2563FF]/5 to-black py-20 px-6 border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#00AEEF]/10 via-purple-900/5 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#2563FF]/10 via-[#7C3AED]/5 to-transparent rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-[#00AEEF] transition-colors">Início</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}`} className="hover:text-[#00AEEF] transition-colors">{state.nome}</Link>
            <ChevronRight size={14} />
            <span className="text-[#00AEEF]">{city.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-[0.95]">
                Barbearias em{' '}
                <span className="bg-gradient-to-r from-[#00AEEF] to-[#2563FF] bg-clip-text text-transparent">
                  {city.name}
                </span>
              </h1>
              <p className="text-lg text-gray-300 max-w-xl mb-6 leading-relaxed">
                {hasBarbers
                  ? `Encontre os melhores barbeiros em ${city.name}, ${state.sigla}. ${city.barbers_count || 0} profissionais disponíveis${city.avg_price ? ` com preço médio de R$ ${city.avg_price.toFixed(2).replace('.', ',')}` : ''}. Agende online e sem fila.`
                  : `Procura por barbeiros em ${city.name}, ${state.sigla}? O Battle Barber conecta você com os melhores profissionais. Agende seu corte em casa ou vá até o barbeiro.`}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-8 py-4 rounded-full hover:shadow-[0_0_35px_rgba(0,174,239,0.5)] transition-all duration-300 group"
                >
                  {hasBarbers ? 'Agendar agora' : 'Encontrar barbeiros'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={`/barbearias/${state.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  Ver todas cidades de {state.sigla}
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center mb-3">
                    <Scissors size={20} className="text-[#00AEEF]" />
                  </div>
                  <div className="text-2xl font-black">{city.barbers_count || 0}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Barbearias</div>
                </div>
                {city.avg_price && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20 flex items-center justify-center mb-3">
                      <TrendingUp size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black">R$ {city.avg_price.toFixed(2).replace('.', ',')}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Preço médio</div>
                  </div>
                )}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center mb-3">
                    <Star size={20} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-black">4.9</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Avaliações</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/20 to-purple-600/20 border border-[#7C3AED]/20 flex items-center justify-center mb-3">
                    <Clock size={20} className="text-[#7C3AED]" />
                  </div>
                  <div className="text-2xl font-black">30s</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Agendamento</div>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
                <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>
              <h2 className="text-2xl font-black">Destaques em {city.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlighted.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white/5 hover:bg-white/[0.07] border border-white/10 hover:border-[#00AEEF]/30 rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-14 h-14 rounded-full object-cover border-2 border-[#00AEEF]/30 group-hover:border-[#00AEEF]/60 transition-all" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#030303] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-[#00AEEF] transition-colors">{b.name}</h3>
                      <p className="text-sm text-gray-400">{b.shop}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">{b.rating.toFixed(1)}</span>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center">
                <Users size={16} className="text-[#00AEEF]" />
              </div>
              <h2 className="text-2xl font-black">Todos os barbeiros em {city.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-[#00AEEF]/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate group-hover:text-[#00AEEF] transition-colors">{b.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{b.shop}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold">{b.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-500">({b.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                  {b.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {b.specialties.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-[#00AEEF]/10 text-[#00AEEF] px-2.5 py-1 rounded-full border border-[#00AEEF]/20">
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
            <div className="relative overflow-hidden bg-gradient-to-br from-[#00AEEF]/5 via-[#2563FF]/5 to-black rounded-3xl border border-white/10 p-10 md:p-14 text-center">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-br from-[#00AEEF]/10 to-transparent rounded-full blur-[80px]" />
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={32} className="text-[#00AEEF]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-3">
                  Barbearias em {city.name}
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
                  Ainda não temos barbeiros cadastrados em {city.name}. 
                  Seja o primeiro ou encontre profissionais nas cidades próximas.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-8 py-4 rounded-full hover:shadow-[0_0_35px_rgba(0,174,239,0.5)] transition-all duration-300 group"
                  >
                    Começar agora
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={`/barbearias/${state.slug}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all"
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center">
              <Scissors size={16} className="text-[#00AEEF]" />
            </div>
            <h2 className="text-2xl font-black">Serviços em {city.name}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={`/servicos/${s.slug}/${state.slug}/${city.slug}`}
                className="group bg-white/5 hover:bg-white/[0.07] border border-white/10 hover:border-[#00AEEF]/30 rounded-xl p-5 text-center transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Scissors size={18} className="text-[#00AEEF]" />
                </div>
                <span className="font-bold text-sm block">{s.label}</span>
                <span className="text-xs text-gray-500 mt-1 block">{s.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Neighborhoods */}
        {neighborhoods?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20 flex items-center justify-center">
                <MapPin size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black">Bairros em {city.name}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {neighborhoods.map((n: any) => (
                <Link
                  key={n.slug}
                  to={`/barbearias/${state.slug}/${city.slug}/${n.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] hover:border-[#00AEEF]/20 transition-all"
                >
                  <h3 className="font-bold text-sm group-hover:text-[#00AEEF] transition-colors">{n.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{n.barbers_count} barbearias</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Why Battle Barber */}
        <section>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-black mb-8 text-center">
              Por que usar o Battle Barber em {city.name}?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: 'Geolocalização', desc: 'Veja barbeiros disponíveis perto de você no mapa em tempo real.' },
                { icon: Shield, title: 'Avaliações Reais', desc: 'Barbeiros avaliados por clientes reais com fotos dos cortes.' },
                { icon: Clock, title: 'Agende em 30s', desc: 'Sem precisar ligar ou mandar mensagem. Agende direto pelo app.' },
              ].map((item, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon size={22} className="text-[#00AEEF]" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        {nearbyCities?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20 flex items-center justify-center">
                <MapPin size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black">Cidades próximas a {city.name}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {nearbyCities.map((c: any) => (
                <Link
                  key={c.slug}
                  to={`/barbearias/${state.slug}/${c.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] hover:border-[#00AEEF]/30 transition-all"
                >
                  <h3 className="font-bold text-sm group-hover:text-[#00AEEF] transition-colors">{c.nome}</h3>
                  <p className="text-xs text-gray-400 mt-1">{state.nome}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO Footer Text */}
        <section className="border-t border-white/5 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold mb-3">
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
