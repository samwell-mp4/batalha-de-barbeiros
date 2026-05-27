import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Scissors, ChevronRight, Search, Store } from 'lucide-react';

export default function LeadListPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 48;

  useEffect(() => {
    document.title = 'Barbearias | Battle Barber';
    fetchLeads();
  }, [page]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/leads?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.leads || json.data || [];
        setLeads(page > 1 ? prev => [...prev, ...list] : list);
        setHasMore(list.length === PAGE_SIZE);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLeads([]);
    fetchLeads();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
          <ChevronRight size={14} />
          <span className="text-blue-600 font-semibold">Barbearias</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Barbearias em Minas Gerais
          </h1>
          <p className="text-gray-500">
            Encontre a barbearia perfeita perto de você
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou cidade..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              Buscar
            </button>
          </div>
        </form>

        {/* Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <Store size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Nenhuma barbearia encontrada</h2>
            <p className="text-gray-500">Tente buscar por outro termo</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {leads.map(lead => (
                <Link
                  key={lead.slug}
                  to={`/perfil/${lead.slug}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                    <Scissors size={20} className="text-white" />
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {lead.name}
                  </h3>

                  {lead.city && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <MapPin size={10} className="shrink-0" />
                      {lead.city}{lead.neighborhood ? `, ${lead.neighborhood}` : ''}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-800">{lead.rating?.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({lead.reviewCount || 0})</span>
                  </div>

                  {lead.claimed ? (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                      Perfil Livre
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="bg-white border border-gray-200 text-gray-700 font-bold px-8 py-3.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}

        {/* SEO Text */}
        <section className="mt-12 bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Barbearias em Minas Gerais</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3">
            <p>
              Encontre as melhores barbearias em Minas Gerais no Battle Barber. 
              Belo Horizonte, Betim, Contagem, Divinópolis, Ipatinga, Juiz de Fora, 
              Uberlândia e muitas outras cidades. Agende online, veja avaliações 
              reais e encontre o barbeiro ideal perto de você.
            </p>
            <p>
              O Battle Barber conecta clientes aos melhores barbeiros de Minas Gerais. 
              Cadastre-se gratuitamente e agende seu horário.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
