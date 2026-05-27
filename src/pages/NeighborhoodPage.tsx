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
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-[#00AEEF] border-gray-700 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white space-y-6 p-8">
        <h1 className="text-2xl font-bold">Bairro não encontrado</h1>
        <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-6 py-3 rounded-full hover:shadow-[0_0_25px_rgba(0,174,239,0.4)] transition-all">Voltar ao início</Link>
      </div>
    );
  }

  const { city, state, barbers, currentNeighborhood } = data;
  const hasBarbers = barbers?.length > 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-[#00AEEF]/10 to-black py-20 px-6 border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-[#00AEEF]/10 to-transparent rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-[#00AEEF] transition-colors">Início</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}`} className="hover:text-[#00AEEF] transition-colors">{state.nome}</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}/${city.slug}`} className="hover:text-[#00AEEF] transition-colors">{city.name}</Link>
            <ChevronRight size={14} />
            <span className="text-[#00AEEF]">{currentNeighborhood.name}</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Barbearias em{' '}
              <span className="bg-gradient-to-r from-[#00AEEF] to-[#2563FF] bg-clip-text text-transparent">
                {currentNeighborhood.name}
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-6 leading-relaxed">
              Encontre as melhores barbearias no bairro {currentNeighborhood.name} em {city.name}, {state.sigla}.
              {hasBarbers ? ` ${barbers.length} profissionais disponíveis.` : ' Cadastre-se e encontre o barbeiro ideal perto de você.'}
            </p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-fit mb-8">
              <MapPin size={18} className="text-[#00AEEF]" />
              <div>
                <span className="font-bold">{currentNeighborhood.name}</span>
                <span className="text-gray-400 text-sm ml-1">- {city.name}</span>
              </div>
              <div className="w-px h-5 bg-white/10 mx-3" />
              <Users size={16} className="text-gray-400" />
              <span className="font-bold">{barbers.length}</span>
              <span className="text-gray-400 text-sm ml-1">barbearias</span>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-8 py-4 rounded-full hover:shadow-[0_0_35px_rgba(0,174,239,0.5)] transition-all duration-300 group"
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center">
                <Users size={16} className="text-[#00AEEF]" />
              </div>
              <h2 className="text-2xl font-black">Barbearias em {currentNeighborhood.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-[#00AEEF]/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-12 h-12 rounded-full object-cover" />
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
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 md:p-14 text-center">
            <MapPin size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Barbearias em {currentNeighborhood.name}</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Ainda não temos barbearias cadastradas neste bairro. Cadastre-se para encontrar profissionais em {city.name}.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-8 py-4 rounded-full hover:shadow-[0_0_35px_rgba(0,174,239,0.5)] transition-all duration-300 group"
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
