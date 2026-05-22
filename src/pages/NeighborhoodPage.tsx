import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronRight, Users } from 'lucide-react';

export default function NeighborhoodPage() {
  const { stateSlug, citySlug, neighborhoodSlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
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

        setData({
          ...json,
          currentNeighborhood: hood || { name: neighborhoodSlug, barbers_count: barbersByHood.length },
          barbers: barbersByHood,
        });

        document.title = `Barbearias em ${hood?.name || neighborhoodSlug} - ${json.city.name} | Battle Barber`;
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
        <h1 className="text-2xl font-bold">Bairro não encontrado</h1>
        <Link to="/" className="text-blue-500 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const { city, state, barbers, currentNeighborhood } = data;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <section className="bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-black py-16 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-blue-400">Início</Link>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}/${city.slug}`} className="hover:text-blue-400">
              {city.name} - {state.sigla}
            </Link>
            <ChevronRight size={14} />
            <span className="text-blue-400">{currentNeighborhood.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Barbearias em {currentNeighborhood.name}
          </h1>
          <p className="text-gray-300 max-w-2xl mb-6">
            Encontre as melhores barbearias no bairro {currentNeighborhood.name} em {city.name}, {state.sigla}.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{barbers.length}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Barbearias</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">Barbearias em {currentNeighborhood.name}</h2>
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
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold">{b.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({b.reviewsCount})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {barbers?.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            Nenhum barbeiro encontrado neste bairro.
          </p>
        )}
      </div>
    </div>
  );
}
