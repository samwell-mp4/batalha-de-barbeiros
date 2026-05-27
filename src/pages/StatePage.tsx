import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';

export default function StatePage() {
  const { stateSlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
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
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-blue-600 border-gray-700 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white space-y-4 p-8">
        <h1 className="text-2xl font-bold">Estado não encontrado</h1>
        <Link to="/" className="text-blue-500 hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const { state, cities } = data;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <section className="bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-black py-16 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-blue-400">Início</Link>
            <ChevronRight size={14} />
            <span className="text-blue-400">{state.nome}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Barbearias em <span className="text-blue-500">{state.nome}</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Encontre as melhores barbearias em {state.nome}. {cities?.length || 0} cidades disponíveis.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-blue-500" />
          Cidades em {state.nome}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cities?.map((c: any) => (
            <Link
              key={c.slug}
              to={`/barbearias/${state.slug}/${c.slug}`}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
            >
              <h3 className="font-bold text-sm">{c.nome}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
