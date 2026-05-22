import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Scissors, MapPin, ChevronRight, Calendar } from 'lucide-react';

export default function BarberSeoPage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seo/barber/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `${json.name} - Barbeiro em ${json.city?.name || ''} | Battle Barber`;
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
        <h1 className="text-2xl font-bold">Barbeiro não encontrado</h1>
        <Link to="/" className="text-blue-500 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const { name, avatar, bio, shop, rating, reviewsCount, specialties, city, state, neighborhood } = data;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-blue-400">Início</Link>
          <ChevronRight size={14} />
          {city && state && (
            <>
              <Link to={`/barbearias/${state.slug}/${city.slug}`} className="hover:text-blue-400">
                {city.name} - {state.sigla}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-blue-400">{name}</span>
        </div>
      </div>

      {/* Profile */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={avatar || `https://i.pravatar.cc/200?u=${slug}`}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-600/30"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-black mb-2">{name}</h1>
            <p className="text-xl text-blue-400 font-semibold mb-4">{shop}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-bold">{rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">({reviewsCount} avaliações)</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
              {specialties?.map((s: string) => (
                <span key={s} className="flex items-center gap-1 bg-blue-600/20 text-blue-400 text-sm px-3 py-1.5 rounded-full">
                  <Scissors size={12} />
                  {s}
                </span>
              ))}
            </div>
            <Link
              to={`/barbeiro/${slug}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl transition-all"
            >
              <Calendar size={18} />
              Agendar horário
            </Link>
          </div>
        </div>
      </section>

      {/* Bio */}
      {bio && (
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-3">Sobre</h2>
            <p className="text-gray-300 leading-relaxed">{bio}</p>
          </div>
        </section>
      )}

      {/* Location */}
      {city && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-blue-500" />
              Localização
            </h2>
            <p className="text-gray-300">
              {neighborhood ? `${neighborhood.name} - ` : ''}{city.name}{state ? `, ${state.sigla}` : ''}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
