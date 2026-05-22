import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SERVICE_LABELS: Record<string, string> = {
  'corte-degrade': 'Corte Degradê',
  'barba': 'Barba',
  'corte-infantil': 'Corte Infantil',
  'corte-masculino': 'Corte Masculino',
  'hot-towel': 'Hot Towel',
};

export default function ServiceCityPage() {
  const { service, stateSlug, citySlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const serviceLabel = SERVICE_LABELS[service || ''] || service || '';

  useEffect(() => {
    fetchData();
  }, [service, stateSlug, citySlug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seo/city/${stateSlug}/${citySlug}`);
      if (res.ok) {
        const json = await res.json();
        const filtered = json.barbers?.filter((b: any) =>
          b.specialties?.some((s: string) => s.toLowerCase().includes(serviceLabel.toLowerCase()))
        ) || [];
        setData({ ...json, barbers: filtered });
        document.title = `${serviceLabel} em ${json.city.name} - ${json.state.sigla} | Battle Barber`;
      } else {
        setData({ barbers: [] });
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
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <Link to="/" className="text-blue-500 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const { city, state, barbers } = data;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <section className="bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-black py-16 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-blue-400">Início</Link>
            <ChevronRight size={14} />
            <span>{serviceLabel}</span>
            <ChevronRight size={14} />
            <span className="text-blue-400">{city.name} - {state.sigla}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            {serviceLabel} em {city.name}
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Encontre os melhores profissionais de {serviceLabel.toLowerCase()} em {city.name}, {state.sigla}.
            {barbers?.length > 0 ? ` ${barbers.length} barbeiros disponíveis.` : ''}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">
          Profissionais disponíveis ({barbers?.length || 0})
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
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30"
                />
                <div>
                  <h3 className="font-bold text-lg">{b.name}</h3>
                  <p className="text-sm text-gray-400">{b.shop}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">{'★'.repeat(Math.round(b.rating))}</span>
                    <span className="text-sm font-semibold">{b.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {barbers?.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            Nenhum profissional encontrado para {serviceLabel.toLowerCase()} em {city.name}.
          </p>
        )}
      </div>
    </div>
  );
}
