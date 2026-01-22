"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  LayoutDashboard,
  CalendarCheck,
  Users,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";
import { ModeToggle } from "@/components/mode-toggle";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "OdontoVida";
  const currentYear = new Date().getFullYear();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await AuthClientService.login({ email, password });

      if (result.success) {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao realizar login");
      }
    } catch (error) {
      toast.error("Erro inesperado ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding & Value Prop */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-[#0B1120] via-[#0F1729] to-[#0B1120] text-white flex-col justify-between p-12 overflow-hidden">

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
          {/* Animated Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 animate-pulse"></div>
          
          {/* Floating Gradient Orbs - Multiple layers */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/15 to-transparent rounded-full blur-[80px] animate-float-slow"></div>
          
          {/* Animated Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-blue-400/40 rounded-full animate-particle-1"></div>
            <div className="absolute top-[60%] left-[30%] w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-particle-2"></div>
            <div className="absolute top-[40%] right-[20%] w-2 h-2 bg-purple-400/40 rounded-full animate-particle-3"></div>
            <div className="absolute top-[80%] right-[40%] w-1 h-1 bg-cyan-400/50 rounded-full animate-particle-4"></div>
            <div className="absolute top-[30%] left-[60%] w-1.5 h-1.5 bg-blue-300/35 rounded-full animate-particle-5"></div>
          </div>
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        </div>

        {/* Header - Animated */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm hover:scale-110 transition-transform duration-300">
              <LogIn className="w-6 h-6 text-blue-400" />
            </div>
            {clinicName}
          </div>
        </div>

        {/* Main Content - Animated */}
        <div className="relative z-10 max-w-2xl space-y-8 mt-12 animate-fade-in-up animation-delay-200">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Gerencie sua clínica de forma <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">profissional</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            Uma suíte completa de ferramentas para você controlar agendamentos,
            otimizar o atendimento e maximizar o desempenho da sua clínica.
          </p>
          
          {/* Sparkle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Sistema 100% em nuvem</span>
          </div>
        </div>

        {/* Feature Cards - Animated */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-auto pt-12 animate-fade-in-up animation-delay-400">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/50 hover:scale-105 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Gestão Completa</h3>
            <p className="text-xs text-slate-500">Controle total da operação</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/50 hover:scale-105 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Agenda Inteligente</h3>
            <p className="text-xs text-slate-500">Organização eficiente</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/50 hover:scale-105 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Pacientes</h3>
            <p className="text-xs text-slate-500">Histórico e prontuários</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white dark:bg-zinc-950 relative">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 animate-fade-in">
          <ModeToggle />
        </div>
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-lg font-bold animate-fade-in">
          <div className="p-1.5 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-gray-900 dark:text-gray-100">{clinicName}</span>
        </div>

        <div className="w-full max-w-[400px] space-y-8 animate-fade-in-up animation-delay-100">
          <div className="space-y-2 text-center lg:text-left mt-16 lg:mt-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Insira suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${emailFocused ? 'text-blue-600 scale-110' : 'text-gray-400'}`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    disabled={isLoading}
                    className={`pl-10 h-12 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 transition-all duration-300 ${emailFocused ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha
                  </Label>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${passwordFocused ? 'text-blue-600 scale-110' : 'text-gray-400'}`} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    disabled={isLoading}
                    className={`pl-10 h-12 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 transition-all duration-300 ${passwordFocused ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20' : ''}`}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Acessando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Entrar no Sistema</span>
                  <LogIn className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="px-8 text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
            Sistema restrito. Apenas usuários autorizados da {clinicName}.
          </p>

          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-gray-400 font-medium">
              Desenvolvido com <span className="text-sm align-middle mx-0.5">💙</span> por AutomateAI
            </p>
            <p className="text-xs text-gray-400">
              © {currentYear} {clinicName}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(1.15);
          }
          66% {
            transform: translate(25px, -25px) scale(0.85);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(20px, -20px) rotate(5deg);
          }
        }

        @keyframes particle-1 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.4;
          }
          50% {
            transform: translate(100px, -80px);
            opacity: 0.8;
          }
        }

        @keyframes particle-2 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate(-60px, 100px);
            opacity: 0.7;
          }
        }

        @keyframes particle-3 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.4;
          }
          50% {
            transform: translate(-80px, -60px);
            opacity: 0.9;
          }
        }

        @keyframes particle-4 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.5;
          }
          50% {
            transform: translate(70px, 50px);
            opacity: 0.8;
          }
        }

        @keyframes particle-5 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.35;
          }
          50% {
            transform: translate(-50px, -70px);
            opacity: 0.75;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        .animate-particle-1 {
          animation: particle-1 15s ease-in-out infinite;
        }

        .animate-particle-2 {
          animation: particle-2 18s ease-in-out infinite;
        }

        .animate-particle-3 {
          animation: particle-3 20s ease-in-out infinite;
        }

        .animate-particle-4 {
          animation: particle-4 16s ease-in-out infinite;
        }

        .animate-particle-5 {
          animation: particle-5 22s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
