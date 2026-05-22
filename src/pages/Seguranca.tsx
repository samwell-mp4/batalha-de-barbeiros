import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Key, Lock, Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Seguranca() {
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFactor, setTwoFactor] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try { const p = JSON.parse(saved); return p?.id ? p : null; } catch { return null; }
  }, []);

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPasswordMsg('Preencha todos os campos');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordMsg('Nova senha e confirmação não conferem');
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordMsg('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (!user) {
      setPasswordMsg('Usuário não encontrado');
      return;
    }
    setChangingPassword(true);
    setPasswordMsg('');
    try {
      const result = await api.changePassword(user.id, {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      if (result.error) {
        setPasswordMsg(result.error);
      } else {
        setPasswordMsg('Senha alterada com sucesso!');
        setPasswords({ current: '', newPass: '', confirm: '' });
      }
    } catch (e: any) {
      setPasswordMsg('Erro ao alterar senha: ' + (e.message || 'Erro de conexão'));
    } finally {
      setChangingPassword(false);
    }
  };

  const sessions = [
    { device: 'Dispositivo Atual', local: navigator.language || 'pt-BR', active: true, current: true },
  ];

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Central de Segurança</h1>
          <p className="text-xs text-gray-500">Proteja sua conta</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Shield size={24} className="text-blue-200" />
          <div>
            <p className="text-sm font-bold">Nível de Segurança</p>
            <p className="text-xs text-blue-200">Sua conta está protegida</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 mb-1">
          <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '70%' }} />
        </div>
        <p className="text-xs text-blue-200">70% — Recomendamos ativar 2FA</p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Alterar Senha</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              placeholder="Senha atual"
              value={passwords.current}
              onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 pr-12 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              placeholder="Nova senha"
              value={passwords.newPass}
              onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 pr-12 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              placeholder="Confirmar nova senha"
              value={passwords.confirm}
              onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 pr-12 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {passwordMsg && (
            <p className={`text-xs font-medium text-center ${passwordMsg.includes('sucesso') ? 'text-emerald-600' : 'text-red-500'}`}>
              {passwordMsg}
            </p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-medium transition-all text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {changingPassword ? <><Loader2 size={14} className="animate-spin" /> Alterando...</> : 'Atualizar Senha'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Autenticação de Dois Fatores</h3>
            <p className="text-[10px] text-gray-400">Proteção extra para sua conta</p>
          </div>
          <button
            onClick={() => setTwoFactor(!twoFactor)}
            className={`relative w-11 h-6 rounded-full transition-all ${twoFactor ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${twoFactor ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
        <div className="px-5 py-4 flex items-center gap-3 text-sm text-gray-500">
          <Smartphone size={16} />
          <span>Receba códigos via SMS ou autenticador</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Dispositivos Conectados</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.active ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                  <Smartphone size={14} className={s.active ? 'text-emerald-600' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {s.device}
                    {s.current && <span className="text-[10px] text-blue-600 font-medium ml-1">(este dispositivo)</span>}
                  </p>
                  <p className="text-[10px] text-gray-400">{s.local}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
