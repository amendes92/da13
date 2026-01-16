
import React, { useState } from 'react';
import { Truck, Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call and Auth Logic
    setTimeout(() => {
      setIsLoading(false);
      // Mock logic: if email contains "motorista" or "driver", login as driver
      if (email.toLowerCase().includes('motorista') || email.toLowerCase().includes('driver')) {
        onLogin(UserRole.DRIVER);
      } else {
        onLogin(UserRole.CLIENT);
      }
    }, 1500);
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Dynamic Background */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-orange rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={onBack}
          className="absolute -top-20 left-0 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-orange rounded-3xl mb-6 shadow-2xl shadow-orange-500/20 transform rotate-3 border-4 border-slate-800">
                <Truck size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Bem-vindo</h1>
            <p className="text-slate-400 font-medium">Entre para gerenciar seus fretes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent focus:bg-slate-800 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Senha</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-orange transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent focus:bg-slate-800 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" className="text-sm text-brand-orange hover:text-orange-300 font-bold transition-colors">
              Esqueci a senha
            </button>
          </div>

          <Button 
            variant="cta" 
            fullWidth 
            type="submit" 
            disabled={isLoading}
            className="h-14 text-lg font-bold shadow-lg shadow-orange-500/20 mt-4"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Entrar'}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <p className="text-slate-500 text-sm">Ainda não tem conta?</p>
             <button onClick={onBack} className="text-white font-bold hover:text-brand-orange transition-colors mt-1">
                 Voltar e fazer Cotação Rápida
             </button>
        </div>
      </div>
    </div>
  );
};
