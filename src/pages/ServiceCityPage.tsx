import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Scissors, ChevronRight, Star, Users, ArrowRight, MapPin } from 'lucide-react';

const SERVICE_LABELS: Record<string, string> = {
  'corte-degrade': 'Corte Degradê',
  'barba': 'Barba',
  'corte-infantil': 'Corte Infantil',
  'corte-masculino': 'Corte Masculino',
  'hot-towel': 'Hot Towel',
};

const SERVICE_DESCS: Record<string, string> = {
  'corte-degrade': 'Encontre os melhores profissionais de corte degradê e fade',
  'barba': 'Faça a barba com verdadeiros mestres barbeiros',
  'corte-infantil': 'Corte infantil especializado para crianças',
  'corte-masculino': 'Corte masculino social, degradê, militar e mais',
  'hot-towel': 'Hot towel, barboterapia e tratamentos capilares',
};

export default function ServiceCityPage() {
  const { service, stateSlug, citySlug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const serviceLabel = SERVICE_LABELS[service || ''] || service || '';
  const serviceDesc = SERVICE_DESCS[service || ''] || '';

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
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
        const nearby = json.nearbyCities || [];
        setData({ ...json, barbers: filtered, nearbyCities: nearby });
        document.title = `${serviceLabel} em ${json.city.name} - ${json.state.sigla} | Battle Barber`;
      } else {
        setData({ barbers: [], city: { name: citySlug, slug: citySlug }, state: { sigla: stateSlug, slug: stateSlug, nome: stateSlug }, nearbyCities: [] });
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
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-6 py-3 rounded-full hover:shadow-[0_0_25px_rgba(0,174,239,0.4)] transition-all">Voltar ao início</Link>
      </div>
    );
  }

  const { city, state, barbers, nearbyCities } = data;
  const hasBarbers = barbers?.length > 0;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00AEEF]/10 via-[#7C3AED]/5 to-black py-20 px-6 border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#00AEEF]/10 to-transparent rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-[#00AEEF] transition-colors">Início</Link>
            <ChevronRight size={14} />
            <span>{serviceLabel}</span>
            <ChevronRight size={14} />
            <Link to={`/barbearias/${state.slug}/${city.slug}`} className="hover:text-[#00AEEF] transition-colors">{city.name}</Link>
            <ChevronRight size={14} />
            <span className="text-[#00AEEF]">{serviceLabel}</span>
          </div>

          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center mb-6">
              <Scissors size={28} className="text-[#00AEEF]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-[0.95]">
              {serviceLabel} em{' '}
              <span className="bg-gradient-to-r from-[#00AEEF] to-[#2563FF] bg-clip-text text-transparent">
                {city.name}
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-8 leading-relaxed">
              {serviceDesc} em {city.name}, {state.sigla}.
              {hasBarbers ? ` ${barbers.length} barbeiros disponíveis. Agende online!` : ' Cadastre-se e encontre os melhores profissionais.'}
            </p>
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

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Barbers list */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00AEEF]/20 to-[#2563FF]/20 border border-[#00AEEF]/20 flex items-center justify-center">
              <Users size={16} className="text-[#00AEEF]" />
            </div>
            <h2 className="text-2xl font-black">
              {serviceLabel} em {city.name} ({barbers?.length || 0})
            </h2>
          </div>

          {hasBarbers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map((b: any) => (
                <Link
                  key={b.id}
                  to={`/barbeiro/${b.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-[#00AEEF]/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img src={b.avatar || `https://i.pravatar.cc/100?u=${b.id}`} className="w-14 h-14 rounded-full object-cover border-2 border-white/5" />
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-[#00AEEF] transition-colors">{b.name}</h3>
                      <p className="text-sm text-gray-400">{b.shop}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">{b.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <Scissors size={40} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">
                Nenhum profissional encontrado para {serviceLabel.toLowerCase()} em {city.name}.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#2563FF] text-white font-bold px-6 py-3 rounded-full hover:shadow-[0_0_25px_rgba(0,174,239,0.4)] transition-all group"
              >
                Buscar profissionais
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </section>

        {/* Related services */}
        <section>
          <h2 className="text-2xl font-black mb-6">Outros serviços em {city.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(SERVICE_LABELS).filter(([k]) => k !== service).map(([slug, label]) => (
              <Link
                key={slug}
                to={`/servicos/${slug}/${state.slug}/${city.slug}`}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.07] hover:border-[#00AEEF]/20 transition-all"
              >
                <Scissors size={18} className="text-[#00AEEF] mx-auto mb-2" />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyCities?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={18} className="text-emerald-400" />
              <h2 className="text-xl font-black">Cidades próximas</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {nearbyCities.map((c: any) => (
                <Link
                  key={c.slug}
                  to={`/servicos/${service}/${state.slug}/${c.slug}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] hover:border-[#00AEEF]/30 transition-all"
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
