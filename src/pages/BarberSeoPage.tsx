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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 space-y-4 p-8">
        <h1 className="text-2xl font-bold">Barbeiro não encontrado</h1>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Voltar ao início</Link>
      </div>
    );
  }

  const { name, avatar, bio, shop, rating, reviewsCount, specialties, city, state, neighborhood } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Início</Link>
          <ChevronRight size={14} />
          {city && state && (
            <>
              <Link to={`/barbearias/${state.slug}/${city.slug}`} className="hover:text-blue-600">
                {city.name} - {state.sigla}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-blue-600 font-medium">{name}</span>
        </div>
      </div>

      {/* Profile */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={avatar || `https://i.pravatar.cc/200?u=${slug}`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-100"
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{name}</h1>
              <p className="text-xl text-blue-600 font-semibold mb-4">{shop}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <span className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({reviewsCount} avaliações)</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {specialties?.map((s: string) => (
                  <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-100">
                    <Scissors size={12} />
                    {s}
                  </span>
                ))}
              </div>
              <Link
                to={`/barbeiro/${slug}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md"
              >
                <Calendar size={18} />
                Agendar horário
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      {bio && (
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre</h2>
            <p className="text-gray-600 leading-relaxed">{bio}</p>
          </div>
        </section>
      )}

      {/* Location */}
      {city && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              Localização
            </h2>
            <p className="text-gray-600">
              {neighborhood ? `${neighborhood.name} - ` : ''}{city.name}{state ? `, ${state.sigla}` : ''}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
