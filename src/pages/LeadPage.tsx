import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, Shield, CheckCircle, Clock, ExternalLink, Award, Store } from 'lucide-react';

export default function LeadPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/leads/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        document.title = `${json.name} - ${json.city} | Battle Barber`;
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
        <Store size={48} className="text-gray-300" />
        <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
        <p className="text-gray-500">Este link pode estar expirado ou inválido.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Voltar ao início</Link>
      </div>
    );
  }

  const { name, address, rating, reviewCount, website, category, claimed, verified, neighborhood, city, state } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
          <ChevronRight size={14} />
          <span className="text-gray-400">{city}</span>
          <ChevronRight size={14} />
          <span className="text-blue-600 font-medium">{name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 sm:px-10 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{name}</h1>
                  {verified ? (
                    <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-400/30">
                      <CheckCircle size={14} />
                      Verificado
                    </span>
                  ) : claimed ? (
                    <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-400/30">
                      <Clock size={14} />
                      Pendente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Award size={14} />
                      Perfil Gratuito
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-white">{rating?.toFixed(1)}</span>
                    <span className="text-white/60">({reviewCount} avaliações)</span>
                  </div>
                  {category && (
                    <span className="text-white/60 hidden sm:inline">• {category}</span>
                  )}
                </div>
              </div>
              {!claimed && (
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      if (token) {
                        navigate(`/perfil/${slug}/reivindicar`);
                      } else {
                        navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
                  >
                    <Shield size={18} />
                    Verificar meu Perfil
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8">
            {/* Status Bar for unclaimed */}
            {!claimed && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Award size={24} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Você foi selecionado!</p>
                    <p className="text-sm text-blue-700">
                      Seu estabelecimento tem alta relevância em {city}. Verifique seu perfil gratuitamente.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (token) navigate(`/perfil/${slug}/reivindicar`);
                    else navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
                  }}
                  className="shrink-0 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Verificar Agora
                </button>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Address */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  Endereço
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{address}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {neighborhood ? `${neighborhood} - ` : ''}{city}{state ? `, ${state}` : ''}
                </p>
              </div>

              {/* Rating details */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <Star size={18} className="text-yellow-500" />
                  Avaliação
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">{rating?.toFixed(1)}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={16} className={i <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{reviewCount} avaliações</span>
                  </div>
                </div>
              </div>

              {/* Website */}
              {website && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                    <ExternalLink size={18} className="text-blue-600" />
                    Site
                  </div>
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium break-all"
                  >
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                  <Shield size={18} className="text-emerald-600" />
                  Status do Perfil
                </div>
                {verified ? (
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle size={18} />
                    <span className="font-medium">Perfil Verificado</span>
                  </div>
                ) : claimed ? (
                  <div className="flex items-center gap-2 text-amber-700">
                    <Clock size={18} />
                    <span className="font-medium">Aguardando verificação</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Perfil disponível para reivindicação</p>
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        if (token) navigate(`/perfil/${slug}/reivindicar`);
                        else navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
                      }}
                      className="text-blue-600 font-medium text-sm hover:underline"
                    >
                      Verificar meu Perfil →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!claimed && (
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-8 sm:p-10 text-center text-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Este é seu estabelecimento?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              Reivindique seu perfil gratuito e apareça para centenas de clientes em {city}.
              Agendamento online, avaliações e muito mais.
            </p>
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                if (token) navigate(`/perfil/${slug}/reivindicar`);
                else navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
              }}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              <Shield size={20} />
              Verificar meu Perfil — é gratuito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
