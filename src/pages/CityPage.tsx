import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Scissors, ChevronRight, Users, TrendingUp, Search } from 'lucide-react';

const SERVICES = [
  { slug: 'corte-masculino', label: 'Corte Masculino' },
  { slug: 'corte-degrade', label: 'Corte Degradê' },
  { slug: 'barba', label: 'Barba' },
  { slug: 'corte-infantil', label: 'Corte Infantil' },
  { slug: 'hot-towel', label: 'Hot Towel' },
];

export default function CityPage() {
  const { stateSlug, citySlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [stateSlug, citySlug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seo/city/${stateSlug}/${citySlug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `Barbearias em ${json.city.name} - ${json.state.sigla} | Battle Barber`;
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
        <div className="w-8 h-8 rounded-full border-2 border-t-blue-600 border-gray-700 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white space-y-4 p-8">
        <h1 className="text-2xl font-bold">Cidade não encontrada</h1>
        <p className="text-gray-400">Não encontramos barbearias nesta cidade.</p>
        <Link to="/" className="text-blue-500 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const { city, state, barbers, neighborhoods, highlighted, nearbyCities } = data;
  const hasBarbers = barbers?.length > 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-black py-16 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-blue-400">Início</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}`} className="hover:text-blue-400">{state.nome}</Link>
            <ChevronRight size={14} />
            <span className="text-blue-400">{city.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Barbearias em <span className="text-blue-500">{city.name}</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            {hasBarbers
              ? `Encontre as melhores barbearias em ${city.name}, ${state.sigla}. ${city.barbers_count || 0} barbearias disponíveis${city.avg_price ? ` com preço médio de R$ ${city.avg_price.toFixed(2).replace('.', ',')}` : ''}.`
              : `Encontre barbearias e barbeiros em ${city.name}, ${state.sigla}. Agende seu horário online pelo Battle Barber.`}
          </p>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <Users size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-black">{city.barbers_count || 0}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Barbearias</p>
              </div>
            </div>
            {city.avg_price && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-600/20 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-black">R$ {city.avg_price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Preço médio</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Highlighted Barbers */}
        {highlighted?.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              Destaques em {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlighted.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30"
                    />
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{b.name}</h3>
                      <p className="text-sm text-gray-400">{b.shop}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
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
            <h2 className="text-2xl font-black mb-6">
              Todos os barbeiros em {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers?.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{b.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{b.shop}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold">{b.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-500">({b.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                  {b.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {b.specialties.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full">
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

        {/* No barbers - show default content */}
        {!hasBarbers && (
          <section>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <Search size={48} className="text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Barbearias em {city.name}</h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Ainda não temos barbearias cadastradas em {city.name}. 
                Enquanto isso, confira os serviços disponíveis ou veja cidades próximas.
              </p>
              <Link
                to={`/barbearias/${state.slug}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all"
              >
                <MapPin size={18} />
                Ver cidades em {state.nome}
              </Link>
            </div>
          </section>
        )}

        {/* Services Grid */}
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Scissors size={20} className="text-blue-500" />
            Serviços em {city.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                to={`/servicos/${s.slug}/${state.slug}/${city.slug}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-all"
              >
                <Scissors size={20} className="text-blue-400 mx-auto mb-2" />
                <span className="font-medium text-sm">{s.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Neighborhoods */}
        {neighborhoods?.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" />
              Bairros em {city.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {neighborhoods.map((n: any) => (
                <Link
                  key={n.slug}
                  to={`/barbearias/${state.slug}/${city.slug}/${n.slug}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <h3 className="font-bold text-sm">{n.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{n.barbers_count} barbearias</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Services from DB */}
        {city.top_services?.length > 0 && hasBarbers && (
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Scissors size={20} className="text-blue-500" />
              Serviços populares em {city.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {city.top_services.map((s: string) => (
                <Link
                  key={s}
                  to={`/servicos/${s.toLowerCase().replace(/\s+/g, '-')}/${state.slug}/${city.slug}`}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-3 transition-all"
                >
                  <span className="font-medium">{s}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Cities Footer */}
        {nearbyCities?.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-green-500" />
              Cidades próximas a {city.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {nearbyCities.map((c: any) => (
                <Link
                  key={c.slug}
                  to={`/barbearias/${state.slug}/${c.slug}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all"
                >
                  <h3 className="font-bold text-sm">{c.nome}</h3>
                  <p className="text-xs text-gray-400 mt-1">{state.nome}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
