import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronRight, Users, MapPin, ArrowRight } from 'lucide-react';

export default function NeighborhoodPage() {
  const { stateSlug, citySlug, neighborhoodSlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [stateSlug, citySlug, neighborhoodSlug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seo/city/${stateSlug}/${citySlug}`);
      if (res.ok) {
        const json = await res.json();
        const hood = json.neighborhoods?.find((n: any) => n.slug === neighborhoodSlug);
        const barbersByHood = json.barbers?.filter((b: any) =>
          b.neighborhoodSlug === neighborhoodSlug
        ) || json.barbers || [];
        const hoodName = hood?.name || neighborhoodSlug;
        setData({
          ...json,
          currentNeighborhood: hood || { name: neighborhoodSlug, barbers_count: barbersByHood.length },
          barbers: barbersByHood,
        });
        document.title = `Barbearias em ${hoodName} - ${json.city.name} | Battle Barber`;
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
        <h1 className="text-2xl font-bold">Bairro não encontrado</h1>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">Voltar ao início</Link>
      </div>
    );
  }

  const { city, state, barbers, currentNeighborhood } = data;
  const hasBarbers = barbers?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}`} className="hover:text-white transition-colors">{state.nome}</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}/${city.slug}`} className="hover:text-white transition-colors">{city.name}</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{currentNeighborhood.name}</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Barbearias em {currentNeighborhood.name}
            </h1>
            <p className="text-lg text-blue-100 max-w-xl mb-6 leading-relaxed">
              Encontre as melhores barbearias no bairro {currentNeighborhood.name} em {city.name}, {state.sigla}.
              {hasBarbers ? ` ${barbers.length} profissionais disponíveis.` : ' Cadastre-se e encontre o barbeiro ideal perto de você.'}
            </p>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 w-fit mb-8">
              <MapPin size={18} className="text-white" />
              <div>
                <span className="font-bold text-white">{currentNeighborhood.name}</span>
                <span className="text-blue-100 text-sm ml-1">- {city.name}</span>
              </div>
              <div className="w-px h-5 bg-white/20 mx-3" />
              <Users size={16} className="text-blue-200" />
              <span className="font-bold text-white">{barbers.length}</span>
              <span className="text-blue-100 text-sm ml-1">barbearias</span>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group shadow-lg"
            >
              {hasBarbers ? 'Agendar agora' : 'Encontrar barbeiros'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {hasBarbers ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Barbearias em {currentNeighborhood.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-12 h-12 rounded-full object-cover" />
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
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 md:p-14 text-center">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Barbearias em {currentNeighborhood.name}</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Ainda não temos barbearias cadastradas neste bairro. Cadastre-se para encontrar profissionais em {city.name}.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 group shadow-lg"
            >
              Começar agora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
