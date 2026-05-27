import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowLeft, Store, Scissors, Camera } from 'lucide-react';

export default function ClaimForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    barberShop: '',
    specialties: [] as string[],
    instagram: '',
    whatsapp: '',
    bio: '',
    confirm: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      navigate(`/auth?redirect=/perfil/${slug}/reivindicar`);
      return;
    }
    fetchLead();
  }, [slug]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/leads/${slug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.claimed) {
          setDone(true);
        }
        setLead(json);
        setForm(f => ({ ...f, barberShop: json.name }));
        document.title = `Reivindicar ${json.name} | Battle Barber`;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.confirm) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/leads/${slug}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        alert(json.error || 'Erro ao reivindicar perfil');
      }
    } catch (e) {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  const SPECIALTIES = ['Corte Masculino', 'Corte Degradê', 'Barba', 'Corte Infantil', 'Hot Towel', 'Barboterapia', 'Design Capilar', 'Hidratação'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil Reivindicado!</h1>
          <p className="text-gray-500 mb-6">
            {lead?.claimed
              ? 'Este perfil já foi reivindicado por outro usuário.'
              : 'Recebemos sua solicitação! Analisaremos em até 48h e entraremos em contato.'}
          </p>
          <Link
            to={`/perfil/${slug}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ver Perfil
          </Link>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <p className="text-gray-500">Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(`/perfil/${slug}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar ao perfil
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Verificar Perfil</h1>
              <p className="text-sm text-gray-500">{lead.name} — {lead.city}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Barber Shop */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Store size={14} className="inline mr-1" />
                Nome da Barbearia
              </label>
              <input
                type="text"
                value={form.barberShop}
                onChange={e => setForm(f => ({ ...f, barberShop: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Camera size={14} className="inline mr-1" />
                Instagram (opcional)
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                placeholder="@seudouradora"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp para Contato
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="(31) 99999-9999"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Scissors size={14} className="inline mr-1" />
                Especialidades
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s],
                    }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.specialties.includes(s)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sobre / Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Conte um pouco sobre sua barbearia..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              />
            </div>

            {/* Confirm */}
            <label className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Confirmo que sou proprietário ou representante autorizado deste estabelecimento
                e que as informações fornecidas são verdadeiras.
              </span>
            </label>

            <button
              type="submit"
              disabled={!form.confirm || submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {submitting ? 'Enviando...' : 'Solicitar Verificação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
