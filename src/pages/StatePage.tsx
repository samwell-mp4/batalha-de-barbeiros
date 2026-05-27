import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ChevronRight, ArrowRight, Users } from 'lucide-react';

export default function StatePage() {
  const { stateSlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [stateSlug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/seo/state/${stateSlug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `Barbearias em ${json.state.nome} | Battle Barber`;
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
        <h1 className="text-2xl font-bold">Estado não encontrado</h1>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">Voltar ao início</Link>
      </div>
    );
  }

  const { state, cities } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{state.nome}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Barbearias em {state.nome}
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mb-8 leading-relaxed">
            Encontre barbearias e barbeiros em todas as cidades de {state.nome}.
            {cities?.length || 0} cidades disponíveis. Agende online pelo Battle Barber.
          </p>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <Users size={18} className="text-white" />
              <div>
                <span className="font-bold text-white">{cities?.length || 0}</span>
                <span className="text-blue-100 text-sm ml-1">cidades</span>
              </div>
            </div>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group shadow-lg"
          >
            Começar agora
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <MapPin size={16} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cidades em {state.nome}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {cities?.map((c: any) => (
            <Link
              key={c.slug}
              to={`/barbearias/${state.slug}/${c.slug}`}
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{c.nome}</h3>
            </Link>
          ))}
        </div>
        {!cities?.length && (
          <div className="text-center py-16">
            <MapPin size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma cidade encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
