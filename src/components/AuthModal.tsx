import React, { useState, useEffect } from 'react';
import { 
  X, LogIn, UserPlus, ShieldCheck, Mail, Lock, 
  User, Phone, Eye, EyeOff, AlertCircle, CheckCircle2,
  Briefcase
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'client' | 'register' | 'professional' | 'admin';
  onLoginSuccess: (role: UserRole, user?: { id?: string; name: string; email?: string; role?: UserRole; stylistId?: string }, token?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'client',
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'register' | 'professional' | 'admin'>('client');
  
  // Client login state
  const [clientIdentifier, setClientIdentifier] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Professional state
  const [proIdentifier, setProIdentifier] = useState('');
  const [proPassword, setProPassword] = useState('');

  // Admin state
  const [adminIdentifier, setAdminIdentifier] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Client Login
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'client',
          email: clientIdentifier.trim(),
          password: clientPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Credenciais inválidas. Verifique seu login e senha.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Bem-vindo(a), ${data.user?.name || 'Cliente'}!`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess('client', data.user, data.token);
        onClose();
      }, 400);
    } catch {
      setErrorMessage('Erro de comunicação com o servidor. Tente novamente.');
      setIsLoading(false);
    }
  };

  // Handle Client Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Falha ao realizar cadastro.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Cadastro concluído com sucesso! Bem-vindo(a), ${regName}.`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess('client', data.user, data.token);
        onClose();
      }, 500);
    } catch {
      setErrorMessage('Erro ao conectar com o servidor para criar a conta.');
      setIsLoading(false);
    }
  };

  // Handle Professional Login
  const handleProfessionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proIdentifier.trim() || !proPassword) {
      setErrorMessage('Informe seu e-mail de profissional e sua senha.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'professional',
          email: proIdentifier.trim(),
          password: proPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Credenciais de profissional incorretas ou não autorizadas.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Acesso autorizado! Bem-vindo(a), ${data.user?.name || 'Profissional'}.`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess('professional', data.user, data.token);
        onClose();
      }, 400);
    } catch {
      setErrorMessage('Erro ao validar acesso do profissional com o servidor.');
      setIsLoading(false);
    }
  };

  // Handle Admin Login (Preserves provisional admin credentials 'admin' / 'admin123' through verified cryptographic authentication)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminPassword.trim()) {
      setErrorMessage('Informe a senha de administrador.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'admin',
          username: adminIdentifier.trim(),
          email: adminIdentifier.trim(),
          password: adminPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Acesso negado: Administrador não autorizado.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Acesso administrativo autorizado! Carregando Painel Master...');
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess('admin', data.user, data.token);
        onClose();
      }, 400);
    } catch {
      setErrorMessage('Erro de validação com o servidor administrativo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              {activeTab === 'admin' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : activeTab === 'professional' ? (
                <Briefcase className="w-4 h-4" />
              ) : activeTab === 'register' ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {activeTab === 'admin' 
                  ? 'Acesso Administrativo' 
                  : activeTab === 'professional' 
                  ? 'Acesso da Equipe' 
                  : activeTab === 'register' 
                  ? 'Criar Conta' 
                  : 'Área do Cliente'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'admin' 
                  ? 'Autenticação com credencial gestora' 
                  : activeTab === 'professional' 
                  ? 'Acesso individual aos profissionais' 
                  : activeTab === 'register' 
                  ? 'Cadastre-se para agendar com exclusividade' 
                  : 'Entre com seu e-mail e senha'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs - 4 Profiles */}
        <div className="shrink-0 grid grid-cols-4 bg-slate-950/80 p-1.5 border-b border-slate-800 text-[11px] font-semibold gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('client'); setErrorMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'client' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LogIn className="w-3 h-3" />
            <span>Cliente</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'register' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>Cadastro</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('professional'); setErrorMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'professional' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Equipe</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrorMessage(null); }}
            className={`py-2 px-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'admin' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: CLIENT LOGIN */}
          {activeTab === 'client' && (
            <form onSubmit={handleClientLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail ou Usuário do Cliente
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clientIdentifier}
                    onChange={(e) => setClientIdentifier(e.target.value)}
                    placeholder="camila@lelite.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Novo por aqui? Cadastre-se
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    placeholder="Digite sua senha cadastrada"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Autenticando...' : 'Entrar na Minha Conta'}</span>
              </button>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Conta cadastrada para testes:</span> e-mail <span className="font-mono text-amber-400 font-bold">camila@lelite.com.br</span> e senha <span className="font-mono text-amber-400 font-bold">cliente123</span>.
              </div>
            </form>
          )}

          {/* TAB 2: CLIENT REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Larissa Martins"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail de Acesso *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp / Celular
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mín. 6 dígitos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Cadastrando...' : 'Criar Minha Conta & Acessar'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: PROFESSIONAL LOGIN */}
          {activeTab === 'professional' && (
            <form onSubmit={handleProfessionalLogin} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Área dos Especialistas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Acesso individualizado à sua agenda de atendimentos, comissões diárias e notas de clientes.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail do Profissional Cadastrado *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={proIdentifier}
                    onChange={(e) => setProIdentifier(e.target.value)}
                    placeholder="juliana@lelite.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha Individual *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={proPassword}
                    onChange={(e) => setProPassword(e.target.value)}
                    placeholder="Digite sua senha de profissional"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <Briefcase className="w-4 h-4" />
                <span>{isLoading ? 'Autenticando...' : 'Acessar Painel do Profissional'}</span>
              </button>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Profissionais cadastrados para testes:</span>
                <div className="mt-1 space-y-0.5 font-mono text-[10px] text-amber-400">
                  <p>• juliana@lelite.com.br (Juliana Vance) / senha: pro123</p>
                  <p>• carlos@lelite.com.br (Carlos Mendes) / senha: pro123</p>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: ADMIN ACCESS */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Acesso Restrito ao Gestor Master</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  O painel administrativo possui controle integral de receitas, serviços, equipe, banners e configurações. A autenticação é validada no servidor com token criptográfico.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Usuário ou E-mail do Administrador *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="admin ou admin@lelite.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha de Administrador Autorizado *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Digite a senha autorizada"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Credencial administrativa provisória preservada: <span className="text-amber-400 font-mono font-bold">admin</span> / <span className="text-amber-400 font-mono font-bold">admin123</span>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'Verificando Autorização...' : 'Autenticar & Acessar Painel Master'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
