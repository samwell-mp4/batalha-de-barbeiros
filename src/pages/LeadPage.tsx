import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, Shield, CheckCircle, Clock, ExternalLink, Award, Scissors, ThumbsUp } from 'lucide-react';

const COMMON_SERVICES = [
  'Corte Masculino', 'Corte Degradê', 'Barba', 'Corte Infantil',
  'Hot Towel', 'Barboterapia', 'Design Capilar', 'Hidratação',
  'Corte Navalhado', 'Pigmentação Capilar', 'Sobrancelha',
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
}

export default function LeadPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/leads/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `${json.name} - ${json.city || ''} | Battle Barber`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', `${json.name} em ${json.city || ''}${json.state ? ` - ${json.state}` : ''}. Avaliação ${(json.rating || 0).toFixed(1)}. Verifique seu perfil gratuito e receba clientes online.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = () => {
    const token = localStorage.getItem('token');
    if (token) navigate(`/perfil/${slug}/reivindicar`);
    else navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
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
        <MapPin size={48} className="text-gray-300" />
        <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
        <p className="text-gray-500">Este link pode estar expirado ou inválido.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Voltar ao início</Link>
      </div>
    );
  }

  const { name, address, rating, reviewCount, website, claimed, verified, neighborhood, city, state } = data;
  const citySlug = slugify(city || '');
  const stateSlug = slugify(state || 'mg');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb — SEO */}
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 pt-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-gray-500" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" itemProp="item" className="hover:text-blue-600"><span itemProp="name">Início</span></Link>
            <meta itemProp="position" content="1" />
          </li>
          <ChevronRight size={14} />
          {city && (
            <>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to={`/barbearias/${stateSlug}/${citySlug}`} itemProp="item" className="hover:text-blue-600">
                  <span itemProp="name">Barbearias em {city}</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <ChevronRight size={14} />
            </>
          )}
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name" className="text-blue-600 font-medium">{name}</span>
            <meta itemProp="position" content={String(city ? 3 : 2)} />
          </li>
        </ol>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* HERO */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 sm:px-10 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{name}</h1>
                  {verified ? (
                    <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-400/30">
                      <CheckCircle size={14} /> Verificado
                    </span>
                  ) : claimed ? (
                    <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-400/30">
                      <Clock size={14} /> Pendente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Award size={14} /> Perfil Gratuito
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-white">{rating?.toFixed(1)}</span>
                    <span className="text-white/60">({reviewCount || 0} avaliações)</span>
                  </div>
                  {city && <span className="text-white/60">• {city}{state ? `, ${state}` : ''}</span>}
                </div>
              </div>
              {!claimed && (
                <button onClick={handleClaim} className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                  <Shield size={18} /> Verificar meu Perfil
                </button>
              )}
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-8">
            {/* CTA Banner */}
            {!claimed && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Award size={24} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Você foi selecionado!</p>
                    <p className="text-sm text-blue-700">Seu estabelecimento tem alta relevância em {city || 'sua região'}. Verifique seu perfil gratuitamente.</p>
                  </div>
                </div>
                <button onClick={handleClaim} className="shrink-0 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-center">
                  Verificar Agora
                </button>
              </div>
            )}

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Address */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  Endereço
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{address}</p>
                <p className="text-gray-500 text-sm mt-1">{neighborhood ? `${neighborhood} - ` : ''}{city}{state ? `, ${state}` : ''}</p>
              </div>

              {/* Rating */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <Star size={18} className="text-yellow-500" />
                  Avaliação
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">{rating?.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={16} className={i <= Math.round(rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{reviewCount || 0} avaliações</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <Shield size={18} className="text-emerald-600" />
                  Status
                </h2>
                {verified ? (
                  <div className="flex items-center gap-2 text-emerald-700"><CheckCircle size={18} /><span className="font-medium">Perfil Verificado</span></div>
                ) : claimed ? (
                  <div className="flex items-center gap-2 text-amber-700"><Clock size={18} /><span className="font-medium">Aguardando verificação</span></div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Disponível para reivindicação</p>
                    <button onClick={handleClaim} className="text-blue-600 font-medium text-sm hover:underline">Verificar meu Perfil →</button>
                  </div>
                )}
              </div>

              {/* Website */}
              {website && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                    <ExternalLink size={18} className="text-blue-600" />
                    Site / Redes
                  </h2>
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium break-all">
                    {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Serviços oferecidos</h2>
          <p className="text-sm text-gray-500 mb-5">
            Esta barbearia pode oferecer os seguintes serviços. {!claimed && 'Reivindique o perfil para confirmar.'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {COMMON_SERVICES.map(s => (
              <div key={s} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                <Scissors size={14} className="text-blue-600 shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* MAPA — estático (sem lat/lng) */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Localização</h2>
            <p className="text-sm text-gray-500 mb-4">{address}</p>
          </div>
          <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
              <p>Mapa disponível após verificação do perfil</p>
              <p className="text-xs text-gray-400 mt-1">{neighborhood ? `${neighborhood} - ` : ''}{city}{state ? `, ${state}` : ''}</p>
            </div>
          </div>
        </section>

        {/* AVALIAÇÕES */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Avaliações</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{rating?.toFixed(1)}</div>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className={i <= Math.round(rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-1">{reviewCount || 0} avaliações</div>
            </div>
            <div className="flex-1 space-y-2">
              {[5,4,3,2,1].map(nota => {
                const pct = nota === 5 ? 60 : nota === 4 ? 25 : nota === 3 ? 10 : nota === 2 ? 3 : 2;
                return (
                  <div key={nota} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 w-3">{nota}</span>
                    <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          {!claimed && (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">
                <ThumbsUp size={16} className="inline mr-1 text-blue-600" />
                Reivindique este perfil para gerenciar as avaliações e responder aos clientes.
              </p>
            </div>
          )}
        </section>

        {/* SEO TEXT */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {name} — Barbearia em {city}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {name} está localizada em {address}. Com {rating?.toFixed(1)} estrelas de avaliação
            {reviewCount > 0 ? ` (${reviewCount} avaliações)` : ''},
            é uma das barbearias em destaque em {city}{state ? `, ${state}` : ''}.
            Agende seu horário pelo Battle Barber.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Serviços disponíveis</h3>
          <p className="text-sm text-gray-600">Corte masculino, degradê, barba, hot towel, barboterapia, design capilar e mais.</p>
          {neighborhood && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Bairro {neighborhood}</h3>
              <p className="text-sm text-gray-600">Localizada no bairro {neighborhood} em {city}{state ? `, ${state}` : ''}.</p>
            </>
          )}
        </section>

        {/* CTA FINAL */}
        {!claimed && (
          <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 sm:p-10 text-center text-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Este é seu estabelecimento?</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              Reivindique seu perfil gratuito e apareça para centenas de clientes em {city}.
              Agendamento online, avaliações, fotos e muito mais.
            </p>
            <button onClick={handleClaim} className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
              <Shield size={20} /> Verificar meu Perfil — é gratuito
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
